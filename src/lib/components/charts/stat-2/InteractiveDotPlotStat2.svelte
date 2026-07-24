<script>
  import * as d3 from 'd3';
  import {
    draw,
    fade
  } from 'svelte/transition';

  import DotPlotTooltipStat2
    from './DotPlotTooltipStat2.svelte';

  import {
    SourceData,
    createLongData,
    segments,
    segmentOptions
  } from './stat2Data.js';

  import circleIcon from '$lib/assets/icons/circle.svg'
  import lineIcon from '$lib/assets/icons/line.svg'


  let {
    sourceData = SourceData,
    initialSegment = 'Job Level'
  } = $props();

  let selectedSegment = $state(
    segments.includes(initialSegment)
      ? initialSegment
      : segments[0]
  );

  let selectedCohorts = $state([]);

  const highlightedGroup = $derived(
    selectedCohorts[0] ?? ''
    );
    
    const comparisonGroup = $derived(
        selectedCohorts[1] ?? ''
    );

    const availableComparisonCohorts =
    $derived(
        cohorts.filter(
        (cohort) =>
            cohort !== highlightedGroup
        )
    );

  let hoveredCohort = $state(null);
  let hoveredPoint = $state(null);

  let tooltipX = $state(0);
  let tooltipY = $state(0);

  let containerWidth = $state(900);

  /*
   * Cohorts available for the currently selected
   * employee segment.
   */
  const cohorts = $derived(
    segmentOptions[selectedSegment] ?? []
  );

  /*
   * Current plotted values.
   */
  const currentDots = $derived(
    createLongData(
      sourceData,
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
   * Responsive SVG dimensions.
   *
   * The chart can horizontally scroll on smaller
   * screens so the labels and marks remain legible.
   */
  const minimumSvgWidth = 760;

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
    top: 72,
    right: 32,
    bottom: 58,
    left: 32
  };

  /*
   * Reserve room above each row for its statement.
   */
  const rowHeight = 65;

  function getRowY(rowIndex) {
    return (
      margin.top +
      rowIndex * rowHeight +
      38
    );
  }

  const plotBottom = $derived(
    sourceData.length > 0
      ? getRowY(
          sourceData.length - 1
        ) + 24
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

  const axisTicks = [
    0,
    20,
    40,
    60,
    80,
    100
  ];

  /*
   * Comparison colours are assigned according to
   * selection order.
   */
  const comparisonColours = [
    '#05c690',
    '#007da4'
  ];

  function getCohortColour(cohort) {
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
   * The grey range remains stable while users switch
   * between segments. It includes values from every
   * cohort and every segment for each statement.
   */
  const fixedRanges = $derived.by(() => {
    return sourceData.map(
      (row, rowIndex) => {
        const values = [
          row.total,

          ...Object.values(
            row.segments ?? {}
          ).flatMap(
            (segmentValues) =>
              Object.values(
                segmentValues ?? {}
              )
          )
        ].filter(Number.isFinite);

        if (values.length === 0) {
          return {
            rowIndex,
            minimum: null,
            maximum: null
          };
        }

        return {
          rowIndex,
          minimum: d3.min(values),
          maximum: d3.max(values)
        };
      }
    );
  });

  /*
   * Hover connection.
   *
   * It only appears when no cohorts have been locked
   * into the comparison state.
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
          point.cohort ===
          hoveredCohort
      )
      .sort(
        (a, b) =>
          a.rowIndex -
          b.rowIndex
      );
  });

  const lineGenerator = $derived(
    d3
      .line()
      .defined(
        (point) =>
          Number.isFinite(
            point.value
          )
      )
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
      ? lineGenerator(hoverSeries)
      : null
  );

  /*
   * Cohorts selected for persistent comparison.
   */
  const selectedSeries = $derived(
    selectedCohorts.map(
      (cohort) => ({
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
      })
    )
  );

  /*
   * One horizontal comparison line is drawn on each
   * row when exactly two cohorts are selected.
   */
  const comparisonRows = $derived.by(() => {
    if (selectedSeries.length !== 2) {
      return [];
    }

    const [
      firstSeries,
      secondSeries
    ] = selectedSeries;

    return sourceData
      .map((row, rowIndex) => {
        const firstPoint =
          firstSeries.points.find(
            (point) =>
              point.rowIndex ===
              rowIndex
          );

        const secondPoint =
          secondSeries.points.find(
            (point) =>
              point.rowIndex ===
              rowIndex
          );

        if (
          !firstPoint ||
          !secondPoint
        ) {
          return null;
        }

        return {
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

  function selectSegment(segment) {
    selectedSegment = segment;

    /*
     * Selections from one segment may not exist in
     * another segment.
     */
    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }

  function selectCohort(cohort) {
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
     * Once two cohorts are selected, a new selection
     * replaces the oldest one.
     */
    selectedCohorts = [
      selectedCohorts[0],
      cohort
    ];
  }

  function previewCohort(cohort) {
    hoveredCohort = cohort;
  }

  function clearPreview() {
    /*
     * Do not clear a dot hover while the tooltip is
     * still active.
     */
    if (!hoveredPoint) {
      hoveredCohort = null;
    }
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
    hoveredCohort = point.cohort;

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

  function selectHighlightedGroup(
    event
    ) {
    const cohort =
        event.currentTarget.value;

    hoveredPoint = null;
    hoveredCohort = null;

    if (!cohort) {
        selectedCohorts = [];
        return;
    }

    /*
    * Preserve the current comparison cohort where
    * possible, unless it matches the new highlighted
    * cohort.
    */
    const existingComparison =
        selectedCohorts[1];

    selectedCohorts =
        existingComparison &&
        existingComparison !== cohort
        ? [
            cohort,
            existingComparison
            ]
        : [cohort];
    }

    function selectComparisonGroup(
        event
    ) {
    const cohort =
        event.currentTarget.value;

    hoveredPoint = null;
    hoveredCohort = null;

    if (!highlightedGroup) {
        selectedCohorts = [];
        return;
    }

    if (!cohort) {
        selectedCohorts = [
        highlightedGroup
        ];

        return;
    }

    selectedCohorts = [
        highlightedGroup,
        cohort
    ];
    }

    function previewSelectOption(
        event
    ) {
    const cohort =
        event.currentTarget.value;

    hoveredCohort =
        cohort || null;
    }

    function clearSelectPreview() {
        if (!hoveredPoint) {
            hoveredCohort = null;
        }
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
        selectedCohorts.length === 0 &&
        isHovered(cohort)
      )
    );
  }

  function getDotFill(cohort) {
    if (isHighlighted(cohort)) {
      return getCohortColour(cohort);
    }

    return '#e3e6e5';
  }

  function getDotStroke(cohort) {
    if (isHighlighted(cohort)) {
      return '#111111';
    }

    return '#111111';
  }

  function getDotOpacity(cohort) {
    if (
      selectedCohorts.length === 0
    ) {
      return 0.5;
    }

    if (
      selectedCohorts.length === 1
    ) {
      return isSelected(cohort)
        ? 1
        : 0.35;
    }

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

  function getGradientId(rowIndex) {
    return (
      `stat-1-comparison-gradient-${rowIndex}`
    );
  }

  function getLabelY(
    point,
    cohort
  ) {
    const selectionIndex =
      selectedCohorts.indexOf(
        cohort
      );

    /*
     * When two labels are close together, place the
     * first above the row and the second beneath it.
     */
    return selectionIndex === 0
      ? getRowY(point.rowIndex) - 13
      : getRowY(point.rowIndex) + 23;
  }
</script>

<section class="dot-plot-stat-1">
  <div class="chart-heading">
    <h2>
      STAT 2: How employees React to the use of AI
    </h2>

<p class="chart-explanation">
  Choose an employee segment, then hover over a
  <span class="inline-key cohort-key">
    <img
      src={circleIcon}
      alt=""
      aria-hidden="true"
    />
    cohort
  </span>
  to follow its values through the chart.

  Use
  <span class="inline-key highlight-key">
    <span
      class="colour-dot"
      style:background={comparisonColours[0]}
    ></span>
    Highlight group
  </span>
  to select the first cohort, then
  <span class="inline-key compare-key">
    <span
      class="colour-dot"
      style:background={comparisonColours[1]}
    ></span>
    Compare with
  </span>
  to add a second.

  The
  <span class="inline-key range-key">
    full range
  </span>
  shows the spread across the available employee
  groups, while the
  <span class="inline-key average-key">
    <img
      src={lineIcon}
      alt=""
      aria-hidden="true"
    />
    average marker
  </span>
  shows the average value for the total cohort.
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
            Compare employee groups
        </p>

        <div class="comparison-selectors">
            <label class="select-field">
            <span class="select-label">
                Highlight group
            </span>

            <select
                value={highlightedGroup}
                onchange={
                selectHighlightedGroup}
                oninput={previewSelectOption}
                onfocus={previewSelectOption}
                onblur={clearSelectPreview}
            >
                <option value="">
                Select a group
                </option>

                {#each cohorts as cohort}
                <option value={cohort}>
                    {cohort}
                </option>
                {/each}
            </select>
            </label>

            <label
            class="select-field"
            class:disabled-field={
                !highlightedGroup
            }
            >
            <span class="select-label">
                Compare with
            </span>

            <select
                value={comparisonGroup}
                disabled={!highlightedGroup}
                onchange={
                selectComparisonGroup}
                oninput={previewSelectOption}
                onfocus={previewSelectOption}
                onblur={clearSelectPreview}
            >
                <option value="">
                {highlightedGroup
                    ? 'Select another group'
                    : 'Choose a highlight group first'}
                </option>

                {#each
                availableComparisonCohorts
                as cohort
                }
                <option value={cohort}>
                    {cohort}
                </option>
                {/each}
            </select>
            </label>
        </div>

        {#if highlightedGroup}
            <div
            class="selection-summary"
            aria-live="polite"
            >
            <span
                class="selection-item"
            >
                <span
                class="selection-dot"
                style:background={
                    comparisonColours[0]
                }
                ></span>

                {highlightedGroup}
            </span>

            {#if comparisonGroup}
                <span
                class="selection-item"
                >
                <span
                    class="selection-dot"
                    style:background={
                    comparisonColours[1]
                    }
                ></span>

                {comparisonGroup}
                </span>
            {/if}
            </div>
        {/if}
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
      aria-labelledby="
        stat-1-dot-plot-title
        stat-1-dot-plot-description
      "
    >
      <title id="stat-1-dot-plot-title">
        Workload and organisational pressure by
        {selectedSegment}
      </title>

      <desc id="stat-1-dot-plot-description">
        Each row represents a survey statement.
        Circles represent employee cohorts. The grey
        horizontal bar shows the range across all
        employee groups, and the black vertical
        marker represents the Total response.
      </desc>

      <defs>
        {#each comparisonRows as comparison}
          <linearGradient
            id={getGradientId(
              comparison.rowIndex
            )}
            gradientUnits="userSpaceOnUse"
            x1={xScale(
              comparison.firstPoint.value
            )}
            x2={xScale(
              comparison.secondPoint.value
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

      <!-- Percentage axis -->
      <g
        class="axis"
        aria-hidden="true"
      >
        <text
          class="axis-title"
          x={margin.left}
          y="14"
        >
          Percentage agreeing
        </text>

        <line
          class="axis-baseline"
          x1={margin.left}
          x2={width - margin.right}
          y1="34"
          y2="34"
        />

        {#each axisTicks as tick}
          <line
            class="axis-tick-line"
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1="29"
            y2="39"
          />

          <text
            class="axis-tick-label"
            x={xScale(tick)}
            y="53"
            text-anchor="middle"
          >
            {tick}%
          </text>

          <line
            class="axis-grid-line"
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1="58"
            y2={plotBottom}
          />
        {/each}
      </g>

      <!-- Stable background rows and ranges -->
      <g class="rows">
        {#each sourceData as row, rowIndex}
          {@const rowY =
            getRowY(rowIndex)}

          {@const range =
            fixedRanges[rowIndex]}

          <g class="statement-row">
            <foreignObject
              x={margin.left}
              y={rowY - 62}
              width={
                width -
                margin.left -
                margin.right
              }
              height="38"
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="measure-label"
              >
                {row.measure}
              </div>
            </foreignObject>

            <line
              class="row-guide"
              x1={margin.left}
              x2={width - margin.right}
              y1={rowY}
              y2={rowY}
            />

            {#if
              Number.isFinite(
                range?.minimum
              ) &&
              Number.isFinite(
                range?.maximum
              )
            }
              <line
                class="range-line"
                x1={xScale(
                  range.minimum
                )}
                x2={xScale(
                  range.maximum
                )}
                y1={rowY}
                y2={rowY}
              />
            {/if}
          </g>
        {/each}
      </g>

      <!-- Two-cohort comparison lines -->
      {#if comparisonRows.length > 0}
        <g class="comparison-lines">
          {#each comparisonRows as comparison}
            <line
              class="comparison-line-outline"
              x1={xScale(
                comparison.firstPoint.value
              )}
              x2={xScale(
                comparison.secondPoint.value
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
                comparison.firstPoint.value
              )}
              x2={xScale(
                comparison.secondPoint.value
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

      <!-- Hover connection -->
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

      <!-- Non-interactive Total benchmark -->
      <g
        class="total-markers"
        aria-hidden="true"
      >
        {#each totalPoints as point}
          <line
            class="total-marker-outline"
            x1={xScale(point.value)}
            x2={xScale(point.value)}
            y1={
              getRowY(
                point.rowIndex
              ) - 12
            }
            y2={
              getRowY(
                point.rowIndex
              ) + 12
            }
          />

          <line
            class="total-marker"
            x1={xScale(point.value)}
            x2={xScale(point.value)}
            y1={
              getRowY(
                point.rowIndex
              ) - 11
            }
            y2={
              getRowY(
                point.rowIndex
              ) + 11
            }
          />
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
              isHighlighted(
                point.cohort
              )
            }
            class:hidden-dot={hidden}
            cx={xScale(point.value)}
            cy={getRowY(
              point.rowIndex
            )}
            r={getDotRadius(
              point.cohort
            )}
            fill={getDotFill(
              point.cohort
            )}
            stroke={getDotStroke(
              point.cohort
            )}
            opacity={getDotOpacity(
              point.cohort
            )}
            role="button"
            tabindex={hidden ? -1 : 0}
            aria-hidden={hidden}
            aria-label={`${point.cohort}: ${point.value}% — ${point.measure}`}
            aria-pressed={
              isSelected(
                point.cohort
              )
            }
            onmouseenter={(event) =>
              showTooltip(
                event,
                point
              )}
            onmousemove={
              updateTooltipPosition}
            onmouseleave={hideTooltip}
            onfocus={(event) => {
                const bounds =
                    event.currentTarget.getBoundingClientRect();

              showTooltip({
                clientX:
                    bounds.left + bounds.width / 2,
                clientY:
                    bounds.top + bounds.height / 2
              },
              point
              );
              }}
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


      <!-- Selected values -->
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
                x={xScale(point.value)}
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

  <DotPlotTooltipStat2
    point={hoveredPoint}
    x={tooltipX}
    y={tooltipY}
    colour={
      hoveredPoint
        ? getCohortColour(
            hoveredPoint.cohort
          )
        : '#05c690'
    }
  />
</section>

<style>
  .dot-plot-stat-1 {
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

  .chart-heading h2 {
    margin: 0;

    font-size:
      clamp(
        1.25rem,
        3vw,
        1.75rem
      );

    line-height: 1.15;
  }

  .chart-heading p {
    max-width: 760px;
    margin: 0.6rem 0 0;

    color: #626866;
    font-size: 0.85rem;
    line-height: 1.5;
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

  .chart-explanation {
    max-width: 72ch;
    margin: 0;
    color: #4b504d;
    font-size: 0.86rem;
    line-height: 1.7;
    }

    .inline-key {
    display: inline-flex;
    align-items: center;
    gap: 0.28rem;

    margin-inline: 0.12rem;
    border-radius: 999px;
    padding: 0.08rem 0.42rem;

    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1.4;

    vertical-align: middle;
    white-space: nowrap;
    }

    .inline-key img {
    display: block;
    width: 11px;
    height: 11px;
    flex: 0 0 auto;
    }

    .cohort-key {
    background: #f0f2f1;
    color: #343a37;
    }

    .range-key {
    background: #d7d9d8;
    color: #343a37;
    }

    .highlight-key {
    background:
        color-mix(
        in srgb,
        var(--highlight-colour) 14%,
        white
        );

    color: #343a37;
    }

    .compare-key {
    background:
        color-mix(
        in srgb,
        var(--compare-colour) 14%,
        white
        );

    color: #343a37;
    }

    .average-key {
    background: #f0f2f1;
    color: #222624;
    }

    .average-key img {
    width: 3px;
    height: 14px;
    object-fit: fill;
    }

    .colour-dot {
    width: 9px;
    height: 9px;
    flex: 0 0 auto;
    border-radius: 50%;
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
    min-width: 760px;
    height: auto;

    overflow: visible;
    background: white;
  }

  .axis-title {
    fill: #626866;

    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.055em;
    text-transform: uppercase;
  }

  .axis-baseline,
  .axis-tick-line {
    stroke: #89918e;
    stroke-width: 1;
  }

  .axis-tick-label {
    fill: #626866;

    font-size: 10px;
    font-weight: 700;
  }

  .axis-grid-line {
    stroke: #ecefed;
    stroke-width: 1;
    stroke-dasharray: 2 5;

    pointer-events: none;
  }

  .measure-label {
    display: flex;
    align-items: flex-end;

    width: 100%;
    height: 100%;

    color: #202422;

    font-size: 12px;
    font-weight: 700;
    line-height: 1.25;

    text-transform: none;
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

  .total-markers {
    pointer-events: none;
  }

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

  .value-label {
    font-size: 10px;
    font-weight: 800;

    pointer-events: none;

    paint-order: stroke;
    stroke: white;
    stroke-width: 3px;
    stroke-linejoin: round;
  }

  .comparison-selectors {
  display: grid;
  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );
  gap: 0.75rem;
}

.select-field {
  display: grid;
  gap: 0.35rem;
  min-width: 0;
}

.select-label {
  color: #444a47;
  font-size: 0.75rem;
  font-weight: 700;
}

.select-field select {
  width: 100%;
  min-width: 0;

  border: 1px solid #cbd1ce;
  border-radius: 0.65rem;
  padding: 0.65rem 2.25rem 0.65rem
    0.75rem;

  background-color: white;
  color: #202422;

  font: inherit;
  font-size: 0.82rem;
  font-weight: 600;

  cursor: pointer;
}

.select-field select:hover {
  border-color: #89938f;
}

.select-field select:focus-visible {
  border-color: #123f37;
  outline:
    2px solid
    rgb(18 63 55 / 20%);
  outline-offset: 2px;
}

.select-field select:disabled {
  background: #f2f4f3;
  color: #929995;
  cursor: not-allowed;
}

.disabled-field .select-label {
  color: #929995;
}

.selection-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;

  margin-top: 0.7rem;
}

.selection-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;

  border-radius: 999px;
  padding: 0.3rem 0.55rem;

  background: #f2f4f3;
  color: #343936;

  font-size: 0.74rem;
  font-weight: 700;
}

.selection-dot {
  width: 9px;
  height: 9px;
  flex: 0 0 auto;

  border-radius: 50%;
}

@media (max-width: 680px) {
  .comparison-selectors {
    grid-template-columns:
      minmax(0, 1fr);
  }
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