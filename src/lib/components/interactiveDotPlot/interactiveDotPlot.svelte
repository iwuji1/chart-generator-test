<script>
  import * as d3 from 'd3';
  import { fade, draw } from 'svelte/transition';

  import DotPlotAxis from '$lib/components/interactiveDotPlot/DotPlotAxis.svelte';
  import DotPlotLegend from '$lib/components/interactiveDotPlot/DotPlotLegend.svelte';
  import DotTooltip from '$lib/components/interactiveDotPlot/DotPlotTooltip.svelte';

  import {
    SourceData,
    createLongData,
    cohorts,
    years
  } from '$lib/datasets/dotplotdata';

  /*
   * You can pass alternative data into the component:
   *
   * <InteractiveDotPlot sourceData={anotherDataset} />
   */
  let {
    sourceData = SourceData,
    initialYear = 2026
  } = $props();

  const longData = $derived(
    createLongData(sourceData)
  );

  /*
   * Main interaction state
   */
  let selectedYear = $state(initialYear);
  let selectedCohort = $state(null);
  let hoveredCohort = $state(null);
  let hoveredPoint = $state(null);

  let tooltipX = $state(0);
  let tooltipY = $state(0);

  /*
   * A hovered cohort temporarily overrides a clicked cohort.
   */
  const activeCohort = $derived(
    hoveredCohort ?? selectedCohort
  );

  /*
   * Main dot plot only shows one year at a time.
   */
  const currentYearData = $derived(
    longData.filter(
      (point) => point.year === selectedYear
    )
  );

  /*
   * Preserve the order of SourceData.
   */
  const rowKeys = $derived(
    sourceData.map((row, rowIndex) =>
      createRowKey(row.topic, row.response, rowIndex)
    )
  );

  /*
   * Group current-year points into chart rows.
   */
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
   * Group SourceData by topic for topic bands and headings.
   */
  const topicGroups = $derived.by(() => {
    const groups = [];
    let currentGroup = null;

    sourceData.forEach((row, rowIndex) => {
      if (!currentGroup || currentGroup.topic !== row.topic) {
        currentGroup = {
          topic: row.topic,
          startIndex: rowIndex,
          endIndex: rowIndex,
          rows: []
        };

        groups.push(currentGroup);
      }

      currentGroup.rows.push(row);
      currentGroup.endIndex = rowIndex;
    });

    return groups;
  });

  /*
   * Dimensions
   */
  let containerWidth = $state(1100);

  const width = $derived(
    Math.max(820, containerWidth)
  );

  const rowHeight = 70;
  const topicGap = 40;

  const margin = {
    top: 150,
    right: 65,
    bottom: 70,
    left: 365
  };

  /*
   * Add an extra gap after every topic except the last.
   */
  function getTopicGapBefore(rowIndex) {
    return topicGroups
      .filter(
        (group) =>
          group.startIndex > 0 &&
          group.startIndex <= rowIndex
      )
      .length * topicGap;
  }

  function getRowY(rowIndex) {
    return (
      margin.top +
      rowIndex * rowHeight +
      getTopicGapBefore(rowIndex)
    );
  }

  const plotBottom = $derived(
    sourceData.length > 0
      ? getRowY(sourceData.length - 1) + rowHeight / 2
      : margin.top
  );

  const height = $derived(
    plotBottom + margin.bottom
  );

  /*
   * Scales
   */
  const xScale = $derived(
    d3
      .scaleLinear()
      .domain([0, 100])
      .range([margin.left, width - margin.right])
  );

  const colourScale = d3
    .scaleOrdinal()
    .domain(cohorts)
    .range([
      '#005F73',
      '#0A7C66',
      '#4D9341',
      '#72B83E',
      '#D6A83A',
      '#A65A46'
    ]);

  /*
   * All current-year points for the highlighted cohort.
   */
  const activeSeries = $derived(
    activeCohort
      ? currentYearData
          .filter(
            (point) =>
              point.cohort === activeCohort
          )
          .sort(
            (a, b) => a.rowIndex - b.rowIndex
          )
      : []
  );

  /*
   * D3 creates the line path while Svelte renders it.
   */
  const lineGenerator = $derived(
    d3
      .line()
      .x((point) => xScale(point.value))
      .y((point) => getRowY(point.rowIndex))
      .curve(d3.curveCatmullRom.alpha(0.5))
  );

  const activeLinePath = $derived(
    activeSeries.length > 1
      ? lineGenerator(activeSeries)
      : null
  );

  /*
   * Historical values displayed in the tooltip.
   */
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
      .sort((a, b) => a.year - b.year);
  });

  function createRowKey(topic, response, rowIndex) {
    return `${rowIndex}|||${topic}|||${response}`;
  }

  function selectCohort(cohort) {
    selectedCohort =
      selectedCohort === cohort
        ? null
        : cohort;
  }

  function previewCohort(cohort) {
    hoveredCohort = cohort;
  }

  function clearPreview() {
    hoveredCohort = null;
  }

  function clearSelection() {
    selectedCohort = null;
    hoveredCohort = null;
    hoveredPoint = null;
  }

  function selectYear(year) {
    selectedYear = year;
    hoveredPoint = null;
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
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectCohort(point.cohort);
    }

    if (event.key === 'Escape') {
      clearSelection();
    }
  }

  function getDotFill(cohort) {
    if (!activeCohort) {
      return '#8C9593';
    }

    return cohort === activeCohort
      ? colourScale(cohort)
      : '#CCD2D0';
  }

  function getDotOpacity(cohort) {
    if (!activeCohort) {
      return 1;
    }

    return cohort === activeCohort
      ? 1
      : 0.3;
  }

  function getDotRadius(cohort) {
    return cohort === activeCohort ? 8 : 5.5;
  }

  function getTopicBandY(group) {
    return getRowY(group.startIndex) - rowHeight / 2 - 25;
  }

  function getTopicBandHeight(group) {
    return (
      getRowY(group.endIndex) -
      getRowY(group.startIndex) +
      rowHeight +
      10
    );
  }

  function getValueLabelAnchor(value) {
    return value >= 90 ? 'end' : 'start';
  }

  function getValueLabelX(value) {
    return value >= 90
      ? xScale(value) - 13
      : xScale(value) + 13;
  }
</script>

<section class="dot-plot">
  <div class="chart-header">
    <div>
      <h2>Employee priorities by leadership cohort</h2>

      <p>
        Select a cohort to follow its responses across all
        topics. Hover over a point to compare that response
        across years.
      </p>
    </div>

    <div
      class="year-selector"
      role="group"
      aria-label="Select chart year"
    >
      {#each years as year}
        <button
          type="button"
          class:active={selectedYear === year}
          aria-pressed={selectedYear === year}
          onclick={() => selectYear(year)}
        >
          {year}
        </button>
      {/each}
    </div>
  </div>

  <DotPlotLegend
    {cohorts}
    {colourScale}
    {selectedCohort}
    {hoveredCohort}
    onSelect={selectCohort}
    onPreview={previewCohort}
    onClearPreview={clearPreview}
  />

  <div
    class="chart-wrapper"
    bind:clientWidth={containerWidth}
  >
    <svg
      {width}
      {height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby="dot-plot-title dot-plot-description"
      onclick={(event) => {
        if (event.target === event.currentTarget) {
          clearSelection();
        }
      }}
    >
      <title id="dot-plot-title">
        Employee priorities by cohort in {selectedYear}
      </title>

      <desc id="dot-plot-description">
        Each row represents a response topic. Each dot
        represents one leadership cohort. Selecting a cohort
        connects its responses across the chart.
      </desc>

      <!-- Topic background bands -->
      <g class="topic-bands">
        {#each topicGroups as group, i}
          <rect
            class:alternate={i % 2 === 1}
            x="0"
            y={getTopicBandY(group)}
            width={width}
            height={getTopicBandHeight(group)}
          />

          <text
            class="topic-heading"
            x={24}
            y={getTopicBandY(group) + 26}
          >
            {group.topic}
          </text>
        {/each}
      </g>

      <DotPlotAxis
        {xScale}
        {width}
        {margin}
        top={margin.top - 45}
        bottom={plotBottom}
      />

      <!-- Response rows -->
      <g class="rows">
        {#each rowKeys as rowKey, rowIndex}
          {@const values = rowGroups.get(rowKey) ?? []}
          {@const row = sourceData[rowIndex]}
          {@const minimum = d3.min(values, (point) => point.value)}
          {@const maximum = d3.max(values, (point) => point.value)}
          {@const rowY = getRowY(rowIndex)}

          <g class="response-row">
            <line
              class="row-guide"
              x1={margin.left}
              x2={width - margin.right}
              y1={rowY}
              y2={rowY}
            />

            {#if Number.isFinite(minimum) && Number.isFinite(maximum)}
              <line
                class="range-line"
                x1={xScale(minimum)}
                x2={xScale(maximum)}
                y1={rowY}
                y2={rowY}
              />
            {/if}

            <text
              class="response-label"
              x={margin.left - 24}
              y={rowY}
              dy="0.35em"
              text-anchor="end"
            >
              {row.response}
            </text>
          </g>
        {/each}
      </g>

      <!-- Active cohort line -->
      {#if activeLinePath && activeCohort}
        {#key `${activeCohort}-${selectedYear}`}
          <path
            class="active-line"
            d={activeLinePath}
            stroke={colourScale(activeCohort)}
            in:draw={{ duration: 350 }}
            out:fade={{ duration: 100 }}
          />
        {/key}
      {/if}

      <!-- Dots -->
      <g class="dots">
        {#each currentYearData as point}
          <circle
            class="dot"
            class:active-dot={point.cohort === activeCohort}
            cx={xScale(point.value)}
            cy={getRowY(point.rowIndex)}
            r={getDotRadius(point.cohort)}
            fill={getDotFill(point.cohort)}
            opacity={getDotOpacity(point.cohort)}
            role="button"
            tabindex="0"
            aria-label={`${point.cohort}: ${point.value}% — ${point.topic}, ${point.response}, ${point.year}`}
            aria-pressed={selectedCohort === point.cohort}
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
              handleDotKeydown(event, point)}
          >
            <title>
              {point.cohort}: {point.value}% in {point.year}
            </title>
          </circle>
        {/each}
      </g>

      <!-- Active cohort value labels -->
      {#if activeCohort}
        <g
          class="active-values"
          in:fade={{ duration: 180 }}
          out:fade={{ duration: 100 }}
        >
          {#each activeSeries as point}
            <text
              class="value-label"
              x={getValueLabelX(point.value)}
              y={getRowY(point.rowIndex)}
              dy="0.35em"
              text-anchor={getValueLabelAnchor(point.value)}
              fill={colourScale(activeCohort)}
            >
              {point.value}%
            </text>
          {/each}
        </g>
      {/if}
    </svg>
  </div>

  {#if selectedCohort}
    <button
      type="button"
      class="clear-button"
      onclick={clearSelection}
    >
      Clear {selectedCohort}
    </button>
  {/if}

  <DotTooltip
    point={hoveredPoint}
    history={tooltipHistory}
    x={tooltipX}
    y={tooltipY}
    activeYear={selectedYear}
    colour={
      hoveredPoint
        ? colourScale(hoveredPoint.cohort)
        : '#76bf3d'
    }
  />
</section>

<style>
  .dot-plot {
    width: 100%;
    color: #171a19;
    font-family: 'gotham', sans-serif;
  }

  .chart-header {
    display: flex;
    gap: 2rem;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  h2 {
    margin: 0;
    font-size: clamp(1.4rem, 2vw, 2rem);
  }

  .chart-header p {
    max-width: 720px;
    margin: 0.5rem 0 0;
    color: #626866;
    line-height: 1.5;
  }

  .year-selector {
    display: flex;
    flex: 0 0 auto;
    gap: 0.35rem;
    padding: 0.25rem;
    border: 1px solid #d5dad8;
    border-radius: 999px;
    background: #f3f5f4;
  }

  .year-selector button {
    border: 0;
    border-radius: 999px;
    padding: 0.5rem 0.85rem;
    background: transparent;
    color: #525856;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .year-selector button.active {
    background: #123f37;
    color: white;
  }

  .chart-wrapper {
    width: 100%;
    margin-top: 1rem;
    overflow-x: auto;
  }

  svg {
    display: block;
    width: 100%;
    min-width: 820px;
    height: auto;
    background: white;
  }

  .topic-bands rect {
    fill: #f7f8f7;
  }

  .topic-bands rect.alternate {
    fill: #eef2f0;
  }

  .topic-heading {
    fill: #123f37;
    font-size: 15px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .response-label {
    fill: #222725;
    font-size: 13px;
    font-weight: 600;
  }

  .row-guide {
    stroke: #dfe3e1;
    stroke-width: 1;
  }

  .range-line {
    stroke: #9da7a3;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .active-line {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    pointer-events: none;
  }

  .dot {
    cursor: pointer;
    stroke: white;
    stroke-width: 1.5;
    transition:
      r 170ms ease,
      fill 170ms ease,
      opacity 170ms ease,
      stroke 170ms ease;
  }

  .dot:hover,
  .dot:focus-visible {
    stroke: #131716;
    stroke-width: 2;
    outline: none;
  }

  .active-dot {
    filter: drop-shadow(0 2px 3px rgb(0 0 0 / 24%));
  }

  .value-label {
    font-size: 12px;
    font-weight: 800;
    pointer-events: none;
  }

  .clear-button {
    margin-top: 0.75rem;
    border: 1px solid #b9c0bd;
    border-radius: 999px;
    padding: 0.5rem 0.85rem;
    background: white;
    color: #252a28;
    font: inherit;
    cursor: pointer;
  }

  @media (max-width: 700px) {
    .chart-header {
      flex-direction: column;
    }
  }
</style>