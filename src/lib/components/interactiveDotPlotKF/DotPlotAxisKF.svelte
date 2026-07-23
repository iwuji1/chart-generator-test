<script>
  let {
    xScale,
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
        y={top - 14}
        text-anchor="middle"
      >
        {tick}%
      </text>
    </g>
  {/each}
</g>

<style>
  .x-axis line {
    stroke: #d8dddb;
    stroke-width: 1;
    stroke-dasharray: 3 5;
  }

  .x-axis text {
    fill: #626966;
    font-family: 'gotham', Arial, sans-serif;
    font-size: 11px;
  }
</style>