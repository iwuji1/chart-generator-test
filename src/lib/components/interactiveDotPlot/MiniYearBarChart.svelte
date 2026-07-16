<script>
  import {
    scaleBand,
    scaleLinear
  } from 'd3-scale';

  let {
    data = [],
    activeYear,
    colour = '#76bf3d'
  } = $props();

  const width = 280;
  const height = 115;

  const margin = {
    top: 9,
    right: 32,
    bottom: 5,
    left: 38
  };

  const xScale = $derived(
    scaleLinear()
      .domain([0, 100])
      .range([
        margin.left,
        width - margin.right
      ])
  );

  const yearDomain = $derived(
    data.map((point) => String(point.year))
  );

  const yScale = $derived(
    scaleBand()
      .domain(yearDomain)
      .range([
        margin.top,
        height - margin.bottom
      ])
      .padding(0.28)
  );
</script>

<div
  class="mini-chart"
  style={`--active-colour: ${colour}`}
>
  <svg
    {width}
    {height}
    viewBox={`0 0 ${width} ${height}`}
    role="img"
    aria-label={`Historical comparison for ${data[0]?.cohort ?? 'selected cohort'}`}
  >
    {#each data as point}
      {@const barY = yScale(String(point.year))}
      {@const barHeight = yScale.bandwidth()}
      {@const barWidth = xScale(point.value) - margin.left}

      <g>
        <text
          class="year"
          x={margin.left - 7}
          y={barY + barHeight / 2}
          dominant-baseline="middle"
          text-anchor="end"
        >
          {point.year}
        </text>

        <rect
          class="bar-background"
          x={margin.left}
          y={barY}
          width={xScale(100) - margin.left}
          height={barHeight}
          rx="2"
        />

        <rect
          class="bar"
          class:active={point.year === activeYear}
          x={margin.left}
          y={barY}
          width={Math.max(0, barWidth)}
          height={barHeight}
          rx="2"
        />

        <text
          class="value"
          x={xScale(point.value) + 6}
          y={barY + barHeight / 2}
          dominant-baseline="middle"
        >
          {point.value}%
        </text>
      </g>
    {/each}
  </svg>
</div>

<style>
  .mini-chart {
    margin-top: 0.75rem;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .bar-background {
    fill: rgb(255 255 255 / 9%);
  }

  .bar {
    fill: rgb(255 255 255 / 38%);
  }

  .bar.active {
    fill: var(--active-colour);
  }

  text {
    fill: white;
    font-family: inherit;
    font-size: 11px;
  }

  .year {
    opacity: 0.8;
  }

  .value {
    font-weight: 800;
  }
</style>