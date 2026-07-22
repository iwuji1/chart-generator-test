<script>
  let {
    yScale,
    width,
    height,
    margin
  } = $props();

  const ticks = [
    0,
    0.1,
    0.2,
    0.3,
    0.4,
    0.5,
    0.6,
    0.7,
    0.8,
    0.9,
    1
  ];

  function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
  }
</script>

<g class="axis">
  {#each ticks as tick}
    <g transform={`translate(0, ${yScale(tick)})`}>
      <line
        class:major={tick === 0.5}
        x1={margin.left}
        x2={width - margin.right}
      />

      <text
        x={margin.left - 11}
        y="0"
        dy="0.35em"
        text-anchor="end"
      >
        {formatPercent(tick)}
      </text>
    </g>
  {/each}

  <g
    transform={`translate(18, ${
      (margin.top + height - margin.bottom) / 2
    }) rotate(-90)`}
  >
    <text
      class="axis-title"
      text-anchor="middle"
    >
      Percentage of respondents
    </text>
  </g>
</g>

<style>
  line {
    stroke: #e0e4e2;
    stroke-width: 1;
  }

  line.major {
    stroke: #bfc6c3;
  }

  text {
    fill: #68706d;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
  }

  .axis-title {
    fill: #303633;
    font-size: 11px;
    font-weight: 700;
  }
</style>