<script>
  let {
    xScale,
    yScale,
    width,
    height,
    margin,
    xLabel,
    yLabel
  } = $props();

  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1];

  function formatTick(value) {
    return `${Math.round(value * 100)}%`;
  }

  function wrapText(text, maxCharacters = 55) {
    const words = text.split(/\s+/);
    const lines = [];

    let currentLine = '';

    for (const word of words) {
      const nextLine = currentLine
        ? `${currentLine} ${word}`
        : word;

      if (
        nextLine.length > maxCharacters &&
        currentLine
      ) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = nextLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  const xLabelLines = $derived(
    wrapText(xLabel, 75)
  );

  const yLabelLines = $derived(
    wrapText(yLabel, 48)
  );
</script>

<g class="axes">
  <!-- Vertical gridlines and x-axis ticks -->
  {#each ticks as tick}
    <g transform={`translate(${xScale(tick)}, 0)`}>
      <line
        class="grid-line"
        y1={margin.top}
        y2={height - margin.bottom}
      />

      <text
        class="tick-label"
        x="0"
        y={height - margin.bottom + 24}
        text-anchor="middle"
      >
        {formatTick(tick)}
      </text>
    </g>
  {/each}

  <!-- Horizontal gridlines and y-axis ticks -->
  {#each ticks as tick}
    <g transform={`translate(0, ${yScale(tick)})`}>
      <line
        class="grid-line"
        x1={margin.left}
        x2={width - margin.right}
      />

      <text
        class="tick-label"
        x={margin.left - 14}
        y="0"
        dy="0.35em"
        text-anchor="end"
      >
        {formatTick(tick)}
      </text>
    </g>
  {/each}

  <!-- X-axis title -->
  <text
    class="axis-label x-label"
    x={(margin.left + width - margin.right) / 2}
    y={height - 72}
    text-anchor="middle"
  >
    {#each xLabelLines as line, i}
      <tspan
        x={(margin.left + width - margin.right) / 2}
        dy={i === 0 ? 0 : 17}
      >
        {line}
      </tspan>
    {/each}
  </text>

  <!-- Y-axis title -->
  <g
    transform={`translate(25, ${
      (margin.top + height - margin.bottom) / 2
    }) rotate(-90)`}
  >
    <text
      class="axis-label y-label"
      text-anchor="middle"
      y="0"
    >
      {#each yLabelLines as line, i}
        <tspan
          x="0"
          dy={i === 0 ? 0 : 17}
        >
          {line}
        </tspan>
      {/each}
    </text>
  </g>
</g>

<style>
  .grid-line {
    stroke: #d8dddb;
    stroke-width: 1;
  }

  .tick-label {
    fill: #68716e;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11px;
  }

  .axis-label {
    fill: #252b29;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: 700;
  }
</style>