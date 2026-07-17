<script>
  import { tick } from 'svelte';
  import { scaleLinear } from 'd3-scale';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  let {
    data,
    average,
    darkMode = false
  } = $props();

  let width = $state(900);

  const height = 950;

  const padding = {
    top: 40,
    right: 0,
    bottom: 80,
    left: 40
  };

  const barHeight = 145;
  const rowHeight = 210;
  const rangeTop = 42;
  const rangeBottom = height - 35;

  const minimum = $derived(
    Math.min(...data.map((point) => point.value))
  );

  const maximum = $derived(
    Math.max(...data.map((point) => point.value))
  );

  const range = $derived(maximum - minimum);

  const chartMax = $derived(
    Math.max(71, maximum, average) + 2
  );

  const xScale = $derived(
    scaleLinear()
      .domain([0, chartMax])
      .range([padding.left, width - padding.right])
  );

  const rangeStartX = $derived(xScale(minimum));
  const rangeEndX = $derived(xScale(maximum));
  const averageX = $derived(xScale(average));

  const animatedValues = Tween.of(
    () => data.map(() => 0),
    {
      duration: 1000,
      easing: cubicOut
    }
  );

  async function animateChart() {
    await animatedValues.set(
      data.map(() => 0),
      {
        duration: 0
      }
    );

    await tick();

    animatedValues.set(
      data.map((point) => point.value),
      {
        duration: 1000,
        easing: cubicOut
      }
    );
  }

  $effect(() => {
    data;
    average;

    animateChart();
  });

  function getBarY(index) {
    return padding.top + index * rowHeight + 34;
  }

  function getHeadingY(index) {
    return padding.top + index * rowHeight + 28;
  }

  function getLabelX(value) {
    return Math.max(
      padding.left + 60,
      xScale(value) - 12
    );
  }
</script>

<div
  class:dark-mode={darkMode}
  class="chart"
  bind:clientWidth={width}
>
  <svg
    {width}
    {height}
    role="img"
    aria-label="Horizontal bar chart"
  >
    <!-- Dark-mode chart background -->
    <rect
      class="chart-background"
      x="0"
      y="0"
      width={width}
      height={height}
    />

    <!-- Highlighted range -->
    <rect
      class="range-background"
      x={rangeStartX}
      y={rangeTop}
      width={rangeEndX - rangeStartX}
      height={rangeBottom - rangeTop}
    />

    <!-- Average annotation -->
    <text
      class="average-label"
      x={averageX}
      y="28"
      text-anchor="middle"
    >
      Average
    </text>

    <line
      class="average-line"
      x1={averageX}
      x2={averageX}
      y1="34"
      y2={rangeBottom}
    />

    <!-- Bars -->
    {#each data as point, i}
      {@const animatedValue = animatedValues.current[i] ?? 0}

      <g>
        <text
          class="category-label"
          x={padding.left}
          y={getHeadingY(i)}
        >
          {point.label}
        </text>

        <rect
          class="bar"
          x={padding.left}
          y={getBarY(i)}
          width={Math.max(
            0,
            xScale(animatedValue) - padding.left
          )}
          height={barHeight}
          fill={point.color}
        />

        <text
          class="value-label"
          x={getLabelX(animatedValue)}
          y={getBarY(i) + barHeight / 2}
          text-anchor="end"
          dominant-baseline="middle"
        >
          <tspan>{Math.round(animatedValue)}</tspan>
          <tspan class="percentage-symbol">%</tspan>
        </text>
      </g>
    {/each}

    <!-- Range bracket -->
    <path
      class="range-bracket"
      d={`
        M ${rangeStartX} ${rangeBottom - 28}
        V ${rangeBottom}
        H ${rangeEndX}
        V ${rangeBottom - 28}
      `}
    />

    <text
      class="range-label"
      x={(rangeStartX + rangeEndX) / 2}
      y={rangeBottom - 8}
      text-anchor="middle"
    >
      <tspan>Range: {range}</tspan>
      <tspan class="pp-label">pp</tspan>
    </text>
  </svg>
</div>

<style>
  .chart {
    width: 100%;
    min-width: 0;

    --chart-background: #ffffff;
    --range-background: #dedfe0;
    --primary-text: #050505;
    --average-line: #111111;
    --bar-stroke: #111111;
    --range-bracket: #183d3d;
  }

  .chart.dark-mode {
    --chart-background: #073f35;
    --range-background: rgb(154 197 189 / 35%);
    --primary-text: #ffffff;
    --average-line: #ffffff;
    --bar-stroke: #082823;
    --range-bracket: #ffffff;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
  }

  .chart-background {
    fill: var(--chart-background);
    transition: fill 220ms ease;
  }

  .range-background {
    fill: var(--range-background);
    transition: fill 220ms ease;
  }

  .category-label {
    fill: var(--primary-text);
    font-size: 36px;
    font-weight: 700;
    font-family: "gotham", sans-serif;
    transition: fill 220ms ease;
  }

  .bar {
    stroke: var(--bar-stroke);
    stroke-width: 0px;
    transition: stroke 220ms ease;
  }

  .value-label {
    fill: #ffffff;
    font-size: 40px;
    font-weight: 600;
    font-family: "gotham", sans-serif;
  }

  .percentage-symbol {
    font-size: 25px;
    baseline-shift: super;
  }

  .average-label {
    fill: var(--primary-text);
    font-size: 29px;
    font-style: italic;
    font-family: "gotham", sans-serif;
    paint-order: stroke;
    stroke: var(--chart-background);
    stroke-width: 2px;
    stroke-linejoin: round;
    transition:
      fill 220ms ease,
      stroke 220ms ease;
  }

  .average-line {
    stroke: var(--average-line);
    stroke-width: 2.5px;
    stroke-dasharray: 2 7;
    stroke-linecap: round;
    transition: stroke 220ms ease;
  }

  .range-bracket {
    fill: none;
    stroke: var(--range-bracket);
    stroke-width: 1.5px;
    transition: stroke 220ms ease;
  }

  .range-label {
    fill: var(--primary-text);
    font-size: 27px;
    transition: fill 220ms ease;
  }

  .pp-label {
    font-size: 17px;
    baseline-shift: super;
    font-family: "gotham", sans-serif;
  }
</style>