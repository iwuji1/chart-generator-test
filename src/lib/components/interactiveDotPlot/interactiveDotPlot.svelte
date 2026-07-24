<script>
  import * as d3 from 'd3';
  import { fade, draw } from 'svelte/transition';
  import { onMount, tick } from 'svelte';

  import gsap from 'gsap/dist/gsap';
  import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

  import DotPlotAxis from '$lib/components/interactiveDotPlot/DotPlotAxis.svelte';
  import DotPlotLegend from '$lib/components/interactiveDotPlot/DotPlotLegend.svelte';
  import DotTooltip from '$lib/components/interactiveDotPlot/DotPlotTooltip.svelte';

  import {
    SourceData,
    createLongData,
    cohorts,
    years
  } from '$lib/datasets/dotplotdata';

  let {
    sourceData = SourceData,
    initialYear = 2026
  } = $props();

  /*
   * Data
   */
  const longData = $derived(
    createLongData(sourceData)
  );

  /*
   * Interaction state
   */
  let selectedYear = $state(initialYear);
  let selectedCohorts = $state([]);
  let hoveredCohort = $state(null);
  let hoveredPoint = $state(null);

  let tooltipX = $state(0);
  let tooltipY = $state(0);

  /*
   * DOM references
   */
  let chartSection;
  let sidebarPanel;

  /*
   * Chart width
   */
  let containerWidth = $state(1000);

  const minimumSvgWidth = 820;

  const width = $derived(
    Math.max(minimumSvgWidth, containerWidth)
  );

  /*
   * A hover preview temporarily overrides a clicked selection.
   */
  const activeCohorts = $derived.by(() => {
  const active = [...selectedCohorts];

  if (
    hoveredCohort &&
    !active.includes(hoveredCohort)
  ) {
    active.push(hoveredCohort);
  }

  return active;
});

  /*
   * Only one year is displayed in the main chart.
   */
  const currentYearData = $derived(
    longData.filter(
      (point) => point.year === selectedYear
    )
  );

  /*
   * Stable row keys preserve source order.
   */
  const rowKeys = $derived(
    sourceData.map((row, rowIndex) =>
      createRowKey(
        row.topic,
        row.response,
        rowIndex
      )
    )
  );

  const rowGroups = $derived(
    d3.group(
      currentYearData,
      (point) =>
        createRowKey(
          point.topic,
          point.response,
          point.rowIndex
        )
    )
  );

  /*
   * Group consecutive rows by topic.
   */
  const topicGroups = $derived.by(() => {
    const groups = [];
    let currentGroup = null;

    sourceData.forEach((row, rowIndex) => {
      if (
        !currentGroup ||
        currentGroup.topic !== row.topic
      ) {
        currentGroup = {
          topic: row.topic,
          startIndex: rowIndex,
          endIndex: rowIndex,
          rows: []
        };

        groups.push(currentGroup);
      }

      currentGroup.rows.push(row);
      currentGroup.endIndex = rowIndex;
    });

    return groups;
  });

  /*
   * Layout
   */
  const rowHeight = 42;
  const topicGap = 34;
  const topicHeadingHeight = 38;

  const margin = {
    top: 120,
    right: 55,
    bottom: 70,
    left: 330
  };

  function getTopicGapBefore(rowIndex) {
    return (
      topicGroups.filter(
        (group) =>
          group.startIndex > 0 &&
          group.startIndex <= rowIndex
      ).length * topicGap
    );
  }

  function getRowY(rowIndex) {
    return (
      margin.top +
      rowIndex * rowHeight +
      getTopicGapBefore(rowIndex)
    );
  }

  const plotBottom = $derived(
    sourceData.length > 0
      ? getRowY(sourceData.length - 1) +
          rowHeight / 2
      : margin.top
  );

  const height = $derived(
    plotBottom + margin.bottom
  );

  /*
   * D3 scales
   */
  const xScale = $derived(
    d3
      .scaleLinear()
      .domain([0, 100])
      .range([
        margin.left,
        width - margin.right
      ])
  );

  const colourScale = d3
    .scaleOrdinal()
    .domain(cohorts)
    .range([
      '#005F73',
      '#0A7C66',
      '#4D9341',//light green
      '#72B83E',//Dark green
      '#D6A83A',
      '#A65A46'
    ]);

  /*
 * Selected cohort lines
 */
const activeSeriesGroups = $derived.by(() => {
  return activeCohorts.map((cohort) => {
    const points = currentYearData
      .filter(
        (point) => point.cohort === cohort
      )
      .sort(
        (a, b) =>
          a.rowIndex - b.rowIndex
      );

    return {
      cohort,
      points
    };
  });
});

const activeLineGroups = $derived(
  activeSeriesGroups
    .map((series) => ({
      ...series,
      path:
        series.points.length > 1
          ? lineGenerator(series.points)
          : null
    }))
    .filter((series) => series.path)
);

  const lineGenerator = $derived(
    d3
      .line()
      .x((point) => xScale(point.value))
      .y((point) => getRowY(point.rowIndex))
      .curve(
        d3.curveCatmullRom.alpha(0.5)
      )
  );

  const activeLinePath = $derived(
    activeSeries.length > 1
      ? lineGenerator(activeSeries)
      : null
  );

  /*
   * Tooltip history
   */
  const tooltipHistory = $derived.by(() => {
    if (!hoveredPoint) {
      return [];
    }

    return longData
      .filter(
        (point) =>
          point.topic === hoveredPoint.topic &&
          point.response === hoveredPoint.response &&
          point.cohort === hoveredPoint.cohort
      )
      .sort((a, b) => a.year - b.year);
  });

  function createRowKey(
    topic,
    response,
    rowIndex
  ) {
    return `${rowIndex}|||${topic}|||${response}`;
  }

  function selectCohort(cohort) {
    /*
    * Clicking an already selected cohort
    * removes it.
    */
    if (selectedCohorts.includes(cohort)) {
      selectedCohorts =
        selectedCohorts.filter(
          (selected) => selected !== cohort
        );

      return;
    }

    /*
    * Add the cohort when fewer than two
    * cohorts are selected.
    */
    if (selectedCohorts.length < 2) {
      selectedCohorts = [
        ...selectedCohorts,
        cohort
      ];

      return;
    }

    /*
    * When two are already selected, replace
    * the oldest selection with the new one.
    */
    selectedCohorts = [
      selectedCohorts[1],
      cohort
    ];
  }

  function previewCohort(cohort) {
    hoveredCohort = cohort;
  }

  function clearPreview() {
    hoveredCohort = null;
  }

  function clearSelection() {
    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }

  function selectYear(year) {
    selectedYear = year;
    hoveredPoint = null;
  }

  function showTooltip(event, point) {
    hoveredPoint = point;
    hoveredCohort = point.cohort;

    updateTooltipPosition(event);
  }

  function updateTooltipPosition(event) {
    tooltipX = event.clientX;
    tooltipY = event.clientY;
  }

  function hideTooltip() {
    hoveredPoint = null;
    hoveredCohort = null;
  }

  function handleDotKeydown(event, point) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      selectCohort(point.cohort);
    }

    if (event.key === 'Escape') {
      clearSelection();
    }
  }

  function isActiveCohort(cohort) {
    return activeCohorts.includes(cohort);
  }

  function getDotFill(cohort) {
    if (!activeCohorts.length === 0) {
      return '#8C9593';
    }

    return isActiveCohort(cohort)
    ? colourScale(cohort)
    : '#CCD2D0';
  }

  function getDotOpacity(cohort) {
    if (activeCohorts.length === 0) {
      return 1;
    }

    return isActiveCohort(cohort)
      ? 1
      : 0.2;
  }

  function getDotRadius(cohort) {
    return isActiveCohort(cohort)
      ? 8
      : 5.5;
  }

  function getTopicBandY(group) {
    return (
      getRowY(group.startIndex) -
      rowHeight / 2 -
      22
    );
  }

  function getTopicBandHeight(group) {
    return (
      getRowY(group.endIndex) -
      getRowY(group.startIndex) +
      rowHeight +
      12
    );
  }

  function getValueLabelAnchor(value) {
    return value >= 90 ? 'end' : 'start';
  }

  function getValueLabelX(value) {
    return value >= 90
      ? xScale(value) - 13
      : xScale(value) + 13;
  }

  function removeSelectedCohort(cohort) {
    selectedCohorts =
      selectedCohorts.filter(
        (selected) => selected !== cohort
      );
  }

  function getCohortSelectionIndex(cohort) {
    return activeCohorts.indexOf(cohort);
  }

  function getComparisonLabelX(point, cohort) {
    const baseX = getValueLabelX(point.value);
    const index =
      getCohortSelectionIndex(cohort);

    /*
    * Slightly separate the two labels
    * horizontally.
    */
    return index === 1
      ? baseX + 4
      : baseX;
  }

  function getComparisonLabelY(point, cohort) {
    const baseY = getRowY(point.rowIndex);
    const index =
      getCohortSelectionIndex(cohort);

    /*
    * Place the first label slightly above
    * and the second slightly below the row.
    */
    if (activeCohorts.length < 2) {
      return baseY;
    }

    return index === 0
      ? baseY - 10
      : baseY + 10;
  }

  /*
   * GSAP sidebar pinning
   */
  onMount(() => {
    gsap.registerPlugin(ScrollTrigger);

    const mediaQuery = gsap.matchMedia();

    mediaQuery.add(
      '(min-width: 901px)',
      async () => {
        await tick();

        const topOffset = 24;

        const trigger = ScrollTrigger.create({
          trigger: chartSection,
          pin: sidebarPanel,

          start: `top top+=${topOffset}`,

          /*
           * Release when the sidebar bottom reaches
           * the chart section bottom.
           */
          end: () =>
            `bottom top+=${
              sidebarPanel.offsetHeight +
              topOffset
            }`,

          pinSpacing: false,
          invalidateOnRefresh: true,
          anticipatePin: 1

          // Use temporarily when debugging:
          // markers: true
        });

        const resizeObserver =
          new ResizeObserver(() => {
            ScrollTrigger.refresh();
          });

        resizeObserver.observe(chartSection);
        resizeObserver.observe(sidebarPanel);

        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
        });

        return () => {
          resizeObserver.disconnect();
          trigger.kill();
        };
      }
    );

    return () => {
      mediaQuery.revert();
    };
  });
</script>

<section
  class="dot-plot"
  bind:this={chartSection}
>
  <aside class="chart-sidebar">
    <div
      class="sidebar-panel"
      bind:this={sidebarPanel}
    >
      <div class="chart-heading">
        <h2>
          Employee priorities by leadership cohort
        </h2>

        <p>
          Select a cohort to follow its responses
          across all topics. Hover over a point to
          compare that response across years.
        </p>
      </div>

      <div class="year-control">
        <p class="control-label">
          View year
        </p>

        <div
          class="year-selector"
          role="group"
          aria-label="Select chart year"
        >
          {#each years as year}
            <button
              type="button"
              class:active={
                selectedYear === year
              }
              aria-pressed={
                selectedYear === year
              }
              onclick={() =>
                selectYear(year)}
            >
              {year}
            </button>
          {/each}
        </div>
      </div>

      <div class="legend-control">
        <p class="control-label">
          Compare up to two cohorts
        </p>

        <DotPlotLegend
          {cohorts}
          {colourScale}
          {selectedCohorts}
          {hoveredCohort}
          onSelect={selectCohort}
          onPreview={previewCohort}
          onClearPreview={clearPreview}
          vertical={true}
        />
      </div>

      {#if selectedCohorts.length > 0}
        <div class="selected-cohorts">
          {#each selectedCohorts as cohort}
            <button
              type="button"
              class="selected-cohort-button"
              style={`--cohort-colour: ${colourScale(cohort)}`}
              onclick={() =>
                removeSelectedCohort(cohort)}
            >
              <span class="selected-cohort-dot"></span>

              <span>{cohort}</span>

              <span aria-hidden="true">×</span>
            </button>
          {/each}

          <button
            type="button"
            class="clear-button"
            onclick={clearSelection}
          >
            Clear comparison
          </button>
        </div>
      {/if}
    </div>
  </aside>

  <div class="chart-content">
    <div
      class="chart-wrapper"
      bind:clientWidth={containerWidth}
    >
      <svg
        {width}
        {height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby="dot-plot-title dot-plot-description"
      >
        <title id="dot-plot-title">
          Employee priorities by cohort in
          {selectedYear}
        </title>

        <desc id="dot-plot-description">
          Select up to two cohorts to compare their
  responses across all topics. Hover over a
  point to compare that response across years.
        </desc>

        <!-- Topic backgrounds -->
        <g class="topic-bands">
          {#each topicGroups as group, i}
            <rect
              class="topic-band"
              x="0"
              y={getTopicBandY(group)}
              width={width}
              height={getTopicBandHeight(group)}
            />

            <rect
                class="topic-heading-bg"
                x="0"
                y={getTopicBandY(group)}
                width={margin.left}
                height={topicHeadingHeight}
            />

            <text
              class="topic-heading"
              x="18"
              y={getTopicBandY(group) + topicHeadingHeight/2}
              dominant-baseline="middle"
            >
              {group.topic}
            </text>
          {/each}
        </g>

        <!-- Percentage axis -->
        <DotPlotAxis
          {xScale}
          {margin}
          top={margin.top - 38}
          bottom={plotBottom}
        />

        <!-- Response rows -->
        <g class="rows">
          {#each rowKeys as rowKey, rowIndex}
            {@const values =
              rowGroups.get(rowKey) ?? []}

            {@const row =
              sourceData[rowIndex]}

            {@const minimum =
              d3.min(
                values,
                (point) => point.value
              )}

            {@const maximum =
              d3.max(
                values,
                (point) => point.value
              )}

            {@const rowY =
              getRowY(rowIndex)}

            <g class="response-row">
              <line
                class="row-guide"
                x1={margin.left}
                x2={width - margin.right}
                y1={rowY}
                y2={rowY}
              />

              {#if Number.isFinite(minimum) &&
                Number.isFinite(maximum)}
                <line
                  class="range-line"
                  x1={xScale(minimum)}
                  x2={xScale(maximum)}
                  y1={rowY}
                  y2={rowY}
                />
              {/if}

              <text
                class="response-label"
                x={margin.left - 20}
                y={rowY}
                dy="0.35em"
                text-anchor="end"
              >
                {row.response}
              </text>
            </g>
          {/each}
        </g>

        <!-- Connected highlighted cohort -->
        <!-- Connected highlighted cohorts -->
        <g class="active-lines">
          {#each activeLineGroups as series (
            `${series.cohort}-${selectedYear}`
          )}
            <path
              class="active-line active-line-outline"
              d={series.path}
              in:draw={{ duration: 350 }}
              out:fade={{ duration: 100 }}
            />

            <path
              class="active-line"
              d={series.path}
              stroke={colourScale(series.cohort)}
              in:draw={{ duration: 350 }}
              out:fade={{ duration: 100 }}
            />
          {/each}
        </g>

        <!-- Dots -->
        <g class="dots">
          {#each currentYearData as point}
            <circle
              class="dot"
              class:active-dot={
                isActiveCohort(point.cohort)
              }
              cx={xScale(point.value)}
              cy={getRowY(point.rowIndex)}
              r={getDotRadius(point.cohort)}
              fill={getDotFill(point.cohort)}
              opacity={getDotOpacity(
                point.cohort
              )}
              role="button"
              tabindex="0"
              aria-label={`${point.cohort}: ${point.value}% — ${point.topic}, ${point.response}`}
              aria-pressed={
                selectedCohorts.includes(point.cohort)
              }
              onmouseenter={(event) =>
                showTooltip(event, point)}
              onmousemove={
                updateTooltipPosition}
              onmouseleave={hideTooltip}
              onfocus={(event) =>
                showTooltip(event, point)}
              onblur={hideTooltip}
              onclick={(event) => {
                event.stopPropagation();
                selectCohort(point.cohort);
              }}
              onkeydown={(event) =>
                handleDotKeydown(
                  event,
                  point
                )}
            >
              <title>
                {point.cohort}: {point.value}%
              </title>
            </circle>
          {/each}
        </g>

        <!-- Selected values -->
        <!-- Selected values -->
        {#if activeSeriesGroups.length > 0}
          <g
            class="active-values"
            in:fade={{ duration: 180 }}
            out:fade={{ duration: 100 }}
          >
            {#each activeSeriesGroups as series}
              {#each series.points as point}
                <text
                  class="value-label"
                  x={getComparisonLabelX(
                    point,
                    series.cohort
                  )}
                  y={getComparisonLabelY(
                    point,
                    series.cohort
                  )}
                  dy="0.35em"
                  text-anchor={getValueLabelAnchor(
                    point.value
                  )}
                  fill={colourScale(
                    series.cohort
                  )}
                >
                  {point.value}%
                </text>
              {/each}
            {/each}
          </g>
        {/if}
      </svg>
    </div>
  </div>

  <DotTooltip
    point={hoveredPoint}
    history={tooltipHistory}
    x={tooltipX}
    y={tooltipY}
    activeYear={selectedYear}
    colour={
      hoveredPoint
        ? colourScale(hoveredPoint.cohort)
        : '#76bf3d'
    }
  />
</section>

<style>
  .dot-plot {
    display: grid;
    grid-template-columns:
      minmax(220px, 270px)
      minmax(0, 1fr);

    gap: clamp(1.5rem, 3vw, 3rem);
    align-items: start;

    width: 100%;
    min-width: 0;

    color: #171a19;
    font-family: 'gotham', Arial, sans-serif;
  }

  .chart-sidebar {
    position: relative;
    min-width: 0;
    width: 100%;
  }

  .sidebar-panel {
    display: grid;
    gap: 1.35rem;

    width: 100%;
    max-height: calc(100vh - 3rem);
    box-sizing: border-box;
    overflow-y: auto;

    padding: 1.2rem;

    border: 1px solid #dfe3e1;
    border-radius: 0.9rem;

    background: rgb(255 255 255 / 97%);
    box-shadow: 0 8px 30px rgb(0 0 0 / 7%);
  }

  .chart-content {
    width: 100%;
    min-width: 0;
  }

  .chart-wrapper {
    width: 100%;
    min-width: 0;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
  }

  svg {
    display: block;
    width: 100%;
    min-width: 820px;
    height: auto;
    background: white;
  }

  .chart-heading h2 {
    margin: 0;
    font-size: clamp(1.25rem, 2vw, 1.75rem);
    line-height: 1.08;
  }

  .chart-heading p {
    margin: 0.75rem 0 0;
    color: #626866;
    font-size: 0.88rem;
    line-height: 1.45;
  }

  .control-label {
    margin: 0 0 0.65rem;
    color: #626866;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .year-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
  }

  .year-selector button {
    border: 1px solid #d5dad8;
    border-radius: 999px;
    padding: 0.45rem 0.7rem;

    background: #f3f5f4;
    color: #525856;

    font: inherit;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
  }

  .year-selector button.active {
    border-color: #123f37;
    background: #123f37;
    color: white;
  }

  .clear-button {
    width: 100%;
    border: 1px solid #b9c0bd;
    border-radius: 999px;
    padding: 0.55rem 0.8rem;

    background: white;
    color: #252a28;

    font: inherit;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .topic-bands {
    fill: #f7f8f7;
  }

  .topic-heading-bg {
    fill: #eef2f0;
  }

  .topic-heading {
    fill: #123f37;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.035em;
    text-transform: uppercase;
  }

  .response-label {
    fill: #222725;
    font-size: 11px;
    font-weight: 600;
  }

  .row-guide {
    stroke: #dfe3e1;
    stroke-width: 1;
  }

  .range-line {
    stroke: #9da7a3;
    stroke-width: 2;
    stroke-linecap: round;
  }

  .active-line {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    stroke-linejoin: round;
    pointer-events: none;
  }

  .active-line-outline {
    stroke:white;
    stroke-width: 7;
    opacity: 0.9;
  }

  .dot {
    cursor: pointer;
    stroke: white;
    stroke-width: 1.5;

    transition:
      r 170ms ease,
      fill 170ms ease,
      opacity 170ms ease,
      stroke 170ms ease;
  }

  .dot:hover,
  .dot:focus-visible {
    stroke: #131716;
    stroke-width: 2;
    outline: none;
  }

  .active-dot {
    filter:
      drop-shadow(
        0 2px 3px rgb(0 0 0 / 24%)
      );
  }

  .value-label {
    font-size: 11px;
    font-weight: 800;
    pointer-events: none;

    paint-order: stroke;
    stroke: white;
    stroke-width: 3px;
    stroke-linejoin: round;
  }

  .selected-cohorts {
    display: grid;
    gap: 0.45rem;
  }

    .selected-cohort-button {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      width: 100%;

      border: 1px solid #d5dad8;
      border-radius: 999px;
      padding: 0.5rem 0.7rem;

      background: #f7f8f7;
      color: #252a28;

      font: inherit;
      font-size: 0.76rem;
      font-weight: 700;
      cursor: pointer;
    }

    .selected-cohort-button span:last-child {
      margin-left: auto;
      font-size: 1rem;
    }

    .selected-cohort-dot {
      width: 0.65rem;
      height: 0.65rem;
      flex: 0 0 auto;
      border-radius: 50%;
      background: var(--cohort-colour);
    }

  @media (max-width: 900px) {
    .dot-plot {
      grid-template-columns: 1fr;
    }

    .sidebar-panel {
      max-height: none;
      overflow: visible;
    }

    svg {
      min-width: 780px;
    }
  }
</style>