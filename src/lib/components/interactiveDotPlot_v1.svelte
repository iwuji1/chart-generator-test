<script>
  import * as d3 from 'd3';
  import { draw, fade } from 'svelte/transition';
  
  
  import AxisX from '$lib/components/axisX.svelte';
  import Legend from '$lib/components/legend.svelte';

  let { data } = $props();

  const cohorts = [
    'Total',
    'Board member',
    'CEO',
    'Tenured CEO',
    'First-time CEO'
  ];

  const cohortColours = {
    Total: '#202020',
    'Board member': '#006174',
    CEO: '#006b55',
    'Tenured CEO': '#58953f',
    'First-time CEO': '#76bf3d'
  };

  const neutralDotColour = '#9ca3af';
  const mutedDotColour = '#d1d5db';

  /*
   * The selection clicked by the user.
   * This remains active after the pointer leaves.
   */
  let selectedCohort = $state(null);

  /*
   * A temporary preview activated through hover/focus.
   */
  let hoveredCohort = $state(null);

  /*
   * Hover preview takes precedence over the locked selection.
   */
  const activeCohort = $derived(
    hoveredCohort ?? selectedCohort
  );

  /*
   * Clean the source rows.
   *
   * This removes:
   * - empty rows
   * - empty columns
   * - the trailing space in "First-time CEO "
   */
  const cleanedData = $derived(
    data
      .map((row) => {
        const cleanedRow = {};

        for (const [key, value] of Object.entries(row)) {
          const cleanedKey = key.trim();

          if (cleanedKey) {
            cleanedRow[cleanedKey] = value;
          }
        }

        return cleanedRow;
      })
      .filter((row) => row.Measure?.trim())
  );

  /*
   * Convert the wide source data to long plot data.
   */
  const plotData = $derived(
    cleanedData.flatMap((row, measureIndex) =>
      cohorts
        .map((cohort) => ({
          measure: row.Measure,
          measureIndex,
          cohort,
          value: Number(row[cohort])
        }))
        .filter((point) => Number.isFinite(point.value))
    )
  );

  const measures = $derived(
    d3.group(plotData, (point) => point.measure)
  );

  const measureNames = $derived(
    Array.from(measures.keys())
  );

  /*
   * Responsive chart dimensions
   */
  let containerWidth = $state(1100);

  const width = $derived(
    Math.max(760, containerWidth)
  );

  const rowHeight = 112;

  const margin = {
    top: 145,
    right: 70,
    bottom: 75,
    left: 430
  };

  const height = $derived(
    margin.top +
      measureNames.length * rowHeight +
      margin.bottom
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

  const yScale = $derived(
    d3
      .scalePoint()
      .domain(measureNames)
      .range([
        margin.top,
        height - margin.bottom
      ])
      .padding(0.5)
  );

  const colourScale = d3
    .scaleOrdinal()
    .domain(cohorts)
    .range(cohorts.map((cohort) => cohortColours[cohort]));

  /*
   * Extract all points belonging to the selected/hovered cohort.
   * The order follows the original response-topic order.
   */
  const activeSeries = $derived(
    activeCohort
      ? plotData
          .filter(
            (point) => point.cohort === activeCohort
          )
          .sort(
            (a, b) =>
              a.measureIndex - b.measureIndex
          )
      : []
  );

  /*
   * Create the connecting path.
   */
  const lineGenerator = $derived(
    d3
      .line()
      .x((point) => xScale(point.value))
      .y((point) => yScale(point.measure))
      .curve(d3.curveCatmullRom.alpha(0.5))
  );

  const activeLine = $derived(
    activeSeries.length > 1
      ? lineGenerator(activeSeries)
      : null
  );

  function selectCohort(cohort) {
    selectedCohort =
      selectedCohort === cohort ? null : cohort;
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
  }

  function handleKeydown(event, cohort) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectCohort(cohort);
    }
  }

  function getDotFill(cohort) {
    if (!activeCohort) {
      return neutralDotColour;
    }

    if (cohort === activeCohort) {
      return colourScale(cohort);
    }

    return mutedDotColour;
  }

  function getDotOpacity(cohort) {
    if (!activeCohort) {
      return 1;
    }

    return cohort === activeCohort ? 1 : 0.35;
  }

  function getDotRadius(cohort) {
    if (cohort === activeCohort) {
      return 8;
    }

    return cohort === 'Total' ? 6 : 5.5;
  }

  function wrapText(text, maxCharacters = 46) {
    const words = text.split(/\s+/);
    const lines = [];

    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine
        ? `${currentLine} ${word}`
        : word;

      if (
        testLine.length > maxCharacters &&
        currentLine
      ) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  function getValueLabelX(value) {
    const x = xScale(value);

    /*
     * Place labels on the left when a dot is close
     * to the right edge.
     */
    if (x > width - margin.right - 45) {
      return x - 13;
    }

    return x + 13;
  }

  function getValueLabelAnchor(value) {
    return xScale(value) >
      width - margin.right - 45
      ? 'end'
      : 'start';
  }
</script>

<div class="dot-plot">
  <Legend
    {cohorts}
    {colourScale}
    {selectedCohort}
    {hoveredCohort}
    onSelect={selectCohort}
    onPreview={previewCohort}
    onClearPreview={clearPreview}
  />

  <p class="instructions">
    Select a cohort to follow its responses across each
    topic. Select it again to clear the comparison.
  </p>

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
        Succession-planning responses by cohort
      </title>

      <desc id="dot-plot-description">
        Each row represents a response topic. Each dot
        represents the percentage response from one cohort.
        Selecting a cohort connects its responses across
        all topics.
      </desc>

      <AxisX
        {xScale}
        {height}
        {margin}
      />

      <!-- Row guides and labels -->
      <g class="rows">
        {#each measures as [measure, values]}
          {@const rowY = yScale(measure)}
          {@const minimum = d3.min(
            values,
            (point) => point.value
          )}
          {@const maximum = d3.max(
            values,
            (point) => point.value
          )}
          {@const labelLines = wrapText(measure)}

          <g
            class="measure-row"
            transform={`translate(0, ${rowY})`}
          >
            <!-- Full horizontal guide -->
            <line
              class="row-guide"
              x1={margin.left}
              x2={width - margin.right}
              y1="0"
              y2="0"
            />

            <!-- Min-to-max range -->
            <line
              class="range-line"
              x1={xScale(minimum)}
              x2={xScale(maximum)}
              y1="0"
              y2="0"
            />

            <!-- Response-topic label -->
            <text
              class="measure-label"
              x={margin.left - 28}
              y={-(labelLines.length - 1) * 10}
              text-anchor="end"
            >
              {#each labelLines as line, i}
                <tspan
                  x={margin.left - 28}
                  dy={i === 0 ? 0 : 21}
                >
                  {line}
                </tspan>
              {/each}
            </text>
          </g>
        {/each}
      </g>

      <!--
        Draw the selected path before the dots so that
        the dots remain on top of the line.
      -->
      {#if activeLine && activeCohort}
        {#key activeCohort}
          <path
            class="active-line"
            d={activeLine}
            stroke={colourScale(activeCohort)}
            in:draw={{ duration: 350 }}
            out:fade={{ duration: 120 }}
          />
        {/key}
      {/if}

      <!-- Dots -->
      <g class="dots">
        {#each measures as [measure, values]}
          {@const rowY = yScale(measure)}

          {#each values as point}
            <circle
              class:active-dot={point.cohort === activeCohort}
              class:inactive-dot={activeCohort &&
                point.cohort !== activeCohort}
              class="dot"
              cx={xScale(point.value)}
              cy={rowY}
              r={getDotRadius(point.cohort)}
              fill={getDotFill(point.cohort)}
              opacity={getDotOpacity(point.cohort)}
              role="button"
              tabindex="0"
              aria-label={`${point.cohort}, ${point.value}%: ${point.measure}`}
              aria-pressed={selectedCohort === point.cohort}
              onmouseenter={() =>
                previewCohort(point.cohort)}
              onmouseleave={clearPreview}
              onfocus={() =>
                previewCohort(point.cohort)}
              onblur={clearPreview}
              onclick={(event) => {
                event.stopPropagation();
                selectCohort(point.cohort);
              }}
              onkeydown={(event) =>
                handleKeydown(event, point.cohort)}
            >
              <title>
                {point.cohort}: {point.value}%
              </title>
            </circle>
          {/each}
        {/each}
      </g>

      <!-- Values for the active cohort -->
      {#if activeCohort}
        <g
          class="active-values"
          in:fade={{ duration: 180, delay: 180 }}
          out:fade={{ duration: 100 }}
        >
          {#each activeSeries as point}
            <text
              class="value-label"
              x={getValueLabelX(point.value)}
              y={yScale(point.measure)}
              dy="0.35em"
              text-anchor={getValueLabelAnchor(
                point.value
              )}
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
</div>

<style>
  .dot-plot {
    width: 100%;
    font-family: 'gotham', sans-serif;
  }

  .instructions {
    margin: 0.75rem 0 1rem;
    color: #5f6368;
    font-size: 0.9rem;
  }

  .chart-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  svg {
    display: block;
    width: 100%;
    min-width: 760px;
    height: auto;
    overflow: visible;
    background: white;
  }

  .row-guide {
    stroke: #e5e7eb;
    stroke-width: 1;
  }

  .range-line {
    stroke: #a7adb4;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .measure-label {
    fill: #151515;
    font-size: 15px;
    font-weight: 600;
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
      r 180ms ease,
      fill 180ms ease,
      opacity 180ms ease,
      stroke 180ms ease;
  }

  .dot:hover,
  .dot:focus-visible {
    stroke: #151515;
    stroke-width: 2;
    outline: none;
  }

  .active-dot {
    filter: drop-shadow(0 1px 2px rgb(0 0 0 / 20%));
  }

  .inactive-dot {
    pointer-events: auto;
  }

  .value-label {
    font-size: 14px;
    font-weight: 700;
    pointer-events: none;
  }

  .clear-button {
    margin-top: 0.8rem;
    border: 1px solid #b8bdc3;
    border-radius: 999px;
    padding: 0.5rem 0.85rem;
    background: white;
    color: #222;
    font: inherit;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .clear-button:hover {
    background: #f3f4f6;
  }
</style>