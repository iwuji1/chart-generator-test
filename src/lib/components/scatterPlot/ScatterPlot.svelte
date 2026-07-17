<script>
  import * as d3 from 'd3';
  import { fade } from 'svelte/transition';

  import ScatterPlotControls from './ScatterPlotControls.svelte';
  import ScatterSegmentList from './ScatterSegmentList.svelte';
  import ScatterPlotAxis from './ScatterPlotAxis.svelte';
  import ScatterTooltip from './ScatterTooltip.svelte';

  import {
    measures,
    segmentGroups,
    SourceData
  } from '$lib/datasets/scatterPlotData.js';

  let {
    initialXMeasure = measures[0],
    initialYMeasure = measures[1]
  } = $props();

  /*
   * Axis state
   */
  let xMeasure = $state(initialXMeasure);
  let yMeasure = $state(initialYMeasure);

  /*
   * All groups are selected by default.
   */
  const groupNames = Object.keys(segmentGroups);

  let selectedGroups = $state([...groupNames]);

  /*
   * Segment highlight state
   *
   * hoveredSegment is temporary.
   * selectedSegment is locked through clicking.
   */
  let hoveredGroup = $state(null);
  let selectedGroup = $state(null);

  let hoveredSegment = $state(null);
  let selectedSegment = $state(null);

  const activeGroup = $derived(
    hoveredGroup ?? selectedGroup
  );
  const activeSegment = $derived(
    hoveredSegment ?? selectedSegment
  );

  /*
   * Tooltip state
   */
  let hoveredPoint = $state(null);
  let tooltipX = $state(0);
  let tooltipY = $state(0);

  /*
   * Dimensions
   */
  let containerWidth = $state(1000);

  const chartWidth = $derived(
    Math.max(680, containerWidth)
  );

  const height = 620;

  const margin = {
    top: 45,
    right: 45,
    bottom: 135,
    left: 105
  };

  /*
   * Scales
   */
  const xScale = $derived(
    d3
      .scaleLinear()
      .domain([0, 1])
      .range([
        margin.left,
        chartWidth - margin.right
      ])
  );

  const yScale = $derived(
    d3
      .scaleLinear()
      .domain([0, 1])
      .range([
        height - margin.bottom,
        margin.top
      ])
  );

  /*
   * Each group has a colour.
   *
   * A highlighted segment uses the colour belonging
   * to its parent group.
   */
  const colourScale = d3
    .scaleOrdinal()
    .domain(groupNames)
    .range([
      '#1f4e5f',
      '#00796b',
      '#5b8c3a',
      '#d49b2a',
      '#ad5d4e',
      '#685a9f',
      '#4d7fa8'
    ]);

  /*
   * Create chart points using the selected axis measures.
   */
  const points = $derived(
    SourceData
      .filter((point) =>
        selectedGroups.includes(point.group)
      )
      .map((point) => ({
        group: point.group,
        segment: point.segment,
        segmentKey: createSegmentKey(
          point.group,
          point.segment
        ),
        x: point.values[xMeasure],
        y: point.values[yMeasure]
      }))
      .filter(
        (point) =>
          Number.isFinite(point.x) &&
          Number.isFinite(point.y)
      )
  );

  /*
   * Group visible segments for the left-side panel.
   */
  const visibleSegmentGroups = $derived(
    groupNames
      .filter((group) =>
        selectedGroups.includes(group)
      )
      .map((group) => ({
        group,
        segments: points
          .filter((point) => point.group === group)
          .map((point) => ({
            group: point.group,
            segment: point.segment,
            segmentKey: point.segmentKey
          }))
      }))
  );

  const activePoint = $derived(
    activeSegment
      ? points.find(
          (point) =>
            point.segmentKey === activeSegment
        )
      : null
  );

  const activeGroupPoints = $derived(
    activeGroup
        ? points.filter(
            (point) => point.group === activeGroup
        )
        : []
    );

  function createSegmentKey(group, segment) {
    return `${group}|||${segment}`;
  }

  function toggleGroup(group) {
    if (selectedGroups.includes(group)) {
      if (selectedGroups.length === 1) {
        return;
      }

      selectedGroups = selectedGroups.filter(
        (item) => item !== group
      );

      /*
       * Clear the highlight if its group has just
       * been removed.
       */
      if (
        selectedSegment?.startsWith(`${group}|||`)
      ) {
        selectedSegment = null;
      }

      if (
        hoveredSegment?.startsWith(`${group}|||`)
      ) {
        hoveredSegment = null;
      }
    } else {
      selectedGroups = [
        ...selectedGroups,
        group
      ];
    }
  }

  function selectAllGroups() {
    selectedGroups = [...groupNames];
  }

  function resetGroups() {
    selectedGroups = [...groupNames];
    hoveredSegment = null;
    selectedSegment = null;
  }

  function swapAxes() {
    const oldX = xMeasure;

    xMeasure = yMeasure;
    yMeasure = oldX;
  }

  function previewGroup(group) {
    hoveredGroup = group;

    // Group preview takes precedence over an old segment preview.
    hoveredSegment = null;
}

    function clearGroupPreview() {
    hoveredGroup = null;
    }

    function selectGroup(group) {
    selectedGroup =
        selectedGroup === group
        ? null
        : group;

    selectedSegment = null;
    }

  function previewSegment(segmentKey) {
    hoveredSegment = segmentKey;
    hoveredGroup = null;
  }

  function clearSegmentPreview() {
    hoveredSegment = null;
  }

  function selectSegment(segmentKey) {
    selectedSegment =
      selectedSegment === segmentKey
        ? null
        : segmentKey;
    
    selectedGroup = null;
  }

  function clearSelection() {
    hoveredGroup = null;
    selectedGroup = null;
    hoveredSegment = null;
    selectedSegment = null;
  }

  function showTooltip(event, point) {
    hoveredPoint = point;
    hoveredSegment = point.segmentKey;

    updateTooltipPosition(event);
  }

  function updateTooltipPosition(event) {
    tooltipX = event.clientX;
    tooltipY = event.clientY;
  }

  function hideTooltip() {
    hoveredPoint = null;
    hoveredSegment = null;
  }

function getPointFill(point) {
  /*
   * One segment is active.
   */
  if (activeSegment) {
    return point.segmentKey === activeSegment
      ? colourScale(point.group)
      : '#d9dddc';
  }

  /*
   * One complete group is active.
   */
  if (activeGroup) {
    return point.group === activeGroup
      ? colourScale(point.group)
      : '#d9dddc';
  }

  /*
   * Default state: every point uses its group colour.
   */
  return colourScale(point.group);
}

function getPointOpacity(point) {
  if (activeSegment) {
    return point.segmentKey === activeSegment
      ? 1
      : 0.16;
  }

  if (activeGroup) {
    return point.group === activeGroup
      ? 1
      : 0.16;
  }

  return 0.78;
}

function getPointRadius(point) {
  if (activeSegment) {
    return point.segmentKey === activeSegment
      ? 9
      : 5.5;
  }

  if (activeGroup) {
    return point.group === activeGroup
      ? 7
      : 5.5;
  }

  return point.segment === 'Total'
    ? 7
    : 5.5;
}

  function handlePointKeydown(event, point) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      selectSegment(point.segmentKey);
    }

    if (event.key === 'Escape') {
      clearSelection();
    }
  }

  
</script>

<section class="scatter-plot">
  <header class="chart-header">
    <div>
      <h2>AI attitudes across employee segments</h2>

      <p>
        Choose a measure for each axis, filter the groups
        shown, and hover over a segment to reveal its
        position on the chart.
      </p>
    </div>
  </header>

  <!-- Existing checkbox and axis controls -->
  <ScatterPlotControls
    {measures}
    {segmentGroups}
    {xMeasure}
    {yMeasure}
    {selectedGroups}
    onXMeasureChange={(value) => {
      xMeasure = value;
    }}
    onYMeasureChange={(value) => {
      yMeasure = value;
    }}
    onToggleGroup={toggleGroup}
    onSelectAll={selectAllGroups}
    onResetGroups={resetGroups}
    onSwapAxes={swapAxes}
  />

  <div class="visualisation-layout">
    <!-- Segment selector on the left -->
    <ScatterSegmentList
      groups={visibleSegmentGroups}
      {colourScale}
      {hoveredGroup}
      {selectedGroup}
      {hoveredSegment}
      {selectedSegment}
      onPreviewGroup={previewGroup}
        onClearGroupPreview={clearGroupPreview}
        onSelectGroup={selectGroup}
        onPreviewSegment={previewSegment}
        onClearSegmentPreview={clearSegmentPreview}
        onSelectSegment={selectSegment}
    />

    <!-- Scatter plot on the right -->
    <div
      class="chart-wrapper"
      bind:clientWidth={containerWidth}
    >
      <svg
        width={chartWidth}
        {height}
        viewBox={`0 0 ${chartWidth} ${height}`}
        role="img"
        aria-labelledby="scatter-title scatter-description"
        onclick={(event) => {
          if (event.target === event.currentTarget) {
            clearSelection();
          }
        }}
      >
        <title id="scatter-title">
          Scatter plot comparing employee attitudes
        </title>

        <desc id="scatter-description">
          Each point represents an employee segment.
          Hovering or selecting a segment highlights the
          matching point and fades all other points.
        </desc>

        <ScatterPlotAxis
          {xScale}
          {yScale}
          width={chartWidth}
          {height}
          {margin}
          xLabel={xMeasure}
          yLabel={yMeasure}
        />

        <!-- Centre reference lines -->
        <line
          class="reference-line"
          x1={xScale(0.5)}
          x2={xScale(0.5)}
          y1={margin.top}
          y2={height - margin.bottom}
        />

        <line
          class="reference-line"
          x1={margin.left}
          x2={chartWidth - margin.right}
          y1={yScale(0.5)}
          y2={yScale(0.5)}
        />

        <!-- Points -->
        <g class="points">
          {#each points as point (point.segmentKey)}
            <circle
              class="point"
              class:active={
                point.segmentKey === activeSegment
              }
              cx={xScale(point.x)}
              cy={yScale(point.y)}
              r={getPointRadius(point)}
              fill={getPointFill(point)}
              opacity={getPointOpacity(point)}
              role="button"
              tabindex="0"
              aria-label={`${point.segment}, ${point.group}. Horizontal value ${Math.round(point.x * 100)}%. Vertical value ${Math.round(point.y * 100)}%.`}
              aria-pressed={
                selectedSegment === point.segmentKey
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
                selectSegment(point.segmentKey);
              }}
              onkeydown={(event) =>
                handlePointKeydown(event, point)}
            >
              <title>
                {point.segment}: {Math.round(point.x * 100)}%,
                {Math.round(point.y * 100)}%
              </title>
            </circle>
          {/each}
        </g>

        <!-- Active segment label -->
        {#if activeGroup && !activeSegment}
          <g
            class="active-label"
            in:fade={{ duration: 140 }}
            out:fade={{ duration: 80 }}
          >
          {#each activeGroupPoints as point}
            <text
                class="point-label"
              x={xScale(point.x) + 10}
              y={yScale(point.y)}
              dy="0.35em"
              fill={colourScale(point.group)}
            >
              {point.segment}
            </text>
            {/each}
          </g>
        {/if}

        {#if activePoint}
            <g
                class="active-label"
                in:fade={{ duration: 140 }}
                out:fade={{ duration: 80 }}
            >
                <text
                x={xScale(activePoint.x) + 14}
                y={yScale(activePoint.y)}
                dy="0.35em"
                fill={colourScale(activePoint.group)}
                >
                {activePoint.segment}
                </text>
            </g>
            {/if}
      </svg>
    </div>
  </div>

  <footer class="chart-footer">
    <span>
      Showing {points.length}
      {points.length === 1 ? ' point' : ' points'}
    </span>

    {#if selectedSegment}
      <button
        type="button"
        onclick={clearSelection}
      >
        Clear selection
      </button>
    {/if}
  </footer>

  <ScatterTooltip
    point={hoveredPoint}
    x={tooltipX}
    y={tooltipY}
    {xMeasure}
    {yMeasure}
    colour={
      hoveredPoint
        ? colourScale(hoveredPoint.group)
        : '#00796b'
    }
  />
</section>

<style>
  .scatter-plot {
    width: min(100%, 1200px);
    margin-inline: auto;
    color: #171a19;
    font-family: Arial, Helvetica, sans-serif;
  }

  .chart-header {
    margin-bottom: 1rem;
  }

  h2 {
    margin: 0;
    font-size: clamp(1.4rem, 2vw, 2rem);
  }

  .chart-header p {
    max-width: 730px;
    margin: 0.45rem 0 0;
    color: #626866;
    line-height: 1.45;
  }

  /*
   * Two-column structure inspired by the reference:
   *
   * left: segment selectors
   * right: scatter plot
   */
  .visualisation-layout {
    display: grid;
    grid-template-columns:
      minmax(190px, 235px)
      minmax(0, 1fr);
    gap: 1.25rem;
    align-items: stretch;
    margin-top: 1rem;
  }

  .chart-wrapper {
    width: 100%;
    min-width: 0;
    overflow-x: auto;
  }

  svg {
    display: block;
    width: 100%;
    min-width: 680px;
    height: auto;
    border: 1px solid #9da5a2;
    background: #eef2f0;
  }

  .reference-line {
    stroke: #b8bfbc;
    stroke-width: 1;
    pointer-events: none;
  }

  .point {
    cursor: pointer;
    stroke: white;
    stroke-width: 1.5;
    transition:
      cx 350ms ease,
      cy 350ms ease,
      r 160ms ease,
      fill 160ms ease,
      opacity 160ms ease,
      stroke 160ms ease;
  }

  .point:hover,
  .point:focus-visible {
    stroke: #151817;
    stroke-width: 2;
    outline: none;
  }

  .point.active {
    filter:
      drop-shadow(0 2px 4px rgb(0 0 0 / 25%));
  }

  .point-label {
    font-size: 10px;
    font-weight: 700;
    pointer-events: none;
    }

  .active-label text {
    font-size: 12px;
    font-weight: 800;
    pointer-events: none;
  }

  .chart-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    align-items: center;
    margin-top: 0.6rem;
    color: #68706d;
    font-size: 0.8rem;
  }

  .chart-footer button {
    border: 0;
    padding: 0;
    background: transparent;
    color: #176659;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  @media (max-width: 800px) {
    .visualisation-layout {
      grid-template-columns: 1fr;
    }
  }
</style>