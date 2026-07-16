<script>
  import * as d3 from 'd3';
  import AxisX from '$lib/components/axisX.svelte';
  import Legend from '$lib/components/legend.svelte';

  let { data } = $props();

  const groups = [
    'Total',
    'Board member',
    'CEO',
    'Tenured CEO',
    'First-time CEO'
  ];

  /*
   * Convert the original wide data into long data.
   *
   * The original "First-time CEO " property has a trailing
   * space, so normalise all property names first.
   */
  const cleanedData = $derived(
    data
      .map((row) => {
        const cleanedRow = {};

        for (const [key, value] of Object.entries(row)) {
          cleanedRow[key.trim()] = value;
        }

        return cleanedRow;
      })
      .filter((row) => row.Measure?.trim())
  );

  const plotData = $derived(
    cleanedData.flatMap((row) =>
      groups.map((group) => ({
        measure: row.Measure,
        group,
        value: Number(row[group])
      }))
    )
  );

  /*
   * Group the dots by question/measure.
   */
  const measures = $derived(
    d3.group(plotData, (d) => d.measure)
  );

  /*
   * Dimensions
   */
  const width = 1100;
  const rowHeight = 110;

  const margin = {
    top: 120,
    right: 40,
    bottom: 60,
    left: 430
  };

  const height = $derived(
    margin.top +
      measures.size * rowHeight +
      margin.bottom
  );

  /*
   * Scales
   *
   * Because these values are percentages, use a fixed
   * 0–100 domain rather than calculating the domain from
   * the current dataset.
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
      .domain(Array.from(measures.keys()))
      .range([
        margin.top,
        height - margin.bottom
      ])
      .padding(0.5)
  );

  const colorScale = d3
    .scaleOrdinal()
    .domain(groups)
    .range([
      '#202020',
      '#006174',
      '#006b55',
      '#58953f',
      '#76bf3d'
    ]);

  /*
   * Wrap a long label across multiple SVG tspans.
   */
  function wrapText(text, maxCharacters = 48) {
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
</script>

<div class="chart-container">
  <svg
    {width}
    {height}
    viewBox={`0 0 ${width} ${height}`}
    role="img"
    aria-labelledby="dot-plot-title dot-plot-description"
  >
    <title id="dot-plot-title">
      Common succession-planning mistakes
    </title>

    <desc id="dot-plot-description">
      Dot plot comparing responses from board members,
      CEOs, tenured CEOs and first-time CEOs.
    </desc>

    <!-- Colour legend -->
    <Legend {colorScale} />

    <!-- Horizontal percentage axis -->
    <AxisX
      {xScale}
      {height}
      {width}
      {margin}
    />

    <!-- One row per measure -->
    {#each measures as [measure, values]}
      {@const rowY = yScale(measure)}
      {@const minimum = d3.min(values, (d) => d.value)}
      {@const maximum = d3.max(values, (d) => d.value)}
      {@const labelLines = wrapText(measure)}

      <g
        class="measure"
        transform={`translate(0, ${rowY})`}
      >
        <!-- Full row guide -->
        <line
          class="row-guide"
          x1={margin.left}
          x2={width - margin.right}
          y1="0"
          y2="0"
        />

        <!-- Range between smallest and largest value -->
        <line
          class="range-line"
          x1={xScale(minimum)}
          x2={xScale(maximum)}
          y1="0"
          y2="0"
        />

        <!-- Measure label -->
        <text
          class="measure-label"
          x={margin.left - 24}
          y={-(labelLines.length - 1) * 9}
          text-anchor="end"
        >
          {#each labelLines as line, i}
            <tspan
              x={margin.left - 24}
              dy={i === 0 ? 0 : 20}
            >
              {line}
            </tspan>
          {/each}
        </text>

        <!-- Dots -->
        {#each values as value}
          <circle
            class="dot"
            cx={xScale(value.value)}
            cy="0"
            r={value.group === 'Total' ? 7 : 6}
            fill={colorScale(value.group)}
          >
            <title>
              {value.group}: {value.value}%
            </title>
          </circle>
        {/each}
      </g>
    {/each}
  </svg>
</div>

<style>
  .chart-container {
    width: 100%;
    overflow-x: auto;
    font-family: 'gotham', sans-serif;
  }

  svg {
    display: block;
    width: 100%;
    min-width: 800px;
    height: auto;
    overflow: visible;
    background: white;
  }

  .row-guide {
    stroke: #e5e5e5;
    stroke-width: 1px;
  }

  .range-line {
    stroke: #9ca3af;
    stroke-width: 2px;
  }

  .measure-label {
    fill: #111;
    font-size: 15px;
    font-weight: 600;
  }

  .dot {
    stroke: white;
    stroke-width: 1.5px;
  }

  .dot:hover {
    stroke: #111;
    stroke-width: 2px;
  }
</style>