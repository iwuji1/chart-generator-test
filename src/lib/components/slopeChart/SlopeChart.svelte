<script>
  import * as d3 from 'd3';

  import SlopeChartAxis from './SlopeChartAxis.svelte';
  import SlopeChartColumn from './SlopeChartColumn.svelte';
  import SlopeTooltip from './SlopeTooltip.svelte';

  import {
    measures,
    segmentGroups,
    SourceData
  } from '$lib/datasets/scatterPlotData.js';

  let {
    initialLeftMeasure = measures[10],
    initialRightMeasure = measures[3]
  } = $props();

  const groupNames = Object.keys(segmentGroups);

  /*
   * All columns are visible by default.
   */
  let selectedGroups = $state([...groupNames]);

  /*
   * Every column gets its own pair of measures.
   *
   * This means Job Level can compare one pair while
   * Industry compares another pair.
   */
    let leftMeasure = $state(initialLeftMeasure);
    let rightMeasure = $state(initialRightMeasure);

  /*
   * Interaction state
   */
  let hoveredLineKey = $state(null);
  let selectedLineKey = $state(null);

  const activeLineKey = $derived(
    hoveredLineKey ?? selectedLineKey
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
  let containerWidth = $state(1400);

  const minimumColumnWidth = 235;
  const visibleGroups = $derived(
    groupNames.filter((group) =>
      selectedGroups.includes(group)
    )
  );

  const minimumWidth = $derived(
    Math.max(
      900,
      visibleGroups.length * minimumColumnWidth
    )
  );

  const width = $derived(
    Math.max(minimumWidth, containerWidth)
  );

  const height = 820;

  const margin = {
    top: 65,
    right: 25,
    bottom: 250,
    left: 65
  };

  const plotTop = margin.top;
  const plotBottom = height - margin.bottom;

  /*
   * All values are proportions from 0 to 1.
   */
  const yScale = $derived(
    d3
      .scaleLinear()
      .domain([0, 1])
      .range([plotBottom, plotTop])
  );

  /*
   * One band for each visible segment group.
   */
  const columnScale = $derived(
    d3
      .scaleBand()
      .domain(visibleGroups)
      .range([margin.left, width - margin.right])
      .paddingInner(0.08)
      .paddingOuter(0.015)
  );

  const colourScale = d3
    .scaleOrdinal()
    .domain(groupNames)
    .range([
      '#9b5ba5',
      '#4778a8',
      '#57a34b',
      '#e65758',
      '#72b5b1',
      '#edc33a',
      '#f58a22'
    ]);

  /*
   * Data for each visible column.
   */
    const columns = $derived(
        visibleGroups.map((group) => {
            const lines = SourceData
            .filter((point) => point.group === group)
            .map((point) => ({
                group: point.group,
                segment: point.segment,
                lineKey: createLineKey(
                point.group,
                point.segment
                ),
                leftValue: point.values[leftMeasure],
                rightValue: point.values[rightMeasure],
                leftMeasure,
                rightMeasure
            }))
            .filter(
                (point) =>
                Number.isFinite(point.leftValue) &&
                Number.isFinite(point.rightValue)
            );

            return {
            group,
            lines
            };
        })
    );
    
    function createLineKey(group, segment) {
        return `${group}|||${segment}`;
    }
    
    function swapMeasures() {
        const previousLeft = leftMeasure;
        leftMeasure = rightMeasure;
        rightMeasure = previousLeft;
    }
    
    function toggleGroup(group) {
        if (selectedGroups.includes(group)) {
            if (selectedGroups.length === 1) {
        return;
      }

      selectedGroups = selectedGroups.filter(
        (item) => item !== group
      );
    } else {
      selectedGroups = [...selectedGroups, group];
    }

    clearSelection();
  }

  function selectAllGroups() {
    selectedGroups = [...groupNames];
  }

  function resetGroups() {
    selectedGroups = [...groupNames];
    clearSelection();
  }

  function previewLine(lineKey) {
    hoveredLineKey = lineKey;
  }

  function clearLinePreview() {
    hoveredLineKey = null;
  }

  function selectLine(lineKey) {
    selectedLineKey =
      selectedLineKey === lineKey
        ? null
        : lineKey;
  }

  function clearSelection() {
    hoveredLineKey = null;
    selectedLineKey = null;
    hoveredPoint = null;
  }

  function showTooltip(event, point) {
    hoveredPoint = point;
    hoveredLineKey = point.lineKey;

    tooltipX = event.clientX;
    tooltipY = event.clientY;
  }

  function moveTooltip(event) {
    tooltipX = event.clientX;
    tooltipY = event.clientY;
  }

  function hideTooltip() {
    hoveredPoint = null;
    hoveredLineKey = null;
  }

  function handleLineKeydown(event, lineKey) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      selectLine(lineKey);
    }

    if (event.key === 'Escape') {
      clearSelection();
    }
  }
</script>

<section class="slope-chart">
  <header class="chart-header">
    <div>
      <h2>AI attitudes across employee segments</h2>

      <p>
        Each column represents a segment group. Change the
        two measures beneath a column to compare them.
      </p>
    </div>
  </header>

  <div class="measure-controls">
    <label>
        <span>Left statement</span>

        <select bind:value={leftMeasure}>
        {#each measures as measure}
            <option 
            value={measure}
            disabled={measure === rightMeasure}
            >
            {measure}
            </option>
        {/each}
        </select>
    </label>

    <button
        type="button"
        class="swap-button"
        aria-label="Swap the left and right statements"
        onclick={swapMeasures}
    >
        <span class="swap-icon" aria-hidden="true">⇄</span>
        <span>Swap statements</span>
    </button>

    <label>
        <span>Right statement</span>

        <select bind:value={rightMeasure}>
        {#each measures as measure}
            <option 
            value={measure}
            disabled={measure === leftMeasure}
            >
            {measure}
            </option>
        {/each}
        </select>
    </label>
</div>

  <!-- Column visibility controls -->
  <div class="group-controls">
    <div class="group-control-heading">
      <div>
        <strong>Columns to display</strong>

        <span>
          {selectedGroups.length} of {groupNames.length}
        </span>
      </div>

      <div class="control-actions">
        <button
          type="button"
          onclick={selectAllGroups}
        >
          Select all
        </button>

        <button
          type="button"
          onclick={resetGroups}
        >
          Reset
        </button>
      </div>
    </div>

    <div class="group-options">
      {#each groupNames as group}
        <label>
          <input
            type="checkbox"
            checked={selectedGroups.includes(group)}
            onchange={() => toggleGroup(group)}
          />

          <span
            class="group-colour"
            style={`--group-colour: ${colourScale(group)}`}
          ></span>

          <span>{group}</span>
        </label>
      {/each}
    </div>
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
      aria-labelledby="slope-title slope-description"
      onclick={(event) => {
        if (event.target === event.currentTarget) {
          clearSelection();
        }
      }}
    >
      <title id="slope-title">
        Slope chart comparing AI attitude measures
      </title>

      <desc id="slope-description">
        Each column represents one employee segment group.
        Lines compare two selected measures for every
        segment within that group.
      </desc>

      <SlopeChartAxis
        {yScale}
        {width}
        {height}
        {margin}
      />

      {#each columns as column}
        {@const columnX = columnScale(column.group)}
        {@const columnWidth = columnScale.bandwidth()}

        <SlopeChartColumn
          {column}
          x={columnX}
          width={columnWidth}
          {height}
          {margin}
          {yScale}
          {leftMeasure}
          {rightMeasure}
          colour={colourScale(column.group)}
          {activeLineKey}
          {selectedLineKey}
          onPreviewLine={previewLine}
          onClearLinePreview={clearLinePreview}
          onSelectLine={selectLine}
          onShowTooltip={showTooltip}
          onMoveTooltip={moveTooltip}
          onHideTooltip={hideTooltip}
          onLineKeydown={handleLineKeydown}
        />
      {/each}
    </svg>
  </div>

  <footer>
    Showing {columns.reduce(
      (total, column) =>
        total + column.lines.length,
      0
    )} lines across {visibleGroups.length}
    {visibleGroups.length === 1
      ? ' column'
      : ' columns'}

    {#if selectedLineKey}
      <button
        type="button"
        onclick={clearSelection}
      >
        Clear selection
      </button>
    {/if}
  </footer>

  <SlopeTooltip
    point={hoveredPoint}
    x={tooltipX}
    y={tooltipY}
    colour={
      hoveredPoint
        ? colourScale(hoveredPoint.group)
        : '#4778a8'
    }
  />
</section>

<style>
  .slope-chart {
    width: min(100%, 1600px);
    margin-inline: auto;
    color: #202523;
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
    max-width: 760px;
    margin: 0.45rem 0 0;
    color: #69716e;
    line-height: 1.45;
  }

  .group-controls {
    display: grid;
    gap: 0.75rem;
    padding: 1rem;
    border: 1px solid #d6dbd9;
    border-radius: 0.8rem;
    background: #f8f9f8;
  }

  .group-control-heading {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }

  .group-control-heading > div:first-child {
    display: flex;
    gap: 0.5rem;
    align-items: baseline;
  }

  .group-control-heading strong {
    font-size: 0.85rem;
  }

  .group-control-heading span {
    color: #737a77;
    font-size: 0.75rem;
  }

  .group-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  .group-options label {
    display: inline-flex;
    gap: 0.4rem;
    align-items: center;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .group-colour {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 50%;
    background: var(--group-colour);
  }

  .control-actions {
    display: flex;
    gap: 0.75rem;
  }

  .control-actions button,
  footer button {
    border: 0;
    padding: 0;
    background: transparent;
    color: #167064;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
  }

  .chart-wrapper {
    width: 100%;
    margin-top: 1rem;
    overflow-x: auto;
  }

  svg {
    display: block;
    width: 100%;
    min-width: 900px;
    height: auto;
    border: 1px solid #d5dad8;
    background: #ffffff;
  }

  footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 0.65rem;
    color: #747b78;
    font-size: 0.78rem;
  }

  .measure-controls {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    auto
    minmax(0, 1fr);
  gap: 0.85rem;
  align-items: end;
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid #d6dbd9;
  border-radius: 0.8rem;
  background: #f8f9f8;
}

.measure-controls label {
  display: grid;
  gap: 0.4rem;
  min-width: 0;
}

.measure-controls label > span {
  color: #303633;
  font-size: 0.8rem;
  font-weight: 700;
}

.measure-controls select {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: 3.2rem;
  border: 1px solid #bfc6c3;
  border-radius: 0.5rem;
  padding: 0.65rem;
  background: white;
  color: #202523;
  font: inherit;
  line-height: 1.3;
}

.swap-button {
  display: grid;
  gap: 0.15rem;
  justify-items: center;
  min-width: 90px;
  border: 1px solid #bfc6c3;
  border-radius: 0.5rem;
  padding: 0.55rem 0.75rem;
  background: white;
  color: #24685d;
  font: inherit;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

.swap-icon {
  font-size: 1.15rem;
  line-height: 1;
}

.swap-button:hover,
.swap-button:focus-visible {
  border-color: #24685d;
  background: #f2f7f5;
  outline: none;
}

@media (max-width: 760px) {
  .measure-controls {
    grid-template-columns: 1fr;
  }

  .swap-button {
    justify-self: start;
  }
}
</style>