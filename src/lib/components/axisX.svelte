<script>
  let {
    xScale,
    height,
    margin
  } = $props();

  const ticks = [0, 20, 40, 60, 80, 100];
</script>

<g class="x-axis">
  {#each ticks as tick}
    <g transform={`translate(${xScale(tick)}, 0)`}>
      <line
        y1={margin.top - 22}
        y2={height - margin.bottom}
      />

      <text
        x="0"
        y={margin.top - 35}
        text-anchor="middle"
      >
        {tick}%
      </text>
    </g>
  {/each}
</g>

<style>
  .x-axis line {
    stroke: #d5d8dc;
    stroke-width: 1;
    stroke-dasharray: 3 5;
  }

  .x-axis text {
    fill: #62676d;
    font-family: 'gotham', sans-serif;
    font-size: 13px;
  }
</style>