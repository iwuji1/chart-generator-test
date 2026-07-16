<script>
  let {
    xScale,
    margin,
    top,
    bottom
  } = $props();

  const ticks = [0, 20, 40, 60, 80, 100];
</script>

<g class="x-axis">
  {#each ticks as tick}
    <g transform={`translate(${xScale(tick)}, 0)`}>
      <line
        y1={top}
        y2={bottom}
      />

      <text
        x="0"
        y={top - 15}
        text-anchor="middle"
      >
        {tick}%
      </text>
    </g>
  {/each}

  <text
    class="axis-title"
    x={xScale(50)}
    y={top - 47}
    text-anchor="middle"
  >
    Percentage of respondents
  </text>
</g>

<style>
  .x-axis line {
    stroke: #ccd2cf;
    stroke-width: 1;
    stroke-dasharray: 3 5;
  }

  .x-axis text {
    fill: #626966;
    font-family: 'gotham', sans-serif;
    font-size: 12px;
  }

  .x-axis .axis-title {
    fill: #303633;
    font-size: 13px;
    font-weight: 700;
  }
</style>