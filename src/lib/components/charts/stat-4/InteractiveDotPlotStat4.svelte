<script>
  import * as d3 from 'd3';

  import {
    draw,
    fade
  } from 'svelte/transition';

  import DotPlotLegendStat4
    from './DotPlotLegendStat4.svelte';

  import DotPlotTooltipStat4
    from './DotPlotTooltipStat4.svelte';

  import {
    SourceData,
    createLongData,
    segments,
    segmentOptions,
    topicOrder
  } from './stat4Data.js';

  let {
    sourceData = SourceData,
    initialSegment = 'Job Level'
  } = $props();

  let selectedView =
    $state('headline');

  const isHeadlineView =
    $derived(
      selectedView ===
        'headline'
    );

  let selectedSegment =
    $state(
      segments.includes(
        initialSegment
      )
        ? initialSegment
        : segments[0]
    );

  let selectedCohorts =
    $state([]);

  const highlightedCohort =
    $derived(
      selectedCohorts[0] ?? ''
    );

  const comparisonCohort =
    $derived(
      selectedCohorts[1] ?? ''
    );

  let hoveredCohort =
    $state(null);

  let hoveredPoint =
    $state(null);

  let tooltipX =
    $state(0);

  let tooltipY =
    $state(0);

  let containerWidth =
    $state(940);

  /* ---------------------------------
     Data
     --------------------------------- */

  const orderedSourceData =
    $derived.by(() => {
      return [...sourceData]
        .sort((a, b) => {
          const topicA =
            topicOrder.indexOf(
              a.topic
            );

          const topicB =
            topicOrder.indexOf(
              b.topic
            );

          if (
            topicA !== topicB
          ) {
            return (
              topicA -
              topicB
            );
          }

          return (
            a.order -
            b.order
          );
        });
    });

  const cohorts =
    $derived.by(() => {
      return (
        segmentOptions[
          selectedSegment
        ] ?? []
      );
    });

  const currentDots =
    $derived.by(() => {
      return createLongData(
        orderedSourceData,
        selectedSegment
      );
    });

  /*
   * Some versions of Stat 4 use "Average";
   * others may use "AVERAGE". Both remain
   * selectable radio options.
   *
   * Only an old "Total" helper point is removed.
   */
  const cohortPoints =
    $derived.by(() => {
      return currentDots.filter(
        (point) =>
          point.cohort !== 'Total'
      );
    });

  const orderedCohortPoints =
    $derived.by(() => {
      return [...cohortPoints]
        .sort((a, b) => {
          function priority(
            cohort
          ) {
            if (
              cohort ===
              highlightedCohort
            ) {
              return 3;
            }

            if (
              cohort ===
              comparisonCohort
            ) {
              return 2;
            }

            if (
              cohort ===
              hoveredCohort
            ) {
              return 1;
            }

            return 0;
          }

          return (
            priority(a.cohort) -
            priority(b.cohort)
          );
        });
    });

  const headlinePoints =
    $derived.by(() => {
      return orderedSourceData
        .flatMap(
          (
            row,
            rowIndex
          ) => {
            return (
              row.headlines ?? []
            )
              .filter(
                (headline) =>
                  Number.isFinite(
                    headline.value
                  )
              )
              .map(
                (headline) => ({
                  id:
                    `${row.id}-headline-${headline.index}`,

                  rowIndex,

                  headlineIndex:
                    headline.index,

                  value:
                    headline.value,

                  cohort:
                    headline.cohort,

                  topic:
                    row.topic,

                  reason:
                    row.reason,

                  text:
                    row.headlineText ??
                    ''
                })
              );
          }
        );
    });

  /* ---------------------------------
     Dimensions
     --------------------------------- */

  const isMobile =
    $derived(
      containerWidth <= 680
    );

  const width =
    $derived(
      isMobile
        ? Math.max(
            280,
            containerWidth
          )
        : Math.max(
            760,
            Math.min(
              940,
              containerWidth
            )
          )
    );

  /*
   * This larger top value reserves space
   * for the complete axis before the first
   * topic heading begins.
   */
  const margin =
    $derived(
      isMobile
        ? {
            top: 154,
            right: 18,
            bottom: 52,
            left: 18
          }
        : {
            top: 154,
            right: 38,
            bottom: 64,
            left: 38
          }
    );

  const rowHeight =
    $derived(
      isMobile
        ? 118
        : 96
    );

  const topicGap =
    $derived(
      isMobile
        ? 78
        : 72
    );

  const topicGroups =
    $derived.by(() => {
      const groups = [];
      let currentGroup = null;

      orderedSourceData.forEach(
        (
          row,
          rowIndex
        ) => {
          if (
            !currentGroup ||
            currentGroup.topic !==
              row.topic
          ) {
            currentGroup = {
              topic: row.topic,
              startIndex: rowIndex,
              endIndex: rowIndex
            };

            groups.push(
              currentGroup
            );
          }

          currentGroup.endIndex =
            rowIndex;
        }
      );

      return groups;
    });

  function isTopicStart(
    rowIndex
  ) {
    return topicGroups.some(
      (group) =>
        group.startIndex ===
        rowIndex
    );
  }

  function getTopicGapBefore(
    rowIndex
  ) {
    return (
      topicGroups.filter(
        (group) =>
          group.startIndex > 0 &&
          group.startIndex <=
            rowIndex
      ).length *
      topicGap + 15
    );
  }

  function getRowY(
    rowIndex
  ) {
    return (
      margin.top +
      rowIndex *
        rowHeight +
      getTopicGapBefore(
        rowIndex
      )
    );
  }

  const plotBottom =
    $derived(
      orderedSourceData.length
        ? getRowY(
            orderedSourceData.length -
              1
          ) + 32
        : margin.top
    );

  const height =
    $derived(
      plotBottom +
        margin.bottom
    );

  const xScale =
    $derived(
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

  const axisTicks =
    $derived(
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
     Colours
     --------------------------------- */

  const highlightColour =
    '#009b77';

  const highlightBorderColour =
    '#00634f';

  const comparisonColour =
    '#007da4';

  const defaultDotFill =
    '#e3e6e5';

  const defaultDotStroke =
    '#8f9995';

  function getCohortColour(
    cohort
  ) {
    if (
      cohort ===
      highlightedCohort
    ) {
      return highlightColour;
    }

    if (
      cohort ===
      comparisonCohort
    ) {
      return comparisonColour;
    }

    if (
      cohort ===
      hoveredCohort
    ) {
      return highlightColour;
    }

    return defaultDotStroke;
  }

  function getCohortTextColour(
    cohort
  ) {
    if (
      cohort ===
      highlightedCohort
    ) {
      return highlightBorderColour;
    }

    if (
      cohort ===
      comparisonCohort
    ) {
      return comparisonColour;
    }

    if (
      cohort ===
      hoveredCohort
    ) {
      return highlightBorderColour;
    }

    return '#272c2a';
  }

  function getDotFill(
    cohort
  ) {
    if (
      cohort ===
      highlightedCohort
    ) {
      return highlightColour;
    }

    if (
      cohort ===
      comparisonCohort
    ) {
      return '#ffffff';
    }

    if (
      cohort ===
      hoveredCohort
    ) {
      return '#ffffff';
    }

    return defaultDotFill;
  }

  function getDotStroke(
    cohort
  ) {
    if (
      cohort ===
      highlightedCohort
    ) {
      return highlightBorderColour;
    }

    if (
      cohort ===
      comparisonCohort
    ) {
      return comparisonColour;
    }

    if (
      cohort ===
      hoveredCohort
    ) {
      return highlightBorderColour;
    }

    return defaultDotStroke;
  }

  function getHeadlineColour(
    headlineIndex
  ) {
    return headlineIndex === 0
      ? highlightColour
      : comparisonColour;
  }

  /* ---------------------------------
     Comparison
     --------------------------------- */

  const selectedSeries =
    $derived.by(() => {
      return selectedCohorts.map(
        (cohort) => ({
          cohort,

          points:
            cohortPoints
              .filter(
                (point) =>
                  point.cohort ===
                  cohort
              )
              .sort(
                (a, b) =>
                  a.rowIndex -
                  b.rowIndex
              )
        })
      );
    });

  const comparisonRows =
    $derived.by(() => {
      if (
        selectedSeries.length !== 2
      ) {
        return [];
      }

      const [
        firstSeries,
        secondSeries
      ] = selectedSeries;

      return orderedSourceData
        .map(
          (
            row,
            rowIndex
          ) => {
            const firstPoint =
              firstSeries.points.find(
                (point) =>
                  point.rowIndex ===
                  rowIndex
              );

            const secondPoint =
              secondSeries.points.find(
                (point) =>
                  point.rowIndex ===
                  rowIndex
              );

            if (
              !firstPoint ||
              !secondPoint
            ) {
              return null;
            }

            return {
              rowIndex,

              firstCohort:
                firstSeries.cohort,

              secondCohort:
                secondSeries.cohort,

              firstPoint,
              secondPoint
            };
          }
        )
        .filter(Boolean);
    });

  function getGradientId(
    rowIndex
  ) {
    return (
      `stat-4-gradient-${rowIndex}`
    );
  }

  function getGradientDetails(
    comparison
  ) {
    const firstValue =
      comparison.firstPoint.value;

    const secondValue =
      comparison.secondPoint.value;

    if (
      firstValue <= secondValue
    ) {
      return {
        x1:
          xScale(firstValue),

        x2:
          xScale(secondValue),

        startColour:
          getCohortColour(
            comparison.firstCohort
          ),

        endColour:
          getCohortColour(
            comparison.secondCohort
          )
      };
    }

    return {
      x1:
        xScale(secondValue),

      x2:
        xScale(firstValue),

      startColour:
        getCohortColour(
          comparison.secondCohort
        ),

      endColour:
        getCohortColour(
          comparison.firstCohort
        )
    };
  }

  /* ---------------------------------
     Selection
     --------------------------------- */

  function selectHeadlineView() {
    selectedView =
      'headline';

    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }

  function getDefaultComparison(
    segment
  ) {
    const availableCohorts =
      segmentOptions[segment] ?? [];

    const comparableCohorts =
      availableCohorts.filter(
        (cohort) =>
          cohort !== 'Average' &&
          cohort !== 'AVERAGE'
      );

    if (
      comparableCohorts.length === 0
    ) {
      return [];
    }

    if (
      comparableCohorts.length === 1
    ) {
      return [
        comparableCohorts[0]
      ];
    }

    return [
      comparableCohorts[0],
      comparableCohorts[
        comparableCohorts.length - 1
      ]
    ];
  }

  function selectSegment(
    segment
  ) {
    if (
      !segments.includes(
        segment
      )
    ) {
      return;
    }

    selectedView =
      'explore';

    selectedSegment =
      segment;

    selectedCohorts =
      getDefaultComparison(
        segment
      );

    hoveredCohort = null;
    hoveredPoint = null;
  }

  function selectCohort(
    cohort
  ) {
    if (
      !cohorts.includes(
        cohort
      )
    ) {
      return;
    }

    const selectedIndex =
      selectedCohorts.indexOf(
        cohort
      );

    if (
      selectedIndex >= 0
    ) {
      selectedCohorts =
        selectedCohorts.filter(
          (selected) =>
            selected !== cohort
        );

      hoveredCohort = null;
      hoveredPoint = null;
      return;
    }

    if (
      selectedCohorts.length === 0
    ) {
      selectedCohorts = [
        cohort
      ];

      return;
    }

    if (
      selectedCohorts.length === 1
    ) {
      selectedCohorts = [
        ...selectedCohorts,
        cohort
      ];

      return;
    }

    selectedCohorts = [
      selectedCohorts[0],
      cohort
    ];
  }

  function previewCohort(
    cohort
  ) {
    hoveredCohort =
      cohort;
  }

  function clearPreview() {
    if (!hoveredPoint) {
      hoveredCohort = null;
    }
  }

  /* ---------------------------------
     Tooltip
     --------------------------------- */

  function showTooltip(
    event,
    point
  ) {
    hoveredPoint =
      point;

    hoveredCohort =
      point.cohort;

    tooltipX =
      event.clientX;

    tooltipY =
      event.clientY;
  }

  function updateTooltipPosition(
    event
  ) {
    tooltipX =
      event.clientX;

    tooltipY =
      event.clientY;
  }

  function hideTooltip() {
    hoveredPoint = null;
    hoveredCohort = null;
  }

  function handleDotClick(
    event,
    point
  ) {
    event.stopPropagation();

    showTooltip(
      event,
      point
    );

    selectCohort(
      point.cohort
    );
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

    if (
      event.key === 'Escape'
    ) {
      selectedCohorts = [];
      hoveredCohort = null;
      hoveredPoint = null;
    }
  }

  /* ---------------------------------
     Dots
     --------------------------------- */

  function isSelected(
    cohort
  ) {
    return selectedCohorts.includes(
      cohort
    );
  }

  function isHovered(
    cohort
  ) {
    return (
      hoveredCohort ===
      cohort
    );
  }

  function isHighlighted(
    cohort
  ) {
    return (
      isSelected(cohort) ||
      isHovered(cohort)
    );
  }

  function getDotOpacity(
    cohort
  ) {
    /*
     * There is no background cloud of circles.
     * Only selected or previewed dots display.
     */
    if (
      selectedCohorts.length === 0 &&
      !hoveredCohort
    ) {
      return 0;
    }

    if (isSelected(cohort)) {
      return 1;
    }

    if (isHovered(cohort)) {
      return 1;
    }

    return 0;
  }

  function isDotHidden(
    cohort
  ) {
    return (
      getDotOpacity(cohort) === 0
    );
  }

  function getDotRadius(
    cohort
  ) {
    return isHighlighted(cohort)
      ? 12
      : 10;
  }

  /* ---------------------------------
     Value label positions
     --------------------------------- */

  const valueLabelGap = 20;

  function getOtherSelectedPoint(
    point,
    cohort
  ) {
    const otherCohort =
      selectedCohorts.find(
        (selected) =>
          selected !== cohort
      );

    if (!otherCohort) {
      return null;
    }

    return (
      cohortPoints.find(
        (candidate) =>
          candidate.rowIndex ===
            point.rowIndex &&
          candidate.cohort ===
            otherCohort
      ) ?? null
    );
  }

  function getLabelSide(
    point,
    cohort
  ) {
    const otherPoint =
      getOtherSelectedPoint(
        point,
        cohort
      );

    if (!otherPoint) {
      return point.value >= 88
        ? 'left'
        : 'right';
    }

    if (
      point.value <
      otherPoint.value
    ) {
      return 'left';
    }

    if (
      point.value >
      otherPoint.value
    ) {
      return 'right';
    }

    return (
      selectedCohorts.indexOf(
        cohort
      ) === 0
        ? 'left'
        : 'right'
    );
  }

  function getLabelX(
    point,
    cohort
  ) {
    const side =
      getLabelSide(
        point,
        cohort
      );

    const dotX =
      xScale(point.value);

    if (side === 'left') {
      return Math.max(
        margin.left + 2,
        dotX - valueLabelGap
      );
    }

    return Math.min(
      width -
        margin.right -
        2,
      dotX +
        valueLabelGap
    );
  }

  function getLabelAnchor(
    point,
    cohort
  ) {
    return (
      getLabelSide(
        point,
        cohort
      ) === 'left'
        ? 'end'
        : 'start'
    );
  }

  function getLabelY(
    point,
    cohort
  ) {
    const otherPoint =
      getOtherSelectedPoint(
        point,
        cohort
      );

    if (
      otherPoint &&
      point.value ===
        otherPoint.value
    ) {
      return (
        selectedCohorts.indexOf(
          cohort
        ) === 0
          ? getRowY(
              point.rowIndex
            ) - 25
          : getRowY(
              point.rowIndex
            ) + 25
      );
    }

    return (
      getRowY(
        point.rowIndex
      ) + 4
    );
  }

  function getHeadlineLabelX(
    point
  ) {
    const dotX =
      xScale(point.value);

    return point.value >= 88
      ? dotX - 20
      : dotX + 20;
  }

  function getHeadlineLabelAnchor(
    point
  ) {
    return point.value >= 88
      ? 'end'
      : 'start';
  }
</script>

<section class="dot-plot-stat-4">
  <div class="chart-heading">
    <!-- <h2>
      The New Currency Is Certainty
    </h2> -->
  </div>

  <div class="sticky-controls">
    <div class="controls">
      <div class="segment-control">
        <p class="control-label">
          Select view
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

          {#each
            segments
            as segment
          }
            <button
              type="button"
              class:active={
                !isHeadlineView &&
                selectedSegment ===
                  segment
              }
              aria-pressed={
                !isHeadlineView &&
                selectedSegment ===
                  segment
              }
              onclick={() =>
                selectSegment(
                  segment
                )}
            >
              {segment}
            </button>
          {/each}
        </div>
      </div>

      {#if !isHeadlineView}
        {#key selectedSegment}
          <div class="cohort-control">
            <p class="control-label">
              Select up to two cohorts
            </p>

            <DotPlotLegendStat4
              {cohorts}
              {getCohortTextColour}
              {selectedCohorts}
              {hoveredCohort}
              onSelect={selectCohort}
              onPreview={previewCohort}
              onClearPreview={
                clearPreview
              }
            />
          </div>
        {/key}
      {/if}
    </div>
  </div>

  <div
    class="chart-wrapper"
    bind:clientWidth={
      containerWidth
    }
    onclick={() => {
      hoveredPoint = null;
      hoveredCohort = null;
    }}
  >
    <svg
      {width}
      {height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-labelledby="
        stat-4-title
        stat-4-description
      "
    >
      <title id="stat-4-title">
        Employee job priorities
      </title>

      <desc id="stat-4-description">
        Topic groups show reasons to join, stay and
        leave. The first selected cohort is green and
        a second comparison cohort is blue.
      </desc>

      <defs>
        {#each
          comparisonRows
          as comparison
        }
          {@const gradient =
            getGradientDetails(
              comparison
            )}

          <linearGradient
            id={getGradientId(
              comparison.rowIndex
            )}
            gradientUnits="userSpaceOnUse"
            x1={gradient.x1}
            x2={gradient.x2}
            y1="0"
            y2="0"
          >
            <stop
              offset="0%"
              stop-color={
                gradient.startColour
              }
            />

            <stop
              offset="100%"
              stop-color={
                gradient.endColour
              }
            />
          </linearGradient>
        {/each}
      </defs>

      <!-- Axis -->
      <g
        class="axis"
        aria-hidden="true"
      >
        <text
          class="axis-title"
          x={margin.left}
          y="18"
        >
          Percentage agreeing
        </text>

        <line
          class="axis-baseline"
          x1={margin.left}
          x2={
            width -
            margin.right
          }
          y1="42"
          y2="42"
        />

        {#each
          axisTicks
          as tick
        }
          <line
            class="axis-tick-line"
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1="37"
            y2="47"
          />

          <text
            class="axis-tick-label"
            x={xScale(tick)}
            y="64"
            text-anchor="middle"
          >
            {tick}<tspan
              class="percent-sign"
              baseline-shift="super"
            >%</tspan>
          </text>

          <line
            class="axis-grid-line"
            x1={xScale(tick)}
            x2={xScale(tick)}
            y1="70"
            y2={plotBottom}
          />
        {/each}
      </g>

      <!-- Topic headings and rows -->
      <g class="rows">
        {#each
          orderedSourceData
          as row,
          rowIndex
        }
          {@const rowY =
            getRowY(rowIndex)}

          <g class="response-row">
            {#if
              isTopicStart(
                rowIndex
              )
            }
              <text
                class="topic-label"
                x={margin.left}
                y={rowY - 72}
              >
                {row.topic}
              </text>
            {/if}

            <foreignObject
              x={margin.left}
              y={rowY - 52}
              width={
                width -
                margin.left -
                margin.right
              }
              height="44"
            >
              <div
                xmlns="http://www.w3.org/1999/xhtml"
                class="response-label-html"
              >
                {row.reason}
              </div>
            </foreignObject>

            <line
              class="row-guide"
              x1={margin.left}
              x2={
                width -
                margin.right
              }
              y1={rowY}
              y2={rowY}
            />
          </g>
        {/each}
      </g>

      <!-- Two selected cohorts -->
      {#if
        !isHeadlineView &&
        comparisonRows.length > 0
      }
        <g class="comparison-lines">
          {#each
            comparisonRows
            as comparison
          }
            <line
              class="comparison-line-outline"
              x1={xScale(
                comparison
                  .firstPoint
                  .value
              )}
              x2={xScale(
                comparison
                  .secondPoint
                  .value
              )}
              y1={getRowY(
                comparison.rowIndex
              )}
              y2={getRowY(
                comparison.rowIndex
              )}
            />

            <line
              class="comparison-line"
              x1={xScale(
                comparison
                  .firstPoint
                  .value
              )}
              x2={xScale(
                comparison
                  .secondPoint
                  .value
              )}
              y1={getRowY(
                comparison.rowIndex
              )}
              y2={getRowY(
                comparison.rowIndex
              )}
              stroke={`url(#${getGradientId(
                comparison.rowIndex
              )})`}
              in:draw={{
                duration: 300
              }}
              out:fade={{
                duration: 100
              }}
            />
          {/each}
        </g>
      {/if}

      <!-- Headline view -->
      {#if isHeadlineView}
        <g class="headline-points">
          {#each
            headlinePoints
            as point
          }

          <rect
            class="bar"
            x={margin.left}
            y={getRowY(
              point.rowIndex
            )-2}
            width={xScale(point.value) - margin.left}
            height={5}
            fill="#00634f"
          />
            <circle
              class="headline-dot"
              cx={xScale(
                point.value
              )}
              cy={getRowY(
                point.rowIndex
              )}
              r="11"
              fill={
                point.headlineIndex === 0
                  ? highlightColour
                  : '#ffffff'
              }
              stroke={
                point.headlineIndex === 0
                  ? highlightBorderColour
                  : comparisonColour
              }
              stroke-width="2.5"
            />

            <text
              class="headline-value-label"
              x={getHeadlineLabelX(
                point
              )}
              y={getRowY(
                point.rowIndex
              ) + 4}
              text-anchor={getHeadlineLabelAnchor(
                point
              )}
              dominant-baseline="middle"
              fill={
                point.headlineIndex === 0
                  ? highlightBorderColour
                  : comparisonColour
              }
            >
              {point.value}<tspan
                class="percent-sign"
                baseline-shift="super"
              >%</tspan>
            </text>
          {/each}
        </g>
      {/if}

      <!-- Selected and hovered dots -->
      {#if !isHeadlineView}
        {#key selectedSegment}
          <g class="cohort-dots">
            {#each
              orderedCohortPoints
              as point
            }
              {@const hidden =
                isDotHidden(
                  point.cohort
                )}

              <circle
                class="dot"
                class:active-dot={
                  isHighlighted(
                    point.cohort
                  )
                }
                class:hidden-dot={
                  hidden
                }
                cx={xScale(
                  point.value
                )}
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
                tabindex={
                  hidden
                    ? -1
                    : 0
                }
                aria-hidden={hidden}
                aria-pressed={
                  isSelected(
                    point.cohort
                  )
                }
                aria-label={`${point.cohort}, ${point.value}% — ${point.reason}`}
                onmouseenter={(event) =>
                  showTooltip(
                    event,
                    point
                  )}
                onmousemove={
                  updateTooltipPosition
                }
                onmouseleave={
                  hideTooltip
                }
                onfocus={(event) => {
                  const bounds =
                    event.currentTarget
                      .getBoundingClientRect();

                  showTooltip(
                    {
                      clientX:
                        bounds.left +
                        bounds.width / 2,

                      clientY:
                        bounds.top +
                        bounds.height / 2
                    },
                    point
                  );
                }}
                onblur={hideTooltip}
                onclick={(event) =>
                  handleDotClick(
                    event,
                    point
                  )}
                onkeydown={(event) =>
                  handleDotKeydown(
                    event,
                    point
                  )}
              />
            {/each}
          </g>
        {/key}
      {/if}

      <!-- Values outside the dots -->
      {#if
        !isHeadlineView &&
        selectedSeries.length > 0
      }
        <g
          class="selected-values"
          in:fade={{
            duration: 160
          }}
          out:fade={{
            duration: 80
          }}
        >
          {#each
            selectedSeries
            as series
          }
            {#each
              series.points
              as point
            }
              <text
                class="value-label"
                x={getLabelX(
                  point,
                  series.cohort
                )}
                y={getLabelY(
                  point,
                  series.cohort
                )}
                text-anchor={getLabelAnchor(
                  point,
                  series.cohort
                )}
                dominant-baseline="middle"
                fill={getCohortTextColour(
                  series.cohort
                )}
              >
                {point.value}<tspan
                  class="percent-sign"
                  baseline-shift="super"
                >%</tspan>
              </text>
            {/each}
          {/each}
        </g>
      {/if}
    </svg>
  </div>

  {#if !isHeadlineView}
    <DotPlotTooltipStat4
      point={hoveredPoint}
      x={tooltipX}
      y={tooltipY}
      colour={
        hoveredPoint
          ? getCohortColour(
              hoveredPoint.cohort
            )
          : highlightColour
      }
    />
  {/if}
</section>

<style>
  .dot-plot-stat-4 {
    --kf-green: #009b77;
    --kf-green-dark: #00634f;
    --kf-eyebrow: #053328;
    --kf-blue: #007da4;
    --kf-black: #000000;

    width: 100%;
    max-width: 940px;
    margin-inline: auto;

    color: var(--kf-black);

    font-family:
      'Gotham',
      Arial,
      sans-serif;
  }

  .chart-heading {
    margin-bottom: 1rem;
  }

  .chart-heading h2 {
    margin: 0;

    color: var(--kf-green);

    font-size: 32px;
    font-weight: 500;
    line-height: 1.15;

    text-transform: uppercase;
  }

  .chart-explanation {
    max-width: 940px;

    margin:
      0.75rem
      0
      0;

    color: #000000;

    font-size: 18px;
    font-weight: 400;
    line-height: 1.55;
  }

  .sticky-controls {
    position: sticky;
    top: 12px;
    z-index: 20;

    margin-bottom: 1.25rem;
    padding: 1rem;

    border:
      1px solid
      #dfe3e1;

    border-radius: 0.9rem;

    background:
      rgb(255 255 255 / 96%);

    box-shadow:
      0 7px 24px
      rgb(0 0 0 / 8%);

    backdrop-filter: blur(8px);
  }

  .controls {
    display: grid;
    gap: 1rem;
    width: 100%;
  }

  .control-label,
  .axis-title {
    margin:
      0
      0
      0.55rem;

    color: var(--kf-eyebrow);

    font-size: 14px;
    font-weight: 700;
    line-height: 1.2;

    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .segment-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    width: 100%;
  }

  .segment-selector button {
    min-height: 48px;

    border:
      1.5px solid
      var(--kf-green-dark);

    border-radius: 2px;

    padding:
      0.7rem
      1.4rem;

    background: #ffffff;
    color:
      var(--kf-green-dark);

    font: inherit;
    font-size: 16px;
    font-weight: 500;

    cursor: pointer;
  }

  .segment-selector button:hover,
  .segment-selector button:focus-visible {
    background: #f2f8f6;
    outline: none;
  }

  .segment-selector button.active {
    background: var(--kf-green-dark);
    color: #ffffff;
  }

  .chart-wrapper {
    width: 100%;
    overflow-x: auto;
  }

  svg {
    display: block;
    width: 100%;
    height: auto;
    background: white;
  }

  .axis-title {
    fill: var(--kf-eyebrow);
  }

  .axis-baseline,
  .axis-tick-line {
    stroke: #89918e;
    stroke-width: 1;
  }

  .axis-tick-label {
    fill: #000000;

    font-size: 14px;
    font-weight: 400;
  }

  .axis-grid-line {
    stroke: #d8dddb;
    stroke-width: 1;
    stroke-dasharray: 3 5;
  }

  .topic-label {
    fill: var(--kf-green);

    font-size: 24px;
    font-weight: 500;
  }

  .response-label-html {
    display: flex;
    align-items: flex-end;

    width: 100%;
    height: 100%;

    color: #000000;

    font-size: 18px;
    font-weight: 400;
    line-height: 1.3;
  }

  .row-guide {
    stroke: #dfe3e1;
    stroke-width: 1;
  }

  .comparison-line-outline {
    stroke: white;
    stroke-width: 19;
    stroke-linecap: round;
  }

  .comparison-line {
    stroke-width: 14;
    stroke-linecap: round;
    pointer-events: none;
  }

  .dot,
  .headline-dot {
    stroke-width: 2;

    transition:
      r 180ms ease,
      fill 180ms ease,
      opacity 240ms ease,
      stroke 180ms ease;
  }

  .dot {
    cursor: pointer;
  }

  .dot:hover,
  .dot:focus-visible,
  .dot.active-dot {
    stroke-width: 2.5;
    outline: none;

    filter:
      drop-shadow(
        0 2px 3px
        rgb(0 0 0 / 12%)
      );
  }

  .hidden-dot {
    pointer-events: none;
  }

  .value-label,
  .headline-value-label {
    font-size: 20px;
    font-weight: 400;

    pointer-events: none;

    paint-order: stroke;
    stroke: #ffffff;
    stroke-width: 4px;
    stroke-linejoin: round;
  }

  .percent-sign {
    font-size: 11px;
    font-weight: 400;
  }

  @media (min-width: 681px) {
    svg {
      min-width: 760px;
    }
  }

  @media (max-width: 680px) {
    .chart-heading h2 {
      font-size: 28px;
    }

    .chart-explanation {
      font-size: 16px;
    }

    .control-label,
    .axis-title {
      font-size: 13px;
    }

    .topic-label {
      font-size: 21px;
    }

    .response-label-html {
      font-size: 16px;
    }

    .value-label,
    .headline-value-label {
      font-size: 18px;
    }

    .percent-sign {
      font-size: 10px;
    }

    .sticky-controls {
      position: static;
      padding: 0.8rem;
      backdrop-filter: none;
    }

    .segment-selector {
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 0.25rem;
    }

    .segment-selector button {
      flex: 0 0 auto;
      white-space: nowrap;
    }

    .chart-wrapper {
      overflow-x: visible;
    }

    svg {
      min-width: 0;
    }
  }
</style>