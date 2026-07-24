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

  /*
   * Use a compact chart for one year and the
   * complete height for historical Job Level data.
   */
  const height = $derived(
    data.length > 1
      ? 115
      : 54
  );

  const margin = {
    top: 7,
    right: 34,
    bottom: 5,
    left: 38
  };

  /*
   * Remove invalid entries and place the years in
   * chronological order.
   */
  const chartData = $derived.by(() => {
    return data
      .filter(
        (point) =>
          Number.isFinite(
            point.value
          )
      )
      .sort(
        (a, b) =>
          a.year - b.year
      );
  });

  const xScale = $derived(
    scaleLinear()
      .domain([0, 100])
      .range([
        margin.left,
        width - margin.right
      ])
  );

  const yearDomain = $derived(
    chartData.map(
      (point) =>
        String(point.year)
    )
  );

  const yScale = $derived(
    scaleBand()
      .domain(yearDomain)
      .range([
        margin.top,
        height - margin.bottom
      ])
      .padding(
        chartData.length > 1
          ? 0.28
          : 0.18
      )
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
    aria-label={`Historical comparison for ${chartData[0]?.cohort ?? 'selected cohort'}`}
  >
    {#each chartData as point}
      {@const barY =
        yScale(
          String(point.year)
        )}

      {@const barHeight =
        yScale.bandwidth()}

      {@const barWidth =
        xScale(point.value) -
        margin.left}

      <g
        class:active-row={
          point.year === activeYear
        }
      >
        <text
          class="year"
          class:active={
            point.year === activeYear
          }
          x={margin.left - 7}
          y={barY +
            barHeight / 2}
          dominant-baseline="middle"
          text-anchor="end"
        >
          {point.year}
        </text>

        <rect
          class="bar-background"
          x={margin.left}
          y={barY}
          width={
            xScale(100) -
            margin.left
          }
          height={barHeight}
          rx="2"
        />

        <rect
          class="bar"
          class:active={
            point.year === activeYear
          }
          x={margin.left}
          y={barY}
          width={Math.max(
            0,
            barWidth
          )}
          height={barHeight}
          rx="2"
        />

        <text
          class="value"
          class:active={
            point.year === activeYear
          }
          x={Math.min(
            xScale(point.value) + 6,
            width - 2
          )}
          y={barY +
            barHeight / 2}
          dominant-baseline="middle"
          text-anchor="start"
        >
          {point.value}%
        </text>
      </g>
    {/each}
  </svg>
</div>

<style>
  .mini-chart {
    margin-top: 0.55rem;
  }

  svg {
    display: block;

    width: 100%;
    height: auto;

    overflow: visible;
  }

  .bar-background {
    fill:
      rgb(255 255 255 / 9%);
  }

  .bar {
    fill:
      rgb(255 255 255 / 38%);

    transition:
      width 180ms ease,
      fill 180ms ease;
  }

  .bar.active {
    fill:
      var(--active-colour);
  }

  text {
    fill: white;

    font-family: inherit;
    font-size: 11px;
  }

  .year {
    opacity: 0.7;
  }

  .year.active {
    font-weight: 800;
    opacity: 1;
  }

  .value {
    font-weight: 700;
    opacity: 0.82;
  }

  .value.active {
    font-weight: 800;
    opacity: 1;
  }
</style>