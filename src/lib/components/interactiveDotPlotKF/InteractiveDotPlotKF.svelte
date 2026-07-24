<script>
  import * as d3 from 'd3';
  import {
    draw,
    fade
  } from 'svelte/transition';

  import DotPlotAxisKF from './DotPlotAxisKF.svelte';
  import DotPlotLegendKF from './DotPlotLegendKF.svelte';
  import DotPlotTooltip from './DotPlotTooltip.svelte';

  import {
    SourceData,
    createLongData,
    segments,
    segmentOptions,
    historicalJobLevelIndex,
    createHistoryKey
  } from '$lib/datasets/dotplotKFdata';

  let {
    sourceData = SourceData,
    initialSegment = 'Job Level'
  } = $props();

  /*
   * The main chart always displays 2026.
   * Historical years are shown in the tooltip where
   * matching Job Level data is available.
   */
  const selectedYear = 2026;

  let selectedSegment = $state(
    initialSegment
  );

  let selectedCohorts = $state([]);
  let hoveredCohort = $state(null);
  let hoveredPoint = $state(null);

  let tooltipX = $state(0);
  let tooltipY = $state(0);

  let containerWidth = $state(900);

  /*
   * The TSV is ordered by New job, Stay and Leave.
   * The chart is displayed by topic first.
   */
  const topicOrder = [
    'Pay and compensation',
    'Employee benefits',
    'Job security',
    'The work itself',
    'Fair treatment and consistency'
  ];

  const responseOrder = [
    '#1 reason to join',
    '#1 reason to stay',
    '#1 reason to leave'
  ];

  const orderedSourceData = $derived.by(() => {
    return [...sourceData].sort((a, b) => {
      const topicA =
        topicOrder.indexOf(a.topic);

      const topicB =
        topicOrder.indexOf(b.topic);

      const normalisedTopicA =
        topicA === -1
          ? Number.MAX_SAFE_INTEGER
          : topicA;

      const normalisedTopicB =
        topicB === -1
          ? Number.MAX_SAFE_INTEGER
          : topicB;

      const topicDifference =
        normalisedTopicA -
        normalisedTopicB;

      if (topicDifference !== 0) {
        return topicDifference;
      }

      const responseA =
        responseOrder.indexOf(
          a.response
        );

      const responseB =
        responseOrder.indexOf(
          b.response
        );

      const normalisedResponseA =
        responseA === -1
          ? Number.MAX_SAFE_INTEGER
          : responseA;

      const normalisedResponseB =
        responseB === -1
          ? Number.MAX_SAFE_INTEGER
          : responseB;

      return (
        normalisedResponseA -
        normalisedResponseB
      );
    });
  });

  /*
   * Subsegments displayed in the comparison legend.
   */
  const cohorts = $derived(
    segmentOptions[selectedSegment] ?? []
  );

  /*
   * Only the plotted marks change when the segment
   * changes. The topic and response rows remain fixed.
   */
  const currentDots = $derived(
    createLongData(
      orderedSourceData,
      selectedSegment
    )
  );

  const cohortPoints = $derived(
    currentDots.filter(
      (point) =>
        point.cohort !== 'Total'
    )
  );

  const totalPoints = $derived(
    currentDots.filter(
      (point) =>
        point.cohort === 'Total'
    )
  );

  /*
   * At desktop sizes, use the full width up to 900px.
   * On narrow screens, retain a minimum readable width.
   */
  const minimumSvgWidth = 700;

  const width = $derived(
    Math.max(
      minimumSvgWidth,
      Math.min(
        900,
        containerWidth
      )
    )
  );

  const margin = {
    top: 92,
    right: 30,
    bottom: 48,
    left: 30
  };

  const rowHeight = 60;
  const topicGap = 58;

  function createRowKey(
    topic,
    response,
    rowIndex
  ) {
    return `${rowIndex}|||${topic}|||${response}`;
  }

  const rowKeys = $derived(
    orderedSourceData.map(
      (row, rowIndex) =>
        createRowKey(
          row.topic,
          row.response,
          rowIndex
        )
    )
  );

  /*
   * Build a stable grey range using all 2026
   * subsegments, not only the selected segment.
   */
  const allSegmentDots = $derived(
    segments.flatMap((segment) =>
      createLongData(
        orderedSourceData,
        segment
      ).filter(
        (point) =>
          point.cohort !== 'Total'
      )
    )
  );

  const fixedRowGroups = $derived(
    d3.group(
      allSegmentDots,
      (point) =>
        createRowKey(
          point.topic,
          point.response,
          point.rowIndex
        )
    )
  );

  const topicGroups = $derived.by(() => {
    const groups = [];
    let currentGroup = null;

    orderedSourceData.forEach(
      (row, rowIndex) => {
        if (
          !currentGroup ||
          currentGroup.topic !== row.topic
        ) {
          currentGroup = {
            topic: row.topic,
            startIndex: rowIndex,
            endIndex: rowIndex
          };

          groups.push(currentGroup);
        }

        currentGroup.endIndex =
          rowIndex;
      }
    );

    return groups;
  });

  function isTopicStart(rowIndex) {
    return topicGroups.some(
      (group) =>
        group.startIndex === rowIndex
    );
  }

  function getTopicGapBefore(rowIndex) {
    return (
      topicGroups.filter(
        (group) =>
          group.startIndex > 0 &&
          group.startIndex <= rowIndex
      ).length * topicGap
    );
  }

  function getRowY(rowIndex) {
    return (
      margin.top +
      rowIndex * rowHeight +
      getTopicGapBefore(rowIndex)
    );
  }

  const plotBottom = $derived(
    orderedSourceData.length > 0
      ? getRowY(
          orderedSourceData.length - 1
        ) + 30
      : margin.top
  );

  const height = $derived(
    plotBottom + margin.bottom
  );

  const xScale = $derived(
    d3
      .scaleLinear()
      .domain([0, 100])
      .range([
        margin.left,
        width - margin.right
      ])
  );

  /*
   * Colours represent comparison order.
   */
  const comparisonColours = [
    '#05c690',
    '#007da4'
  ];

  function getCohortColour(cohort) {
    if (cohort === 'Total') {
      return '#111111';
    }

    const selectedIndex =
      selectedCohorts.indexOf(cohort);

    if (selectedIndex >= 0) {
      return comparisonColours[
        selectedIndex %
          comparisonColours.length
      ];
    }

    if (hoveredCohort === cohort) {
      return comparisonColours[0];
    }

    return '#8f9995';
  }

  /*
   * Hover displays a vertical connecting line only
   * when no cohort has been selected.
   */
  const hoverSeries = $derived.by(() => {
    if (
      !hoveredCohort ||
      selectedCohorts.length > 0
    ) {
      return [];
    }

    return cohortPoints
      .filter(
        (point) =>
          point.cohort === hoveredCohort
      )
      .sort(
        (a, b) =>
          a.rowIndex -
          b.rowIndex
      );
  });

  const hoverLineGenerator = $derived(
    d3
      .line()
      .x(
        (point) =>
          xScale(point.value)
      )
      .y(
        (point) =>
          getRowY(point.rowIndex)
      )
      .curve(
        d3.curveCatmullRom.alpha(
          0.5
        )
      )
  );

  const hoverLinePath = $derived(
    hoverSeries.length > 1
      ? hoverLineGenerator(
          hoverSeries
        )
      : null
  );

  const selectedSeries = $derived(
    selectedCohorts.map((cohort) => ({
      cohort,

      points: cohortPoints
        .filter(
          (point) =>
            point.cohort === cohort
        )
        .sort(
          (a, b) =>
            a.rowIndex -
            b.rowIndex
        )
    }))
  );

  /*
   * Build one horizontal gradient comparison for
   * every chart row.
   */
  const comparisonRows = $derived.by(() => {
    if (selectedSeries.length !== 2) {
      return [];
    }

    const [
      firstSeries,
      secondSeries
    ] = selectedSeries;

    return rowKeys
      .map((rowKey, rowIndex) => {
        const firstPoint =
          firstSeries.points.find(
            (point) =>
              point.rowIndex === rowIndex
          );

        const secondPoint =
          secondSeries.points.find(
            (point) =>
              point.rowIndex === rowIndex
          );

        if (
          !firstPoint ||
          !secondPoint
        ) {
          return null;
        }

        return {
          rowKey,
          rowIndex,
          firstCohort:
            firstSeries.cohort,
          secondCohort:
            secondSeries.cohort,
          firstPoint,
          secondPoint
        };
      })
      .filter(Boolean);
  });

  /*
   * Historical tooltip comparison.
   *
   * Matching 2024 and 2025 values currently exist
   * only for Job Level.
   */
  const tooltipHistory = $derived.by(() => {
    if (!hoveredPoint) {
      return [];
    }

    const currentValue = {
      year: 2026,
      cohort:
        hoveredPoint.cohort,
      value:
        hoveredPoint.value
    };

    /*
    * Historical values are displayed only for
    * Job Level cohorts.
    */
    if (
      selectedSegment !==
        'Job Level' ||
      hoveredPoint.cohort ===
        'Total'
    ) {
      return [currentValue];
    }

    const historyKey =
      createHistoryKey(
        hoveredPoint.topic,
        hoveredPoint.response
      );

    const historicalValues =
      [2024, 2025]
        .map((year) => {
          const value =
            historicalJobLevelIndex[
              year
            ]?.[historyKey]?.[
              hoveredPoint.cohort
            ];

          if (
            !Number.isFinite(value)
          ) {
            return null;
          }

          return {
            year,
            cohort:
              hoveredPoint.cohort,
            value
          };
        })
        .filter(Boolean);

    return [
      ...historicalValues,
      currentValue
    ].sort(
      (a, b) =>
        a.year - b.year
    );
  });

  function selectSegment(segment) {
    selectedSegment = segment;

    /*
     * Previous selections may not exist in the
     * newly selected segment.
     */
    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }

  function selectCohort(cohort) {
    /*
     * Total is a fixed benchmark and cannot be
     * selected as a comparison cohort.
     */
    if (cohort === 'Total') {
      return;
    }

    if (
      selectedCohorts.includes(
        cohort
      )
    ) {
      selectedCohorts =
        selectedCohorts.filter(
          (selected) =>
            selected !== cohort
        );

      return;
    }

    if (
      selectedCohorts.length < 2
    ) {
      selectedCohorts = [
        ...selectedCohorts,
        cohort
      ];

      return;
    }

    /*
     * Replace the oldest selection.
     */
    selectedCohorts = [
      selectedCohorts[1],
      cohort
    ];
  }

  function previewCohort(cohort) {
    hoveredCohort = cohort;
  }

  function clearPreview() {
    hoveredCohort = null;
  }

  function clearSelection() {
    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }

  function showTooltip(
    event,
    point
  ) {
    hoveredPoint = point;

    /*
     * Do not draw a vertical connection for Total.
     */
    hoveredCohort =
      point.cohort === 'Total'
        ? null
        : point.cohort;

    updateTooltipPosition(event);
  }

  function updateTooltipPosition(
    event
  ) {
    tooltipX = event.clientX;
    tooltipY = event.clientY;
  }

  function hideTooltip() {
    hoveredPoint = null;
    hoveredCohort = null;
  }

  function handleDotKeydown(
    event,
    point
  ) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();

      selectCohort(
        point.cohort
      );
    }

    if (event.key === 'Escape') {
      clearSelection();
    }
  }

  function isSelected(cohort) {
    return selectedCohorts.includes(
      cohort
    );
  }

  function isHovered(cohort) {
    return (
      hoveredCohort === cohort
    );
  }

  function isHighlighted(cohort) {
    return (
      isSelected(cohort) ||
      (
        selectedCohorts.length ===
          0 &&
        isHovered(cohort)
      )
    );
  }

  function getDotFill(cohort) {
    if (isHighlighted(cohort)) {
      return getCohortColour(cohort);
    }

    /*
     * Default inactive dots.
     */
    return '#e3e6e5';
  }

  function getDotStroke(cohort) {
    if (isHighlighted(cohort)) {
      return getCohortColour(cohort);
    }

    return '#111111';
  }

  function getDotOpacity(cohort) {
    if (
      selectedCohorts.length === 0
    ) {
      return 1;
    }

    if (
      selectedCohorts.length === 1
    ) {
      return isSelected(cohort)
        ? 1
        : 0.4;
    }

    /*
     * When two cohorts are compared, hide all
     * unselected dots.
     */
    return isSelected(cohort)
      ? 1
      : 0;
  }

  function isDotHidden(cohort) {
    return (
      selectedCohorts.length === 2 &&
      !isSelected(cohort)
    );
  }

  function getDotRadius(cohort) {
    return isHighlighted(cohort)
      ? 9
      : 6;
  }

  function getGradientId(
    rowIndex
  ) {
    return `kf-comparison-gradient-${rowIndex}`;
  }

  function getLabelX(point) {
    return xScale(point.value);
  }

  function getLabelY(
    point,
    cohort
  ) {
    const selectionIndex =
      selectedCohorts.indexOf(
        cohort
      );

    return (
      getRowY(point.rowIndex) +
      20 +
      selectionIndex
    );
  }
</script>

<section class="dot-plot-kf">
  <div class="chart-heading">
    <h2>
      Employee priorities by leadership cohort
    </h2>

    <p>
      Hover over a cohort to follow it across the chart.
      Select one cohort to highlight it, or select two
      to compare their responses.

      The large grey bar behind the circles represents the
      <span class="range-key">
        Range
      </span>
      of values.
    </p>
  </div>

  <div class="sticky-controls">
    <div class="controls">
      <div class="segment-control">
        <p class="control-label">
          View segment
        </p>

        <div
          class="segment-selector"
          role="group"
          aria-label="Select employee segment"
        >
          {#each segments as segment}
            <button
              type="button"
              class:active={
                selectedSegment === segment
              }
              aria-pressed={
                selectedSegment === segment
              }
              onclick={() =>
                selectSegment(segment)}
            >
              {segment}
            </button>
          {/each}
        </div>
      </div>

      <div class="cohort-control">
        <p class="control-label">
          Compare up to two cohorts
        </p>

        <DotPlotLegendKF
          {cohorts}
          {getCohortColour}
          {selectedCohorts}
          {hoveredCohort}
          onSelect={selectCohort}
          onPreview={previewCohort}
          onClearPreview={clearPreview}
        />
      </div>
    </div>

    {#if selectedCohorts.length > 0}
      <button
        type="button"
        class="clear-button"
        onclick={clearSelection}
      >
        Clear comparison
      </button>
    {/if}
  </div>

  <div
    class="chart-wrapper"
    bind:clientWidth={containerWidth}
  >
    <svg
      {width}
      {height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby="kf-dot-plot-title kf-dot-plot-description"
    >
      <title id="kf-dot-plot-title">
        Employee priorities by cohort:
        {selectedSegment}
      </title>

      <desc id="kf-dot-plot-description">
        The chart contains five topic groups with
        three response rows in each group. Hover over
        a cohort to connect its values vertically.
        Select two cohorts to compare each row using
        a horizontal gradient. The black vertical
        marker represents the Total value.
      </desc>

      <defs>
        {#each comparisonRows as comparison}
          <linearGradient
            id={getGradientId(
              comparison.rowIndex
            )}
            gradientUnits="userSpaceOnUse"
            x1={xScale(
              comparison.firstPoint
                .value
            )}
            x2={xScale(
              comparison.secondPoint
                .value
            )}
            y1="0"
            y2="0"
          >
            <stop
              offset="0%"
              stop-color={getCohortColour(
                comparison.firstCohort
              )}
            />

            <stop
              offset="100%"
              stop-color={getCohortColour(
                comparison.secondCohort
              )}
            />
          </linearGradient>
        {/each}
      </defs>

      <DotPlotAxisKF
        {xScale}
        top={margin.top - 55}
        bottom={plotBottom}
      />

      <!-- Fixed topic groups and response rows -->
      <g class="rows">
        {#each rowKeys as rowKey, rowIndex}
          {@const row =
            orderedSourceData[
              rowIndex
            ]}

          {@const rowY =
            getRowY(rowIndex)}

          {@const rangeValues =
            fixedRowGroups.get(
              rowKey
            ) ?? []}

          {@const minimum =
            d3.min(
              rangeValues,
              (point) =>
                point.value
            )}

          {@const maximum =
            d3.max(
              rangeValues,
              (point) =>
                point.value
            )}

          <g class="response-row">
            {#if isTopicStart(rowIndex)}
              <text
                class="topic-label"
                x={margin.left}
                y={rowY - 44}
              >
                {row.topic}
              </text>
            {/if}

            <line
              class="row-guide"
              x1={margin.left}
              x2={width -
                margin.right}
              y1={rowY}
              y2={rowY}
            />

            {#if
              Number.isFinite(
                minimum
              ) &&
              Number.isFinite(
                maximum
              )
            }
              <line
                class="range-line"
                x1={xScale(
                  minimum
                )}
                x2={xScale(
                  maximum
                )}
                y1={rowY}
                y2={rowY}
              />
            {/if}
          </g>
        {/each}
      </g>

      <!-- Horizontal comparison gradients -->
      {#if comparisonRows.length > 0}
        <g class="comparison-lines">
          {#each comparisonRows as comparison}
            <line
              class="comparison-line-outline"
              x1={xScale(
                comparison.firstPoint
                  .value
              )}
              x2={xScale(
                comparison.secondPoint
                  .value
              )}
              y1={getRowY(
                comparison.rowIndex
              )}
              y2={getRowY(
                comparison.rowIndex
              )}
            />

            <line
              class="comparison-line"
              x1={xScale(
                comparison.firstPoint
                  .value
              )}
              x2={xScale(
                comparison.secondPoint
                  .value
              )}
              y1={getRowY(
                comparison.rowIndex
              )}
              y2={getRowY(
                comparison.rowIndex
              )}
              stroke={`url(#${getGradientId(
                comparison.rowIndex
              )})`}
              in:draw={{
                duration: 300
              }}
              out:fade={{
                duration: 100
              }}
            />
          {/each}
        </g>
      {/if}

      <!-- Hover-only vertical connection -->
      {#if
        hoverLinePath &&
        hoveredCohort &&
        selectedCohorts.length === 0
      }
        <g
          class="hover-line-group"
          in:fade={{
            duration: 100
          }}
          out:fade={{
            duration: 80
          }}
        >
          <path
            class="hover-line-outline"
            d={hoverLinePath}
          />

          <path
            class="hover-line"
            d={hoverLinePath}
            stroke={getCohortColour(
              hoveredCohort
            )}
            in:draw={{
              duration: 300
            }}
          />
        </g>
      {/if}

      <!-- Response labels -->
      <g class="response-labels">
        {#each orderedSourceData as row, rowIndex}
          <text
            class="response-label"
            x={margin.left}
            y={getRowY(rowIndex) -
              15}
            text-anchor="start"
          >
            {row.response}
          </text>
        {/each}
      </g>

      <!-- Selectable cohort circles -->
      <g class="cohort-dots">
        {#each cohortPoints as point}
          {@const hidden =
            isDotHidden(point.cohort)}

          <circle
            class="dot"
            class:active-dot={
              isHighlighted(point.cohort)
            }
            class:hidden-dot={hidden}
            cx={xScale(point.value)}
            cy={getRowY(point.rowIndex)}
            r={getDotRadius(point.cohort)}
            fill={getDotFill(point.cohort)}
            stroke={getDotStroke(point.cohort)}
            opacity={getDotOpacity(point.cohort)}
            role="button"
            tabindex={hidden ? -1 : 0}
            aria-hidden={hidden}
            aria-label={`${point.cohort}: ${point.value}% — ${point.response}`}
            aria-pressed={
              isSelected(point.cohort)
            }
            onmouseenter={(event) =>
              showTooltip(event, point)}
            onmousemove={
              updateTooltipPosition}
            onmouseleave={hideTooltip}
            onfocus={(event) =>
              showTooltip(event, point)}
            onblur={hideTooltip}
            onclick={(event) => {
              event.stopPropagation();

              selectCohort(
                point.cohort
              );
            }}
            onkeydown={(event) =>
              handleDotKeydown(
                event,
                point
              )}
          >
            <title>
              {point.cohort}:
              {point.value}%
            </title>
          </circle>
        {/each}
      </g>

      <!--
        Total benchmark markers.

        These are rendered after the cohort circles,
        so they always appear visually on top.
      -->
      <g class="total-markers"
        aria-hidden="true"
        >
        {#each totalPoints as point}
          <!-- White outline -->
          <line
            class="total-marker-outline"
            x1={xScale(point.value)}
            x2={xScale(point.value)}
            y1={getRowY(
              point.rowIndex
            ) - 12}
            y2={getRowY(
              point.rowIndex
            ) + 12}
          />

          <!-- Visible black benchmark -->
          <line
            class="total-marker"
            x1={xScale(point.value)}
            x2={xScale(point.value)}
            y1={getRowY(
              point.rowIndex
            ) - 11}
            y2={getRowY(
              point.rowIndex
            ) + 11}
          />
        {/each}
      </g>

      <!-- Values beneath selected circles -->
      {#if selectedSeries.length > 0}
        <g
          class="selected-values"
          in:fade={{
            duration: 160
          }}
          out:fade={{
            duration: 80
          }}
        >
          {#each selectedSeries as series}
            {#each series.points as point}
              <text
                class="value-label"
                x={getLabelX(point)}
                y={getLabelY(
                  point,
                  series.cohort
                )}
                text-anchor="middle"
                fill={getCohortColour(
                  series.cohort
                )}
              >
                {point.value}%
              </text>
            {/each}
          {/each}
        </g>
      {/if}
    </svg>
  </div>

  <DotPlotTooltip
    point={hoveredPoint}
    history={tooltipHistory}
    x={tooltipX}
    y={tooltipY}
    activeYear={selectedYear}
    colour={
      hoveredPoint
        ? getCohortColour(
            hoveredPoint.cohort
          )
        : '#005f73'
    }
  />
</section>

<style>
  .dot-plot-kf {
    width: 100%;
    max-width: 900px;
    margin-inline: auto;
    overflow: visible;

    color: #171a19;

    font-family:
      'gotham',
      Arial,
      sans-serif;
  }

  .chart-heading {
    margin-bottom: 1rem;
  }

  .sticky-controls {
    position: sticky;
    top: 12px;
    z-index: 20;

    display: grid;
    gap: 0.9rem;

    margin-bottom: 1.25rem;
    padding: 1rem;

    border: 1px solid #dfe3e1;
    border-radius: 0.9rem;

    background:
      rgb(255 255 255 / 96%);

    box-shadow:
      0 7px 24px
      rgb(0 0 0 / 8%);

    backdrop-filter:
      blur(8px);

    -webkit-backdrop-filter:
      blur(8px);
  }

  .chart-heading h2 {
    margin: 0;

    font-size:
      clamp(
        1.25rem,
        3vw,
        1.75rem
      );

    line-height: 1.12;
  }

  .chart-heading p {
    max-width: 720px;
    margin: 0.55rem 0 0;

    color: #626866;
    font-size: 0.85rem;
    line-height: 1.45;
  }

  .controls {
    display: grid;
    grid-template-columns:
      minmax(0, 1fr);

    gap: 1rem;
    width: 100%;
  }

  .segment-control,
  .cohort-control {
    width: 100%;
    min-width: 0;
  }

  .control-label {
    margin: 0 0 0.55rem;

    color: #626866;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .segment-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    width: 100%;
  }

  .segment-selector button {
    border: 1px solid #d5dad8;
    border-radius: 999px;
    padding: 0.42rem 0.68rem;

    background: #f3f5f4;
    color: #525856;

    font: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;

    transition:
      border-color 150ms ease,
      background 150ms ease,
      color 150ms ease;
  }

  .segment-selector button:hover,
  .segment-selector button:focus-visible {
    border-color: #8e9995;
    outline: none;
  }

  .segment-selector button.active {
    border-color: #123f37;
    background: #123f37;
    color: white;
  }

  .clear-button {
    justify-self: start;

    border: 1px solid #b9c0bd;
    border-radius: 999px;
    padding: 0.48rem 0.78rem;

    background: white;
    color: #252a28;

    font: inherit;
    font-size: 0.76rem;
    cursor: pointer;
  }

  .range-key {
    display: inline-block;

    margin-left: 0.25rem;
    border-radius: 999px;
    padding: 0.08rem 0.42rem;

    background: #d7d9d8;
    color: #343a37;

    font-size: 0.72rem;
    font-weight: 700;
  }

  .chart-wrapper {
    width: 100%;
    min-width: 0;
    overflow-x: auto;

    overscroll-behavior-inline:
      contain;
  }

  svg {
    display: block;

    width: 100%;
    min-width: 700px;
    height: auto;

    overflow: visible;
    background: white;
  }

  .topic-label {
    fill: #007760;

    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.055em;
    text-transform: uppercase;
  }

  .response-label {
    fill: #202422;

    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;

    pointer-events: none;

    paint-order: stroke;
    stroke: white;
    stroke-width: 4px;
    stroke-linejoin: round;
  }

  .row-guide {
    stroke: #dfe3e1;
    stroke-width: 1;
  }

  .range-line {
    stroke: #d7d9d8;
    stroke-width: 14;
    stroke-linecap: round;
  }

  .comparison-line-outline {
    stroke: white;
    stroke-width: 19;
    stroke-linecap: round;
  }

  .comparison-line {
    stroke-width: 14;
    stroke-linecap: round;
    pointer-events: none;
  }

  .hover-line,
  .hover-line-outline {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
    pointer-events: none;
  }

  .hover-line-outline {
    stroke: white;
    stroke-width: 7;
  }

  .hover-line {
    stroke-width: 3;
  }

  .dot {
    box-sizing: border-box;

    cursor: pointer;
    stroke-width: 1.4;

    transition:
      r 180ms ease,
      fill 180ms ease,
      opacity 240ms ease,
      stroke 180ms ease,
      stroke-width 180ms ease;
  }

  .dot:hover,
  .dot:focus-visible,
  .active-dot {
    stroke-width: 2;
    outline: none;

    filter:
      drop-shadow(
        0 2px 3px
        rgb(0 0 0 / 20%)
      );
  }

  .hidden-dot {
    pointer-events: none;
  }

  /*
   * White outline behind the Total marker keeps it
   * legible over grey ranges, dots and gradients.
   */
  .total-marker-outline {
    stroke: white;
    stroke-width: 7;
    stroke-linecap: round;
  }

  .total-marker {
    stroke: #111111;
    stroke-width: 3;
    stroke-linecap: round;
  }

  .total-markers {
    pointer-events: none;
  }

  .value-label {
    font-size: 10px;
    font-weight: 800;
    pointer-events: none;

    paint-order: stroke;
    stroke: white;
    stroke-width: 3px;
    stroke-linejoin: round;
  }

  @media (max-width: 680px) {
    .sticky-controls {
      position: static;

      backdrop-filter: none;
      -webkit-backdrop-filter:
        none;
    }
  }
</style>