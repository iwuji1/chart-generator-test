<script>
  import * as d3 from 'd3';
  import { Tween } from 'svelte/motion';
  import { cubicOut } from 'svelte/easing';

  import {
    SourceData,
    cohorts
  } from './statMotivationData.js';


  /* ---------------------------------
     Props
     --------------------------------- */

  let {
    sourceData = SourceData,
    initialCohort = 'AVERAGE'
  } = $props();


  /* ---------------------------------
     Selection state
     --------------------------------- */

  let selectedCohort = $state(
    cohorts.includes(initialCohort)
      ? initialCohort
      : cohorts[0]
  );

  let containerWidth = $state(900);


  /* ---------------------------------
     Years
     --------------------------------- */

  const years = [
    2024,
    2025,
    2026
  ];


  /* ---------------------------------
     Current cohort
     --------------------------------- */

  const currentIndex = $derived(
    cohorts.indexOf(
      selectedCohort
    )
  );

  const currentRow = $derived(
    sourceData.find(
      (row) =>
        row.cohort ===
        selectedCohort
    ) ??
      sourceData[0]
  );


  /* ---------------------------------
     Animated values

     Tween is NOT a Svelte store.

     Read:
       tween.current

     Update:
       tween.target = newValue
     --------------------------------- */

  const animated2024 =
    new Tween(0, {
      duration: 550,
      easing: cubicOut
    });

  const animated2025 =
    new Tween(0, {
      duration: 550,
      easing: cubicOut
    });

  const animated2026 =
    new Tween(0, {
      duration: 550,
      easing: cubicOut
    });


  /*
   * Whenever currentRow changes, animate
   * each year from its current displayed
   * value to the new cohort value.
   */
  $effect(() => {
    if (!currentRow) {
      return;
    }

    const value2024 =
      currentRow
        .values?.[2024];

    const value2025 =
      currentRow
        .values?.[2025];

    const value2026 =
      currentRow
        .values?.[2026];


    animated2024.target =
      Number.isFinite(
        value2024
      )
        ? value2024
        : 0;


    animated2025.target =
      Number.isFinite(
        value2025
      )
        ? value2025
        : 0;


    animated2026.target =
      Number.isFinite(
        value2026
      )
        ? value2026
        : 0;
  });


  /*
   * Used by the SVG loop so we can still
   * iterate over years rather than writing
   * three separate bars.
   */
  function getAnimatedValue(
    year
  ) {
    if (year === 2024) {
      return (
        animated2024.current
      );
    }

    if (year === 2025) {
      return (
        animated2025.current
      );
    }

    if (year === 2026) {
      return (
        animated2026.current
      );
    }

    return 0;
  }


  /* ---------------------------------
     Responsive dimensions
     --------------------------------- */

  const isMobile = $derived(
    containerWidth <= 680
  );

  const width = $derived(
    Math.max(
      300,
      Math.min(
        1100,
        containerWidth
      )
    )
  );

  const margin = $derived(
    isMobile
      ? {
          top: 62,
          right: 18,
          bottom: 24,
          left: 18
        }
      : {
          top: 72,
          right: 24,
          bottom: 30,
          left: 24
        }
  );


  /* ---------------------------------
     Bars
     --------------------------------- */

  const barHeight = $derived(
    isMobile
      ? 34
      : 48
  );

  const rowGap = $derived(
    isMobile
      ? 22
      : 28
  );

  const rowHeight = $derived(
    barHeight +
    rowGap
  );

  const chartTop = $derived(
    margin.top
  );

  const chartBottom = $derived(
    chartTop +
    years.length *
      rowHeight
  );

  const height = $derived(
    chartBottom +
    margin.bottom
  );


  /* ---------------------------------
     Scale + axis
     --------------------------------- */

  const xScale = $derived(
    d3
      .scaleLinear()
      .domain([
        0,
        100
      ])
      .range([
        margin.left,
        width -
          margin.right
      ])
  );

  const ticks = $derived(
    isMobile
      ? [
          0,
          25,
          50,
          75,
          100
        ]
      : [
          0,
          20,
          40,
          60,
          80,
          100
        ]
  );


  /* ---------------------------------
     Position helpers
     --------------------------------- */

  function getRowY(index) {
    return (
      chartTop +
      index *
        rowHeight
    );
  }


  /* ---------------------------------
     Cohort controls
     --------------------------------- */

  function changeCohort(
    cohort
  ) {
    if (
      !cohorts.includes(
        cohort
      )
    ) {
      return;
    }

    selectedCohort =
      cohort;
  }


  function previousCohort() {
    if (
      cohorts.length === 0
    ) {
      return;
    }

    const previousIndex =
      currentIndex <= 0
        ? cohorts.length - 1
        : currentIndex - 1;

    selectedCohort =
      cohorts[
        previousIndex
      ];
  }


  function nextCohort() {
    if (
      cohorts.length === 0
    ) {
      return;
    }

    const nextIndex =
      currentIndex >=
        cohorts.length - 1
        ? 0
        : currentIndex + 1;

    selectedCohort =
      cohorts[
        nextIndex
      ];
  }
</script>

<section
  class="motivation-chart"
>
  <div class="chart-heading">
    <!-- <h2>
      The (Employee) Motivation Dip No One Saw Coming
    </h2> -->
  </div>

  <div class="controls">
    <p class="control-label">
      View cohort
    </p>

    <div class="cohort-navigation">
      <button
        type="button"
        class="nav-button"
        onclick={
          previousCohort
        }
      >
        Prev
      </button>

      <select
        value={
          selectedCohort
        }
        onchange={(event) =>
          changeCohort(
            event
              .currentTarget
              .value
          )}
        aria-label="
          Select cohort
        "
      >
        {#each
          cohorts
          as cohort
        }
          <option
            value={cohort}
          >
            {cohort}
          </option>
        {/each}
      </select>

      <button
        type="button"
        class="nav-button"
        onclick={
          nextCohort
        }
      >
        Next
      </button>
    </div>
  </div>

  <div
    class="chart-wrapper"
    bind:clientWidth={
      containerWidth
    }
  >
    <svg
      {width}
      {height}
      viewBox={`
        0 0
        ${width}
        ${height}
      `}
      role="img"
      aria-label={`Motivation scores for ${selectedCohort}`}
    >
      <!-- axis -->
      <g
        class="axis"
        aria-hidden="true"
      >
        {#each
          ticks
          as tick
        }
          <line
            class="grid-line"
            x1={
              xScale(tick)
            }
            x2={
              xScale(tick)
            }
            y1={
              margin.top -
              18
            }
            y2={
              chartBottom -
              rowGap / 2
            }
          />

          <text
            class="axis-label"
            x={
              xScale(tick)
            }
            y={
              margin.top -
              30
            }
            text-anchor="
              middle
            "
          >
            {tick}<tspan
              font-size="7"
              baseline-shift="
                super
              "
            >%</tspan>
          </text>
        {/each}
      </g>

      <!-- bars -->
      <g class="bars">
      {#each years as year, index}
        {@const value =
            currentRow?.values?.[year]}

        {@const animatedValue =
            getAnimatedValue(year)}

        {@const rowY =
            getRowY(
            index
            )}

        <text
            class="year-label"
            x={margin.left}
            y={rowY - 8}
        >
            {year}
        </text>

        <line
            class="bar-background"
            x1={margin.left}
            x2={
            width -
            margin.right
            }
            y1={
            rowY +
            barHeight / 2
            }
            y2={
            rowY +
            barHeight / 2
            }
        />

        {#if
            Number.isFinite(
            value
            )
        }
            <rect
            class="bar"
            x={margin.left}
            y={rowY}
            width={
                xScale(
                animatedValue
                ) -
                margin.left
            }
            height={barHeight}
            />

            <text
            class="value-label"
            x={
                xScale(
                animatedValue
                ) - 10
            }
            y={
                rowY +
                barHeight / 2 +
                6
            }
            text-anchor="end"
            >
            {Math.round(
                animatedValue
            )}<tspan
                font-size="9"
                baseline-shift="super"
            >%</tspan>
            </text>

        {:else}

            <text
            class="missing-label"
            x={margin.left}
            y={
                rowY +
                barHeight / 2 +
                4
            }
            >
            No data
            </text>

        {/if}
        {/each}

      </g>
    </svg>
  </div>
</section>

<style>
  .motivation-chart {
    width: 100%;
    max-width: 1100px;

    margin-inline: auto;

    color: #171a19;

    font-family:
      'gotham',
      Arial,
      sans-serif;
  }

  .chart-heading {
    margin-bottom: 1rem;
  }

  .chart-heading h2 {
    margin: 0;

    color: #009b77;

    font-size: 32px;
    font-weight: 500;
    line-height: 1.15;

    text-transform: uppercase;
  }

  .chart-heading p {
    max-width: 980px;

    margin:
      0.75rem
      0
      0;

    color: #626866;

    font-size: 0.95rem;
    line-height: 1.5;
  }

  .controls {
    margin-bottom: 2rem;

    padding: 1.2rem;

    border:
      1px solid
      #dfe3e1;

    border-radius:
      1rem;

    background:
      white;

    box-shadow:
      0 7px 24px
      rgb(
        0 0 0 /
        8%
      );
  }

  .control-label {
    margin:
      0
      0
      0.6rem;

    color: #626866;

    font-size:
      0.72rem;

    font-weight: 800;

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }

  .cohort-navigation {
    display: grid;

    grid-template-columns:
      110px
      minmax(
        0,
        1fr
      )
      110px;

    gap: 0.75rem;

    align-items: center;
  }

  select {

    text-transform: uppercase;
    width: 100%;
    height: 44px;

    box-sizing:
      border-box;

    border:
      1px solid
      #89918e;

    padding:
      0
      0.75rem;

    background:
      #f8f9f8;

    color:
      #202422;

    font: inherit;
    font-size:
      0.86rem;
    font-weight: 600;
  }

  .nav-button {
    height: 44px;

    border: 0;

    border-radius:
      999px;

    padding:
      0
      1.2rem;

    background:
      #123f37;

    color: white;

    font: inherit;
    font-size:
      0.92rem;
    font-weight: 800;

    cursor: pointer;

    transition:
      background
        150ms ease,
      transform
        150ms ease;
  }

  .nav-button:hover,
  .nav-button:focus-visible {
    background:
      #05c690;

    outline: none;
  }

  .nav-button:active {
    transform:
      scale(0.97);
  }

  .chart-wrapper {
    width: 100%;
    min-width: 0;
  }

  svg {
    display: block;

    width: 100%;
    height: auto;

    overflow: visible;
  }

  .grid-line {
    stroke:
      #d8dddb;

    stroke-width: 1;

    stroke-dasharray:
      3 5;
  }

  .axis-label {
    fill:
      #525856;

    font-size: 11px;
  }

  .year-label {
    fill:
      #525856;

    font-size: 13px;
    font-weight: 800;
  }

  .bar-background {
    stroke:
      #edf0ef;

    stroke-width: 2;
  }

  .bar {
    fill:
      #007760;
  }

  .value-label {
    fill: white;

    font-size: 22px;
    font-weight: 800;
  }

  .missing-label {
    fill:
      #929995;

    font-size: 11px;
    font-style: italic;
  }

  @media (
    max-width: 680px
  ) {
    .chart-heading h2 {
      font-size:
        1.45rem;
    }

    .chart-heading p {
      font-size:
        0.82rem;
    }

    .controls {
      padding:
        0.85rem;
    }

    .cohort-navigation {
      grid-template-columns:
        1fr
        1fr;

      gap:
        0.55rem;
    }

    .cohort-navigation select {
      grid-column:
        1 / -1;

      grid-row: 1;
    }

    .nav-button {
      width: 100%;
    }

    .axis-label {
      font-size: 9px;
    }

    .year-label {
      font-size: 11px;
    }

    .value-label {
      font-size: 17px;
    }
  }
</style>