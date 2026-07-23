<script>
  import * as d3 from 'd3';
  import { draw, fade } from 'svelte/transition';

  import DotPlotAxisKF from './DotPlotAxisKF.svelte';
  import DotPlotLegendKF from './DotPlotLegendKF.svelte';
  import DotPlotTooltip from './DotPlotTooltip.svelte';

  import {
    SourceData,
    createLongData,
    cohorts,
    years
  } from '$lib/datasets/dotplotdata';

  let {
    sourceData = SourceData,
    initialYear = 2026
  } = $props();

  const longData = $derived(
    createLongData(sourceData)
  );

  let selectedYear = $state(initialYear);
  let selectedCohorts = $state([]);

  let hoveredCohort = $state(null);
  let hoveredPoint = $state(null);

  let tooltipX = $state(0);
  let tooltipY = $state(0);

  let containerWidth = $state(900);

  /*
   * The component never grows beyond 900px.
   * Below 700px, the SVG remains scrollable.
   */
  const minimumSvgWidth = 700;

  const width = $derived(
    Math.max(
      minimumSvgWidth,
      Math.min(900, containerWidth)
    )
  );

  const margin = {
    top: 92,
    right: 30,
    bottom: 48,
    left: 30
  };

  /*
   * Each row contains:
   * - statement above
   * - dots/range in the middle
   * - values below
   */
  const rowHeight = 60;
  const topicGap = 54;
  const topicLabelHeight = 35;

  const currentYearData = $derived(
    longData.filter(
      (point) => point.year === selectedYear
    )
  );

  function createRowKey(
    topic,
    response,
    rowIndex
  ) {
    return `${rowIndex}|||${topic}|||${response}`;
  }

  const rowKeys = $derived(
    sourceData.map((row, rowIndex) =>
      createRowKey(
        row.topic,
        row.response,
        rowIndex
      )
    )
  );

  const rowGroups = $derived(
    d3.group(
      currentYearData,
      (point) =>
        createRowKey(
          point.topic,
          point.response,
          point.rowIndex
        )
    )
  );

  /*
   * Used to add slightly more space whenever
   * the chart moves into a new topic.
   */
  const topicGroups = $derived.by(() => {
    const groups = [];
    let currentGroup = null;

    sourceData.forEach((row, rowIndex) => {
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

      currentGroup.endIndex = rowIndex;
    });

    return groups;
  });

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
    sourceData.length
      ? getRowY(sourceData.length - 1) + 30
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

  const colourScale = d3
    .scaleOrdinal()
    .domain(cohorts)
    .range([
        '#111111',
        '#005f73',
      '#007760',
      '#4d9341',
      '#72b83e',
      '#d6a83a',
      '#a65a46'
    ]);

  /*
   * Hover creates a temporary vertical line only
   * when there are no clicked selections.
   */
  const hoverSeries = $derived.by(() => {
    if (
      !hoveredCohort ||
      selectedCohorts.length > 0
    ) {
      return [];
    }

    return currentYearData
      .filter(
        (point) =>
          point.cohort === hoveredCohort
      )
      .sort(
        (a, b) =>
          a.rowIndex - b.rowIndex
      );
  });

  const hoverLineGenerator = $derived(
    d3
      .line()
      .x((point) => xScale(point.value))
      .y((point) => getRowY(point.rowIndex))
      .curve(
        d3.curveCatmullRom.alpha(0.5)
      )
  );

  const hoverLinePath = $derived(
    hoverSeries.length > 1
      ? hoverLineGenerator(hoverSeries)
      : null
  );

  /*
   * Selected cohort data.
   */
  const selectedSeries = $derived(
    selectedCohorts.map((cohort) => ({
      cohort,

      points: currentYearData
        .filter(
          (point) =>
            point.cohort === cohort
        )
        .sort(
          (a, b) =>
            a.rowIndex - b.rowIndex
        )
    }))
  );

  /*
   * Build one comparison pair per chart row.
   */
  const comparisonRows = $derived.by(() => {
    if (selectedSeries.length !== 2) {
      return [];
    }

    const [firstSeries, secondSeries] =
      selectedSeries;

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

        if (!firstPoint || !secondPoint) {
          return null;
        }

        return {
          rowKey,
          rowIndex,

          firstCohort: firstSeries.cohort,
          secondCohort: secondSeries.cohort,

          firstPoint,
          secondPoint
        };
      })
      .filter(Boolean);
  });

  const tooltipHistory = $derived.by(() => {
    if (!hoveredPoint) {
      return [];
    }

    return longData
      .filter(
        (point) =>
          point.topic === hoveredPoint.topic &&
          point.response === hoveredPoint.response &&
          point.cohort === hoveredPoint.cohort
      )
      .sort(
        (a, b) =>
          a.year - b.year
      );
  });

  function selectCohort(cohort) {
    if (selectedCohorts.includes(cohort)) {
      selectedCohorts =
        selectedCohorts.filter(
          (selected) =>
            selected !== cohort
        );

      return;
    }

    if (selectedCohorts.length < 2) {
      selectedCohorts = [
        ...selectedCohorts,
        cohort
      ];

      return;
    }

    /*
     * Replace the oldest comparison.
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

  function selectYear(year) {
    selectedYear = year;
    hoveredPoint = null;
    hoveredCohort = null;
  }

  function showTooltip(event, point) {
    hoveredPoint = point;
    hoveredCohort = point.cohort;

    updateTooltipPosition(event);
  }

  function updateTooltipPosition(event) {
    tooltipX = event.clientX;
    tooltipY = event.clientY;
  }

  function hideTooltip() {
    hoveredPoint = null;
    hoveredCohort = null;
  }

  function handleDotKeydown(event, point) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      selectCohort(point.cohort);
    }

    if (event.key === 'Escape') {
      clearSelection();
    }
  }

  function isSelected(cohort) {
    return selectedCohorts.includes(cohort);
  }

  function isHovered(cohort) {
    return hoveredCohort === cohort;
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

    if (cohort === 'Total') {
        return colourScale('Total')
    }

    return isHighlighted(cohort)
      ? colourScale(cohort)
      : 'white';
  }

  function getDotStroke(cohort) {

    if (cohort === 'Total') {
        return colourScale('Total')
    }

    return isHighlighted(cohort)
      ? '#0000000'
      : '#8f9995';
  }

  function getDotOpacity(cohort) {

    if (cohort === 'Total') {
        return 1;
    }

    if (selectedCohorts.length === 0) {
      return 1;
    }

    return isSelected(cohort)
      ? 1
      : 0.20;
  }

  function getDotRadius(cohort) {
    if (cohort === 'Total') {
        return isHighlighted(cohort)
        ? 9
        : 6.5;
    }
    return isHighlighted(cohort)
      ? 9
      : 6;
  }

  function getGradientId(rowIndex) {
    return `kf-comparison-gradient-${rowIndex}`;
  }

  function getLabelX(point) {
    return xScale(point.value);
  }

  function getLabelY(point, cohort) {
    const selectionIndex =
      selectedCohorts.indexOf(cohort);

    /*
     * Separate labels slightly if the values
     * are very close together.
     */
    return (
      getRowY(point.rowIndex) +
      23 +
      selectionIndex * 14
    );
  }
</script>

<section class="dot-plot-kf">
  <header class="chart-header">
    <div class="chart-heading">
      <h2>
        Employee priorities by leadership cohort
      </h2>

      <p>
        Hover over a cohort to follow it across the
        chart. Select one cohort to highlight it, or
        select two to compare their responses. <span class="light-grey">Range</span>
      </p>
    </div>

    <div class="controls">
      <div class="year-control">
        <p class="control-label">
          View year
        </p>

        <div
          class="year-selector"
          role="group"
          aria-label="Select chart year"
        >
          {#each years as year}
            <button
              type="button"
              class:active={
                selectedYear === year
              }
              aria-pressed={
                selectedYear === year
              }
              onclick={() => selectYear(year)}
            >
              {year}
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
          {colourScale}
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
  </header>

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
        Employee priorities by cohort in
        {selectedYear}
      </title>

      <desc id="kf-dot-plot-description">
        Hover over a cohort to connect its values
        vertically. Select two cohorts to compare each
        row using a horizontal gradient.
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
              stop-color={colourScale(
                comparison.firstCohort
              )}
            />

            <stop
              offset="100%"
              stop-color={colourScale(
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

      <!-- Rows -->
      <g class="rows">
        {#each rowKeys as rowKey, rowIndex}
          {@const values =
            rowGroups.get(rowKey) ?? []}

          {@const row =
            sourceData[rowIndex]}

          {@const rowY =
            getRowY(rowIndex)}

          {@const minimum =
            d3.min(
              values,
              (point) => point.value
            )}

          {@const maximum =
            d3.max(
              values,
              (point) => point.value
            )}

          <g class="response-row">
            {#if
              topicGroups.some(
                (group) =>
                  group.startIndex === rowIndex
              )
            }

            <!-- <rect 
                class="topic-label-bg"
                x={0}
                y={rowY - 55}
                width={width}
                height={topicLabelHeight}
            /> -->
              <text
                class="topic-label"
                x={margin.left}
                y={rowY - 40}
              >
                {row.topic}
              </text>
            {/if}

            <line
              class="row-guide"
              x1={margin.left}
              x2={width - margin.right}
              y1={rowY}
              y2={rowY}
            />

            {#if
              Number.isFinite(minimum) &&
              Number.isFinite(maximum)
            }
              <line
                class="range-line"
                x1={xScale(minimum)}
                x2={xScale(maximum)}
                y1={rowY}
                y2={rowY}
              />
            {/if}
          </g>
        {/each}
      </g>

      <!-- Two-cohort horizontal comparisons -->
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
              in:draw={{ duration: 300 }}
              out:fade={{ duration: 100 }}
            />
          {/each}
        </g>
      {/if}

      <!-- Hover-only vertical line -->
      {#if
        hoverLinePath &&
        hoveredCohort &&
        selectedCohorts.length === 0
      }
        <g
          class="hover-line-group"
          in:fade={{ duration: 100 }}
          out:fade={{ duration: 80 }}
        >
          <path
            class="hover-line-outline"
            d={hoverLinePath}
          />

          <path
            class="hover-line"
            d={hoverLinePath}
            stroke={colourScale(
              hoveredCohort
            )}
            in:draw={{ duration: 300 }}
          />
        </g>
      {/if}

      <!-- Response labels above each row -->
        <g class="response-labels">
        {#each sourceData as row, rowIndex}
            <text
            class="response-label"
            x={margin.left}
            y={getRowY(rowIndex) - 15}
            text-anchor="left"
            >
            {row.response}
            </text>
        {/each}
        </g>

      <!-- Cohort dots -->
    <!-- Cohort dots, including Total -->
    <g class="dots">
    {#each currentYearData as point}
        <circle
        class="dot"
        class:total-dot={
            point.cohort === 'Total'
        }
        class:active-dot={
            isHighlighted(point.cohort)
        }
        cx={xScale(point.value)}
        cy={getRowY(point.rowIndex)}
        r={getDotRadius(point.cohort)}
        fill={getDotFill(point.cohort)}
        stroke={getDotStroke(point.cohort)}
        stroke-opacity={1}
        opacity={getDotOpacity(point.cohort)}
        role="button"
        tabindex="0"
        aria-label={`${point.cohort}: ${point.value}% — ${point.response}`}
        aria-pressed={
            isSelected(point.cohort)
        }
        onmouseenter={(event) =>
            showTooltip(event, point)}
        onmousemove={updateTooltipPosition}
        onmouseleave={hideTooltip}
        onfocus={(event) =>
            showTooltip(event, point)}
        onblur={hideTooltip}
        onclick={(event) => {
            event.stopPropagation();
            selectCohort(point.cohort);
        }}
        onkeydown={(event) =>
            handleDotKeydown(
            event,
            point
            )}
        >
        <title>
            {point.cohort}: {point.value}%
        </title>
        </circle>
    {/each}
    </g>

      <!-- Values underneath selected dots -->
      {#if selectedSeries.length > 0}
        <g
          class="selected-values"
          in:fade={{ duration: 160 }}
          out:fade={{ duration: 80 }}
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
                fill={colourScale(
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
        ? colourScale(
            hoveredPoint.cohort
          )
        : '#76bf3d'
    }
  />
</section>

<style>
  .dot-plot-kf {
    width: 100%;
    max-width: 900px;
    margin-inline: auto;

    color: #171a19;
    font-family:
      'gotham',
      Arial,
      sans-serif;
  }

  .chart-header {
    display: grid;
    gap: 1.15rem;

    margin-bottom: 1.25rem;
    padding: 1.1rem;

    border: 1px solid #dfe3e1;
    border-radius: 0.9rem;

    background: white;
    box-shadow:
      0 7px 24px rgb(0 0 0 / 6%);
  }

  .chart-heading h2 {
    margin: 0;
    font-size:
      clamp(1.25rem, 3vw, 1.75rem);
    line-height: 1.12;
  }

  .chart-heading p {
    max-width: 680px;
    margin: 0.55rem 0 0;

    color: #626866;
    font-size: 0.85rem;
    line-height: 1.45;
  }

  .controls {
    display: grid;
    grid-template-columns:
      minmax(125px, auto)
      minmax(0, 1fr);

    gap: 1.25rem;
    align-items: start;
  }

  .control-label {
    margin: 0 0 0.55rem;

    color: #626866;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .year-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .year-selector button {
    border: 1px solid #d5dad8;
    border-radius: 999px;
    padding: 0.42rem 0.68rem;

    background: #f3f5f4;
    color: #525856;

    font: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
  }

  .year-selector button.active {
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

  .chart-wrapper {
    width: 100%;
    min-width: 0;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
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

  .topic-label-bg {
    fill: #f7f8f7;
  }

  .response-label {
    fill: #202422;
    font-size: 12px;
    font-weight: 700;
    pointer-events: none;

    paint-order: stroke;
    stroke: white;
    stroke-width: 4px;
    stroke-linejoin: round;
    text-transform: uppercase;
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

  .total-dot {
    stroke-width: 1.5;
    }
    
    .total-dot:hover,
    .total-dot:focus-visible,
    .total-dot.active-dot {
        stroke-width: 2.5;
    }


  .comparison-line-outline {
    stroke: white;
    stroke-width: 22;
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
    stroke-opacity: 100%;

    transition:
      r 170ms ease,
      fill 170ms ease,
      opacity 170ms ease,
      stroke 170ms ease;
  }

  .dot:hover,
  .dot:focus-visible,
  .active-dot {
    stroke-width: 5;
    outline: none;
    filter:
      drop-shadow(
        0 2px 3px rgb(0 0 0 / 20%)
      );
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

  .light-grey {
    background-color: #525856;
    color: #ffffff
    

  }

  @media (max-width: 680px) {
    .controls {
      grid-template-columns: 1fr;
    }

    .chart-header {
      padding: 0.9rem;
    }
  }
</style>