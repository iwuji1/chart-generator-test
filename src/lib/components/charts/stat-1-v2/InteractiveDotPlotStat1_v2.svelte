<script>
  import * as d3 from 'd3';
  import {
    draw,
    fade
  } from 'svelte/transition';

  import DotPlotTooltipStat1 from './DotPlotTooltipStat1_v2.svelte';
  import DotPlotLegendStat1V2 from './DotPlotLegendStat1_v2.svelte';

  import {
    SourceData,
    createLongData,
    segments,
    segmentOptions
  } from './stat1Data_v2.js';


  let {
    sourceData = SourceData,
    initialSegment = 'Job Level'
  } = $props();

  let selectedView = $state('headline');

  const isHeadlineView = $derived(selectedView === 'headline')

  let selectedSegment = $state(
    segments.includes(initialSegment)
      ? initialSegment
      : segments[0]
  );

  let selectedCohorts = $state([]);

  const highlightedGroup = $derived(
    selectedCohorts[0] ?? ''
    );


  let hoveredCohort = $state(null);
  let hoveredPoint = $state(null);

  let tooltipX = $state(0);
  let tooltipY = $state(0);

  let containerWidth = $state(900);

  /*
   * Cohorts available for the currently selected
   * employee segment.
   */
  const cohorts = $derived(
    segmentOptions[selectedSegment] ?? []
  );

  /*
   * Current plotted values.
   */
  const currentDots = $derived(
    createLongData(
      sourceData,
      selectedSegment
    )
  );

  const cohortPoints = $derived(
    currentDots.filter(
      (point) =>
        point.cohort !== 'Total'
    )
  );

  const orderedCohortPoints = $derived.by(() => {
    return [...cohortPoints].sort(
      (a, b) => {
        const aSelected =
          selectedCohorts.includes(
            a.cohort
          );

        const bSelected =
          selectedCohorts.includes(
            b.cohort
          );

        return (
          Number(aSelected) - Number(bSelected)
        );
      }
    );
  });

  const totalPoints = $derived(
    currentDots.filter(
      (point) =>
        point.cohort === 'Total'
    )
  );

const headlinePoints =
  $derived.by(() => {
    return sourceData.flatMap(
      (row, rowIndex) => {
        return (
          row.headlines ?? []
        )
          .filter(
            (headline) =>
              Number.isFinite(
                headline.value
              )
          )
          .map((headline) => ({
            id:
              `${row.id}-headline-${headline.index}`,

            rowIndex,

            headlineIndex:
              headline.index,

            value:
              headline.value,

            cohort:
              headline.cohort,

            measure:
              row.measure,

            text:
              row.headlineText ?? ''
          }));
      }
    );
  });

  const selectedLinePath =
  $derived.by(() => {
    if (
      selectedSeries.length !== 1
    ) {
      return null;
    }

    const points =
      selectedSeries[0].points;

    return points.length > 1
      ? lineGenerator(points)
      : null;
  });

  /*
   * Responsive SVG dimensions.
   *
   * The chart can horizontally scroll on smaller
   * screens so the labels and marks remain legible.
   */
  const minimumSvgWidth = 760;

  const isMobile = $derived(
    containerWidth <= 680
  );

  const width = $derived(
    isMobile
    ? Math.max(
      280,
      containerWidth
    )
    : Math.max( 760,
      Math.min(
        900,
        containerWidth
      )
    )
  );

  const margin = $derived(
    isMobile
    ? {
      top: 70,
      right: 18,
      bottom: 46,
      left: 18
    }
    : {
      top: 72,
    right: 32,
    bottom: 58,
    left: 32
    }
    
  );

  /*
   * Reserve room above each row for its statement.
   */
  const rowHeight = $derived(
  isMobile
    ? 88
    : 65
);

const measureLabelHeight =
  $derived(
    isMobile
      ? 58
      : 38
  );

const measureLabelOffset =
  $derived(
    isMobile
      ? 78
      : 62
  );

const rowPlotOffset =
  $derived(
    isMobile
      ? 50
      : 38
  );

  function getRowY(rowIndex) {
  return (
    margin.top +
    rowIndex * rowHeight +
    rowPlotOffset
  );
}

  const plotBottom = $derived(
    sourceData.length > 0
      ? getRowY(
          sourceData.length - 1
        ) + 24
      : margin.top
  );

  const height = $derived(
    plotBottom + margin.bottom
  );

  const xScale = $derived(
    d3
      .scaleLinear()
      .domain([0, 100])
      .range([
        margin.left,
        width - margin.right
      ])
  );

  const axisTicks = $derived(
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

  /*
   * Comparison colours are assigned according to
   * selection order.
   */
  const comparisonColours = [
    '#05c690',
    '#007da4'
  ];

  function getHeadlineColour(
    headlineIndex
  ) {
    return comparisonColours[
      headlineIndex %
        comparisonColours.length
    ];
  }

  function getCohortColour(cohort) {
    const selectedIndex =
      selectedCohorts.indexOf(cohort);

    if (selectedIndex >= 0) {
      return comparisonColours[
        selectedIndex %
          comparisonColours.length
      ];
    }

    if (hoveredCohort === cohort) {
      return comparisonColours[0];
    }

    return '#8f9995';
  }

  /*
   * The grey range remains stable while users switch
   * between segments. It includes values from every
   * cohort and every segment for each statement.
   */
  const fixedRanges = $derived.by(() => {
    return sourceData.map(
      (row, rowIndex) => {
        const values = [
          row.total,

          ...Object.values(
            row.segments ?? {}
          ).flatMap(
            (segmentValues) =>
              Object.values(
                segmentValues ?? {}
              )
          )
        ].filter(Number.isFinite);

        if (values.length === 0) {
          return {
            rowIndex,
            minimum: null,
            maximum: null
          };
        }

        return {
          rowIndex,
          minimum: d3.min(values),
          maximum: d3.max(values)
        };
      }
    );
  });

  /*
   * Hover connection.
   *
   * It only appears when no cohorts have been locked
   * into the comparison state.
   */
  const hoverSeries = $derived.by(() => {
    if (
      !hoveredCohort ||
      selectedCohorts.length > 0
    ) {
      return [];
    }

    return cohortPoints
      .filter(
        (point) =>
          point.cohort ===
          hoveredCohort
      )
      .sort(
        (a, b) =>
          a.rowIndex -
          b.rowIndex
      );
  });

  const lineGenerator = $derived(
    d3
      .line()
      .defined(
        (point) =>
          Number.isFinite(
            point.value
          )
      )
      .x(
        (point) =>
          xScale(point.value)
      )
      .y(
        (point) =>
          getRowY(point.rowIndex)
      )
      .curve(
        d3.curveCatmullRom.alpha(
          0.5
        )
      )
  );

  const hoverLinePath = $derived(
    hoverSeries.length > 1
      ? lineGenerator(hoverSeries)
      : null
  );

  /*
   * Cohorts selected for persistent comparison.
   */
  const selectedSeries = $derived(
    selectedCohorts.map(
      (cohort) => ({
        cohort,

        points: cohortPoints
          .filter(
            (point) =>
              point.cohort === cohort
          )
          .sort(
            (a, b) =>
              a.rowIndex -
              b.rowIndex
          )
      })
    )
  );

  /*
   * One horizontal comparison line is drawn on each
   * row when exactly two cohorts are selected.
   */

  function selectSegment(segment) {
    selectedView = 'explore';
    selectedSegment = segment;

    /*
     * Selections from one segment may not exist in
     * another segment.
     */
    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }

  function selectHeadlineView() {
    selectedView = 'headline';
    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }

  function selectCohort(cohort) {
    /*
   * Clicking the currently selected cohort
   * deselects it.
   */
    if (
      selectedCohorts[0] === cohort
    ) {
      selectedCohorts = [];

      return;
    }

    /*
    * Only one cohort can ever be selected.
    * Selecting another simply replaces the
    * current selection.
    */
    selectedCohorts = [
      cohort
    ];
  }

  function previewCohort(cohort) {
    hoveredCohort = cohort;
  }

  function clearPreview() {
    /*
     * Do not clear a dot hover while the tooltip is
     * still active.
     */
    if (!hoveredPoint) {
      hoveredCohort = null;
    }
  }

  function clearSelection() {
    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }



  function showTooltip(
    event,
    point
  ) {
    hoveredPoint = point;
    hoveredCohort = point.cohort;

    updateTooltipPosition(event);
  }

  function updateTooltipPosition(
    event
  ) {
    tooltipX = event.clientX;
    tooltipY = event.clientY;
  }

  function hideTooltip() {
    hoveredPoint = null;
    hoveredCohort = null;
  }

  function handleDotKeydown(
    event,
    point
  ) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();

      selectCohort(
        point.cohort
      );
    }

    if (event.key === 'Escape') {
      clearSelection();
    }
  }

  function isSelected(cohort) {
    return selectedCohorts.includes(
      cohort
    );
  }

  function isHovered(cohort) {
    return (
      hoveredCohort === cohort
    );
  }

  function isHighlighted(cohort) {
    return (
      isSelected(cohort) ||
      (
        selectedCohorts.length === 0 &&
        isHovered(cohort)
      )
    );
  }

  function getDotFill(cohort) {
    if (isHighlighted(cohort)) {
      return getCohortColour(cohort);
    }

    return '#e3e6e5';
  }

  function getDotStroke(cohort) {
    if (isHighlighted(cohort)) {
      return '#111111';
    }

    return '#111111';
  }

  function getDotOpacity(cohort) {
    if (
      selectedCohorts.length === 0
    ) {
      return 0.5;
    }
    return isSelected(cohort)
      ? 1
      : 0.35;
  }

  function getDotRadius(cohort) {
    return isHighlighted(cohort)
      ? 9
      : 6;
  }

  function getLabelY(
    point,
    cohort
  ) {
    const selectionIndex =
      selectedCohorts.indexOf(
        cohort
      );

    /*
     * When two labels are close together, place the
     * first above the row and the second beneath it.
     */
    return selectionIndex === 0
      ? getRowY(point.rowIndex) + 23
      : getRowY(point.rowIndex) + 23;
  }
</script>

<section class="dot-plot-stat-1">
  <div class="chart-heading">
    <h2>
      Employee Workload and capabilities - v2
    </h2>

<p class="chart-explanation">
  This chart shows the levels of agreement with selected statements.
  You can filter to explore different segment groups and highlight cohorts to see all their related values.
  The
  <span class="inline-key average-key">
    <span
      class="average-marker-icon"
      aria-hidden="true"
    ></span>
  </span>
  marker is the average response percentage.
</p>
  </div>

  <div class="sticky-controls">
    <div class="controls">
      <div class="segment-control">
        <p class="control-label">
          Select View
        </p>
          <div
            class="segment-selector"
            role="group"
            aria-label="Select chart view"
          >
            <button
              type="button"
              class:active={
                isHeadlineView
              }
              aria-pressed={
                isHeadlineView
              }
              onclick={
                selectHeadlineView
              }
            >
              Global Average
            </button>

            {#each segments as segment}
              <button
                type="button"
                class:active={
                  !isHeadlineView &&
                  selectedSegment === segment
                }
                aria-pressed={
                  !isHeadlineView &&
                  selectedSegment === segment
                }
                onclick={() =>
                  selectSegment(segment)}
              >
                {segment}
              </button>
            {/each}
          </div>
      </div>

      {#if !isHeadlineView}
      <div class="cohort-control">
        <DotPlotLegendStat1V2
          {cohorts}
          {getCohortColour}
          {selectedCohorts}
          {hoveredCohort}
          onSelect={selectCohort}
          onPreview={previewCohort}
          onClearPreview={clearPreview} 
        />
      </div>
      {/if}
  </div>

  <div
    class="chart-wrapper"
    bind:clientWidth={containerWidth}
  >
    <svg
      {width}
      {height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby="
        stat-1-dot-plot-title
        stat-1-dot-plot-description
      "
    >
      <title id="stat-1-dot-plot-title">
        {#if isHeadlineView}
          Headline findings for how employees react
          to the use of AI
        {:else}
          How employees react to the use of AI by
          {selectedSegment}
        {/if}
      </title>

      <desc id="stat-1-dot-plot-description">
        {#if isHeadlineView}
          Each row represents a survey statement.
          Coloured circles show the editorially selected
          headline findings. Grey bars show the range
          across employee cohorts and black vertical
          markers show the average response.
        {:else}
          Each row represents a survey statement.
          Circles represent employee cohorts. Grey bars
          show the range across employee groups and black
          vertical markers show the average response.
        {/if}
      </desc>

      <!-- Percentage axis -->
      <g
        class="axis"
        aria-hidden="true"
      >
        <text
          class="axis-title"
          x={margin.left}
          y="14"
        >
          Percentage agreeing Scale
        </text>

        <line
          class="axis-baseline"
          x1={margin.left}
          x2={width - margin.right}
          y1="34"
          y2="34"
        />

        {#each axisTicks as tick}
          <line
            class="axis-tick-line"
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1="29"
            y2="39"
          />

          <text
            class="axis-tick-label"
            x={xScale(tick)}
            y="53"
            text-anchor="middle"
          >
            {tick}<tspan font-size= "7" baseline-shift="super">%</tspan>
          </text>

          <line
            class="axis-grid-line"
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1="58"
            y2={plotBottom}
          />
        {/each}
      </g>

      <!-- Stable background rows and ranges -->
      <g class="rows">
        {#each sourceData as row, rowIndex}
          {@const rowY =
            getRowY(rowIndex)}

          {@const range =
            fixedRanges[rowIndex]}

          <g class="statement-row">
            <foreignObject
              x={margin.left}
              y={rowY - measureLabelOffset}
              width={
                width -
                margin.left -
                margin.right
              }
              height={measureLabelHeight}
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="measure-label"
              >
                {row.measure}
              </div>
            </foreignObject>

            <line
              class="row-guide"
              x1={margin.left}
              x2={width - margin.right}
              y1={rowY}
              y2={rowY}
            />

            {#if
              Number.isFinite(
                range?.minimum
              ) &&
              Number.isFinite(
                range?.maximum
              )
            }
              <!-- <line
                class="range-line"
                x1={xScale(
                  range.minimum
                )}
                x2={xScale(
                  range.maximum
                )}
                y1={rowY}
                y2={rowY}
              /> -->
            {/if}
          </g>
        {/each}
      </g>

      <!-- Hover connection -->
      {#if
        !isHeadlineView &&
        hoverLinePath &&
        hoveredCohort &&
        selectedCohorts.length === 0 &&
        highlightedGroup
      }
        <g
          class="hover-line-group"
          in:fade={{
            duration: 100
          }}
          out:fade={{
            duration: 80
          }}
        >
          <path
            class="hover-line-outline"
            d={hoverLinePath}
          />

          <path
            class="hover-line"
            d={hoverLinePath}
            stroke={getCohortColour(
              hoveredCohort
            )}
            in:draw={{
              duration: 300
            }}
          />
        </g>
      {/if}

      {#if
        !isHeadlineView &&
        selectedLinePath &&
        highlightedGroup
      }
        <g
          class="selected-line-group"
          in:fade={{
            duration: 100
          }}
          out:fade={{
            duration: 80
          }}
        >
          <path
            class="hover-line-outline"
            d={selectedLinePath}
          />

          <path
            class="hover-line"
            d={selectedLinePath}
            stroke={getCohortColour(
              highlightedGroup
            )}
            in:draw={{
              duration: 300
            }}
          />
        </g>
      {/if}

      <!-- Non-interactive Total benchmark -->
       {#if !isHeadlineView}
      <g
        class="total-markers"
        aria-hidden="true"
      >
        {#each totalPoints as point}
        <text
          class="avg-value"
          x={xScale(point.value)}
          y={getRowY(point.rowIndex) - 16}
          text-anchor="middle"
          >
          {point.value}<tspan font-size= "7" baseline-shift="super">%</tspan>
        </text>
          <line
            class="total-marker-outline"
            x1={xScale(point.value)}
            x2={xScale(point.value)}
            y1={
              getRowY(
                point.rowIndex
              ) - 12
            }
            y2={
              getRowY(
                point.rowIndex
              ) + 12
            }
          />

          <line
            class="total-marker"
            x1={xScale(point.value)}
            x2={xScale(point.value)}
            y1={
              getRowY(
                point.rowIndex
              ) - 11
            }
            y2={
              getRowY(
                point.rowIndex
              ) + 11
            }
          />
        {/each}
      </g>
      {/if}
      <!-- Headline editorial points -->
      {#if isHeadlineView}
        <g
          class="headline-points"
          aria-label="Headline findings"
        >
          {#each
            headlinePoints
            as point
          }
            <circle
              class="headline-dot"
              cx={xScale(
                point.value
              )}
              cy={getRowY(
                point.rowIndex
              )}
              r="9"
              fill={getHeadlineColour(
                point.headlineIndex
              )}
              stroke="#111111"
              stroke-width="2"
            >
              <title>
                {point.cohort}:
                {point.value}%
              </title>
            </circle>
          {/each}
        </g>
      {/if}
      {#if isHeadlineView}
        <g
          class="headline-value-labels"
          aria-hidden="true"
        >
          {#each
            headlinePoints
            as point
          }
            <text
              class="headline-value-label"
              x={xScale(
                point.value
              )}
              y={
                point.headlineIndex === 0
                  ? getRowY(
                      point.rowIndex
                    ) - 14
                  : getRowY(
                      point.rowIndex
                    ) + 24
              }
              text-anchor="middle"
              fill={getHeadlineColour(
                point.headlineIndex
              )}
            >
              {point.value}<tspan
                font-size="7"
                baseline-shift="super"
              >%</tspan>
            </text>
          {/each}
        </g>
      {/if}
    {#if isHeadlineView}
        <g
          class="headline-cohort-labels"
          aria-hidden="true"
        >
          {#each
            headlinePoints
            as point
          }

            {#if point.headlineIndex === 1}
              <text
                class="headline-cohort-label"
                x={xScale(
                  point.value
                )}
                y={
                  getRowY(
                    point.rowIndex
                  ) + 36
                }
                text-anchor="middle"
                fill={getHeadlineColour(
                  point.headlineIndex
                )}
              >
                <!-- {point.cohort} -->
              </text>
            {/if}

          {/each}
        </g>
      {/if}


      <!-- Selectable cohort circles -->
       {#if !isHeadlineView && highlightedGroup}
      <g class="cohort-dots">
        {#each orderedCohortPoints as point}

          <circle
            class="dot"
            class:active-dot={
              isHighlighted(
                point.cohort
              )
            }
            cx={xScale(point.value)}
            cy={getRowY(
              point.rowIndex
            )}
            r={getDotRadius(
              point.cohort
            )}
            fill={getDotFill(
              point.cohort
            )}
            stroke={getDotStroke(
              point.cohort
            )}
            opacity={getDotOpacity(
              point.cohort
            )}
            role="button"
            tabindex="0"
            aria-pressed={
              isSelected(
                point.cohort
              )
            }
            onmouseenter={(event) =>
              showTooltip(
                event,
                point
              )}
            onmousemove={
              updateTooltipPosition}
            onmouseleave={hideTooltip}
            onfocus={(event) => {
                const bounds =
                    event.currentTarget.getBoundingClientRect();

              showTooltip({
                clientX:
                    bounds.left + bounds.width / 2,
                clientY:
                    bounds.top + bounds.height / 2
              },
              point
              );
              }}
            onblur={hideTooltip}
            onclick={(event) => {
              event.stopPropagation();

              selectCohort(
                point.cohort
              );
            }}
            onkeydown={(event) =>
              handleDotKeydown(
                event,
                point
              )}
          >
            <title>
              {point.cohort}:
              {point.value}<tspan font-size= "7" baseline-shift="super">%</tspan>
            </title>
          </circle>
        {/each}
      </g>
      {/if}


      <!-- Selected values -->
      {#if !isHeadlineView && selectedSeries.length > 0}
        <g
          class="selected-values"
          in:fade={{
            duration: 160
          }}
          out:fade={{
            duration: 80
          }}
        >
          {#each selectedSeries as series}
            {#each series.points as point}
              <text
                class="value-label"
                x={xScale(point.value)}
                y={getLabelY(
                  point,
                  series.cohort
                )}
                text-anchor="middle"
                fill={getCohortColour(
                  series.cohort
                )}
              >
                {point.value}<tspan font-size= "7" baseline-shift="super">%</tspan>
              </text>
            {/each}
          {/each}
        </g>
      {/if}
    </svg>
  </div>

  <DotPlotTooltipStat1
    point={hoveredPoint}
    x={tooltipX}
    y={tooltipY}
    colour={
      hoveredPoint
        ? getCohortColour(
            hoveredPoint.cohort
          )
        : '#05c690'
    }
  />
</section>

<style>
  .dot-plot-stat-1 {
    width: 100%;
    max-width: 900px;
    margin-inline: auto;
    overflow: visible;

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

    font-size:
      clamp(
        1.25rem,
        3vw,
        1.75rem
      );

    line-height: 1.15;
    text-transform: uppercase;
  }

  .chart-heading p {
    max-width: 760px;
    margin: 0.6rem 0 0;

    color: #626866;
    font-size: 0.85rem;
    line-height: 1.5;
  }
  @media (max-width: 680px) {
    .chart-heading h2 {
      font-size: 1.15rem;
      line-height: 1.15;
    }

    .chart-heading p {
      font-size: 0.8rem;
      line-height: 1.5;
    }
  }


  .sticky-controls {
    position: sticky;
    top: 12px;
    z-index: 20;

    display: grid;
    gap: 0.9rem;

    margin-bottom: 1.25rem;
    padding: 1rem;

    border: 1px solid #dfe3e1;
    border-radius: 0.9rem;

    background:
      rgb(255 255 255 / 96%);

    box-shadow:
      0 7px 24px
      rgb(0 0 0 / 8%);

    backdrop-filter:
      blur(8px);

    -webkit-backdrop-filter:
      blur(8px);
  }

  .controls {
    display: grid;
    grid-template-columns:
      minmax(0, 1fr);

    gap: 1rem;
    width: 100%;
  }

  .segment-control,
  .cohort-control {
    width: 100%;
    min-width: 0;
  }

  .control-label {
    margin: 0 0 0.55rem;

    color: #626866;
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .segment-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    width: 100%;
  }

  .segment-selector button {
    border: 1px solid #d5dad8;
    border-radius: 999px;
    padding: 0.42rem 0.68rem;

    background: #f3f5f4;
    color: #525856;

    font: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;

    transition:
      border-color 150ms ease,
      background 150ms ease,
      color 150ms ease;
  }

  .segment-selector button:hover,
  .segment-selector button:focus-visible {
    border-color: #8e9995;
    outline: none;
  }

  .segment-selector button.active {
    border-color: #123f37;
    background: #123f37;
    color: white;
  }

  @media (max-width: 680px) {
  .segment-selector {
    flex-wrap: nowrap;

    width: 100%;

    overflow-x: auto;
    overflow-y: hidden;

    padding-bottom: 0.25rem;

    overscroll-behavior-inline:
      contain;

    scrollbar-width: none;

    -webkit-overflow-scrolling:
      touch;
  }

  .segment-selector::-webkit-scrollbar {
    display: none;
  }

  .segment-selector button {
    flex: 0 0 auto;
    white-space: nowrap;
  }
}

  .chart-explanation {
    max-width: 72ch;
    margin: 0;
    color: #4b504d;
    font-size: 0.86rem;
    line-height: 1.7;
    }

    .inline-key {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;

    border-radius: 999px;
    padding: 0.08rem 0.42rem;

    /* font-size: 0.78rem;
    font-weight: 700; */

    vertical-align: middle;
    }

    .average-marker-icon {
      display: inline-block;
      width: 2px;
      height: 14px;
      border-radius: 999px;
      background: #111;
      flex: 0 0 auto;
    }

    .average-key {
    background: #f0f2f1;
    color: #222624;
    }

  .chart-wrapper {
    width: 100%;
    min-width: 0;

    overflow-x: auto;

    overscroll-behavior-inline:
      contain;
  }

  @media (max-width: 680px) {
    .chart-wrapper {
      overflow-x: visible;
    }
  }

  svg {
    display: block;

    width: 100%;
    height: auto;

    overflow: visible;
    background: white;
  }

  @media (min-width: 681px) {
    svg {
      min-width: 760px;
    }
  }

  .axis-title {
    fill: #626866;

    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.055em;
    text-transform: uppercase;
  }

  .axis-baseline,
  .axis-tick-line {
    stroke: #89918e;
    stroke-width: 1;
  }

  .axis-tick-label {
    fill: #626866;

    font-size: 10px;
    font-weight: 700;
  }

  .axis-grid-line {
    stroke: #d8dddb;
    stroke-width: 1;
    stroke-dasharray: 3 5;

    pointer-events: none;
  }

  .measure-label {
    display: flex;
    align-items: flex-end;

    width: 100%;
    height: 100%;

    color: #202422;

    font-size: 12px;
    font-weight: 700;
    line-height: 1.25;

    text-transform: none;
  }

  @media (max-width: 680px) {
    .measure-label {
      align-items: flex-end;

      font-size: 11px;
      line-height: 1.3;
    }
  }

  .row-guide {
    stroke: #dfe3e1;
    stroke-width: 1;
  }

  .hover-line,
  .hover-line-outline {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;

    pointer-events: none;
  }

  .hover-line-outline {
    stroke: white;
    stroke-width: 7;
  }

  .hover-line {
    stroke-width: 3;
  }

  .dot {
    box-sizing: border-box;

    cursor: pointer;
    stroke-width: 1.4;

    transition:
      r 180ms ease,
      fill 180ms ease,
      opacity 240ms ease,
      stroke 180ms ease,
      stroke-width 180ms ease;
  }

  .dot:hover,
  .dot:focus-visible,
  .active-dot {
    stroke-width: 2;
    outline: none;

    filter:
      drop-shadow(
        0 2px 3px
        rgb(0 0 0 / 20%)
      );
  }

  .total-markers {
    pointer-events: none;
  }

  .total-marker-outline {
    stroke: white;
    stroke-width: 7;
    stroke-linecap: round;
  }

  .total-marker {
    stroke: #111111;
    stroke-width: 3;
    stroke-linecap: round;
  }

  .avg-value {
    font-size: 10px;
    font-weight: 500;
  }

  .value-label {
    font-size: 10px;
    font-weight: 800;

    pointer-events: none;

    paint-order: stroke;
    stroke: white;
    stroke-width: 3px;
    stroke-linejoin: round;
  }

/* ---------------------------------
   Headline view
   --------------------------------- */

.headline-points,
.headline-value-labels,
.headline-cohort-labels,
.headline-dot {
  filter:
    drop-shadow(
      0 2px 3px
      rgb(0 0 0 / 18%)
    );
}

.headline-value-label {
  font-size: 10px;
  font-weight: 800;

  paint-order: stroke;
  stroke: white;
  stroke-width: 3px;
  stroke-linejoin: round;
}

.headline-cohort-label {
  font-size: 7px;
  font-weight: 700;

  paint-order: stroke;
  stroke: white;
  stroke-width: 2px;
  stroke-linejoin: round;
}
@media (max-width: 680px) {

  .dot-plot-stat-1 {
    width: 100%;
  }


  /* Heading */

  .chart-heading h2 {
    font-size: 1.15rem;
    line-height: 1.15;
  }

  .chart-heading p {
    font-size: 0.8rem;
    line-height: 1.5;
  }


  /* Controls */

  .sticky-controls {
    position: static;

    margin-bottom: 1rem;
    padding: 0.8rem;

    border-radius: 0.75rem;

    backdrop-filter: none;
    -webkit-backdrop-filter:
      none;
  }

  .controls {
    gap: 0.85rem;
  }


  /* Horizontally scrolling view tabs */

  .segment-selector {
    flex-wrap: nowrap;

    width: 100%;

    overflow-x: auto;
    overflow-y: hidden;

    padding-bottom: 0.25rem;

    overscroll-behavior-inline:
      contain;

    scrollbar-width: none;

    -webkit-overflow-scrolling:
      touch;
  }

  .segment-selector::-webkit-scrollbar {
    display: none;
  }

  .segment-selector button {
    flex: 0 0 auto;
    white-space: nowrap;
  }



  /* Chart fits viewport */

  .chart-wrapper {
    overflow-x: visible;
  }

  svg {
    min-width: 0;
    width: 100%;
  }


  /* More room for wrapped statements */

  .measure-label {
    align-items: flex-end;

    font-size: 11px;
    line-height: 1.3;
  }


  /* Slightly smaller annotation */

  }
</style>