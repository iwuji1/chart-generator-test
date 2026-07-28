<script>
  import * as d3
    from 'd3';

  import {
    draw,
    fade
  } from 'svelte/transition';

  import DotPlotAxisStat4
    from './DotPlotAxisStat4.svelte';

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

  import circleIcon from '$lib/assets/icons/circle.svg'

  let {
    sourceData = SourceData,
    initialSegment =
      'Job Level'
  } = $props();


  /* -----------------------
     View state
     ----------------------- */

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

  let hoveredCohort =
    $state(null);

  let hoveredPoint =
    $state(null);

  let tooltipX =
    $state(0);

  let tooltipY =
    $state(0);

  let containerWidth =
    $state(900);


  /* -----------------------
     Ordering
     ----------------------- */

  const orderedSourceData =
    $derived.by(() => {
      return [
        ...sourceData
      ].sort((a, b) => {
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


  /* -----------------------
     Current segment
     ----------------------- */

  const cohorts =
    $derived(
      segmentOptions[
        selectedSegment
      ] ?? []
    );

  const highlightedGroup =
    $derived(
      selectedCohorts[0] ??
        ''
    );

  const comparisonGroup =
    $derived(
      selectedCohorts[1] ??
        ''
    );


  /* -----------------------
     Plot data
     ----------------------- */

  const currentDots =
    $derived(
      createLongData(
        orderedSourceData,
        selectedSegment
      )
    );

  const cohortPoints =
    $derived(
      currentDots.filter(
        (point) =>
          point.cohort !==
          'Average'
      )
    );

  const averagePoints =
    $derived(
      currentDots.filter(
        (point) =>
          point.cohort ===
          'Average'
      )
    );


  /*
   * Draw unselected first,
   * comparison second,
   * highlighted last.
   */
  const orderedCohortPoints =
    $derived.by(() => {
      return [
        ...cohortPoints
      ].sort((a, b) => {
        const aIndex =
          selectedCohorts.indexOf(
            a.cohort
          );

        const bIndex =
          selectedCohorts.indexOf(
            b.cohort
          );

        const aPriority =
          aIndex === -1
            ? 0
            : aIndex === 1
              ? 1
              : 2;

        const bPriority =
          bIndex === -1
            ? 0
            : bIndex === 1
              ? 1
              : 2;

        return (
          aPriority -
          bPriority
        );
      });
    });


  /* -----------------------
     Headline data
     ----------------------- */

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


  /* -----------------------
     Dimensions
     ----------------------- */

  const minimumSvgWidth =
    700;

  const width =
    $derived(
      Math.max(
        minimumSvgWidth,
        Math.min(
          900,
          containerWidth
        )
      )
    );

  const margin = {
    top: 92,
    right: 30,
    bottom: 48,
    left: 30
  };

  const rowHeight = 60;
  const topicGap = 30;


  /* -----------------------
     Topic groups
     ----------------------- */

  const topicGroups =
    $derived.by(() => {
      const groups = [];

      let currentGroup =
        null;

      orderedSourceData
        .forEach(
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
                topic:
                  row.topic,

                startIndex:
                  rowIndex,

                endIndex:
                  rowIndex
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
      topicGap
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
      orderedSourceData
        .length > 0
        ? getRowY(
            orderedSourceData
              .length - 1
          ) + 30
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


  /* -----------------------
     Colours
     ----------------------- */

  const comparisonColours = [
    '#05c690',
    '#007da4'
  ];


  function getHeadlineColour(
    headlineIndex
  ) {
    return (
      comparisonColours[
        headlineIndex %
          comparisonColours.length
      ]
    );
  }


  function getCohortColour(
    cohort
  ) {
    const selectedIndex =
      selectedCohorts.indexOf(
        cohort
      );

    if (
      selectedIndex >= 0
    ) {
      return (
        comparisonColours[
          selectedIndex %
            comparisonColours.length
        ]
      );
    }

    if (
      hoveredCohort ===
      cohort
    ) {
      return (
        comparisonColours[0]
      );
    }

    return '#8f9995';
  }

  function getComparisonGradient(
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
        x1: xScale(firstValue),
        x2: xScale(secondValue),

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
        x1: xScale(secondValue),
        x2: xScale(firstValue),

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


  /* -----------------------
     Stable grey ranges
     ----------------------- */

  const fixedRanges =
    $derived.by(() => {
      return orderedSourceData
        .map(
          (
            row,
            rowIndex
          ) => {
            const values = [
              row.average,

              ...Object.values(
                row.segments ?? {}
              ).flatMap(
                (
                  segmentValues
                ) =>
                  Object.values(
                    segmentValues ??
                      {}
                  )
              )
            ].filter(
              Number.isFinite
            );

            return {
              rowIndex,

              minimum:
                values.length
                  ? d3.min(
                      values
                    )
                  : null,

              maximum:
                values.length
                  ? d3.max(
                      values
                    )
                  : null
            };
          }
        );
    });


  /* -----------------------
     Hover connection
     ----------------------- */

  const hoverSeries =
    $derived.by(() => {
      if (
        isHeadlineView ||
        !hoveredCohort ||
        selectedCohorts
          .length > 0
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


  const lineGenerator =
    $derived(
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
            xScale(
              point.value
            )
        )
        .y(
          (point) =>
            getRowY(
              point.rowIndex
            )
        )
        .curve(
          d3
            .curveCatmullRom
            .alpha(0.5)
        )
    );


  const hoverLinePath =
    $derived(
      hoverSeries.length > 1
        ? lineGenerator(
            hoverSeries
          )
        : null
    );


  /* -----------------------
     Selected cohorts
     ----------------------- */

  const selectedSeries =
    $derived(
      selectedCohorts.map(
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
      )
    );


  const comparisonRows =
    $derived.by(() => {
      if (
        selectedSeries
          .length !== 2
      ) {
        return [];
      }

      const [
        firstSeries,
        secondSeries
      ] =
        selectedSeries;

      return orderedSourceData
        .map(
          (
            row,
            rowIndex
          ) => {
            const firstPoint =
              firstSeries.points
                .find(
                  (point) =>
                    point.rowIndex ===
                    rowIndex
                );

            const secondPoint =
              secondSeries.points
                .find(
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


  /* -----------------------
     Selection
     ----------------------- */

  function selectHeadlineView() {
    selectedView =
      'headline';

    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }


  function selectSegment(
    segment
  ) {
    selectedView =
      'explore';

    selectedSegment =
      segment;

    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }


  function selectCohort(
    cohort
  ) {
    const selectedIndex =
      selectedCohorts.indexOf(
        cohort
      );

    /*
     * Remove comparison.
     */
    if (
      selectedIndex === 1
    ) {
      selectedCohorts = [
        selectedCohorts[0]
      ];

      return;
    }

    /*
     * Do not remove highlight
     * while comparison exists.
     */
    if (
      selectedIndex === 0 &&
      selectedCohorts
        .length === 2
    ) {
      return;
    }

    /*
     * Clear sole highlight.
     */
    if (
      selectedIndex === 0 &&
      selectedCohorts
        .length === 1
    ) {
      selectedCohorts = [];

      return;
    }

    if (
      selectedCohorts
        .length === 0
    ) {
      selectedCohorts = [
        cohort
      ];

      return;
    }

    if (
      selectedCohorts
        .length === 1
    ) {
      selectedCohorts = [
        selectedCohorts[0],
        cohort
      ];

      return;
    }

    selectedCohorts = [
      selectedCohorts[0],
      cohort
    ];
  }


  function selectHighlightedGroup(
    event
  ) {
    const cohort =
      event.currentTarget.value;

    hoveredCohort = null;
    hoveredPoint = null;

    if (!cohort) {
      selectedCohorts = [];
      return;
    }

    const existingComparison =
      selectedCohorts[1];

    selectedCohorts =
      existingComparison &&
      existingComparison !==
        cohort
        ? [
            cohort,
            existingComparison
          ]
        : [cohort];
  }


  function selectComparisonGroup(
    event
  ) {
    const cohort =
      event.currentTarget.value;

    hoveredCohort = null;
    hoveredPoint = null;

    if (!highlightedGroup) {
      return;
    }

    if (!cohort) {
      selectedCohorts = [
        highlightedGroup
      ];

      return;
    }

    selectedCohorts = [
      highlightedGroup,
      cohort
    ];
  }


  function clearComparisonGroup() {
    if (
      !highlightedGroup
    ) {
      return;
    }

    selectedCohorts = [
      highlightedGroup
    ];

    hoveredCohort = null;
    hoveredPoint = null;
  }


  function clearHighlightedGroup() {
    if (
      comparisonGroup
    ) {
      return;
    }

    selectedCohorts = [];

    hoveredCohort = null;
    hoveredPoint = null;
  }


  function clearSelection() {
    selectedCohorts = [];
    hoveredCohort = null;
    hoveredPoint = null;
  }


  /* -----------------------
     Tooltip
     ----------------------- */

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


  /* -----------------------
     Dot styling
     ----------------------- */

  function isSelected(
    cohort
  ) {
    return (
      selectedCohorts.includes(
        cohort
      )
    );
  }


  function isHighlighted(
    cohort
  ) {
    return (
      isSelected(cohort) ||
      (
        selectedCohorts
          .length === 0 &&
        hoveredCohort ===
          cohort
      )
    );
  }


  function getDotFill(
    cohort
  ) {
    return isHighlighted(
      cohort
    )
      ? getCohortColour(
          cohort
        )
      : '#e3e6e5';
  }


    function getDotStroke(
        cohort
        ) {
        if (
            isSelected(cohort)
        ) {
            return '#111111';
        }

        if (
            selectedCohorts.length === 0 &&
            hoveredCohort === cohort
        ) {
            return getCohortColour(
            cohort
            );
        }

        return '#111111';
    }


  function getDotOpacity(
    cohort
  ) {
    if (
      selectedCohorts
        .length === 0
    ) {
      return 0.5;
    }

    if (
      selectedCohorts
        .length === 1
    ) {
      return isSelected(
        cohort
      )
        ? 1
        : 0.4;
    }

    return isSelected(
      cohort
    )
      ? 1
      : 0;
  }


  function isDotHidden(
    cohort
  ) {
    return (
      selectedCohorts
        .length === 2 &&
      !isSelected(cohort)
    );
  }


  function getDotRadius(
    cohort
  ) {
    return isHighlighted(
      cohort
    )
      ? 9
      : 6;
  }


  function getGradientId(
    rowIndex
  ) {
    return (
      `stat4-comparison-gradient-${rowIndex}`
    );
  }


  function getLabelY(
    point,
    cohort
  ) {
    const index =
      selectedCohorts.indexOf(
        cohort
      );

    return index === 0
      ? getRowY(
          point.rowIndex
        ) - 13
      : getRowY(
          point.rowIndex
        ) + 23;
  }


  function handleDotKeydown(
    event,
    point
  ) {
    if (
      event.key ===
        'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();

      selectCohort(
        point.cohort
      );
    }

    if (
      event.key ===
      'Escape'
    ) {
      clearSelection();
    }
  }
</script>


<section class="dot-plot-kf">

  <div class="chart-heading">
    <h2>
      STAT 4: EMPLOYEE JOB PRIORITIES
    </h2>

    <p class="chart-explanation">
      This chart shows the levels of agreement with selected statements. Each
      <span class="inline-key cohort-key">
        <img
          src={circleIcon}
          alt=""
          aria-hidden="true"
        />
      </span>
      represents a distinct cohort, the
      <span class="inline-key average-key">
        <span
          class="average-marker-icon"
          aria-hidden="true"
        ></span>
      </span>
      marker is the average response percentage and the grey bar shows the
      <span class="inline-key range-key">
        full range
      </span>
      of lowest to highest responses across every cohort. The initial view shows headline insights, you can then 
      filter to explore different segment groups. You can highlight 
      <span class="inline-key highlight-key" style:background={comparisonColours[0]}>
        cohorts
      </span>
      to see all their related values, and also compare
      <span class="inline-key compare-key" style:background={comparisonColours[1]}>
        responses
      </span>
      with another cohort.
    </p>
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
            Headline
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

        <div class="cohort-control">

          <DotPlotLegendStat4
            {cohorts}
            {highlightedGroup}
            {comparisonGroup}
            onHighlight={
              selectHighlightedGroup
            }
            onCompare={
              selectComparisonGroup
            }
            onClearHighlight={
              clearHighlightedGroup
            }
            onClearComparison={
              clearComparisonGroup
            }
          />

        </div>

      {/if}

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
      aria-labelledby="
        stat4-title
        stat4-description
      "
    >

      <title id="stat4-title">
        Employee reasons to
        join, stay and leave
      </title>

      <desc id="stat4-description">
        Three groups show reasons
        to join, stay and leave.
        Grey bars show the full
        response range. Black
        markers show the average.
      </desc>


    <defs>
    {#each
        comparisonRows
        as comparison
    }
        {@const gradient =
        getComparisonGradient(
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


      <DotPlotAxisStat4
        {xScale}
        top={
          margin.top - 55
        }
        bottom={plotBottom}
      />


      <!-- rows -->
      <g class="rows">

        {#each
          orderedSourceData
          as row,
          rowIndex
        }

          {@const rowY =
            getRowY(
              rowIndex
            )}

          {@const range =
            fixedRanges[
              rowIndex
            ]}


          <g class="response-row">

            {#if
              isTopicStart(
                rowIndex
              )
            }

              <text
                class="topic-label"
                x={margin.left}
                y={rowY - 44}
              >
                {row.topic}
              </text>

            {/if}


            <text
              class="response-label"
              x={margin.left}
              y={rowY - 15}
            >
              {row.reason}
            </text>


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


            {#if
              Number.isFinite(
                range?.minimum
              ) &&
              Number.isFinite(
                range?.maximum
              )
            }

              <line
                class="range-line"

                x1={xScale(
                  range.minimum
                )}

                x2={xScale(
                  range.maximum
                )}

                y1={rowY}
                y2={rowY}
              />

            {/if}

          </g>

        {/each}

      </g>


      <!-- comparison -->
      {#if
        !isHeadlineView &&
        comparisonRows.length >
          0
      }

        <g class="comparison-lines">

          {#each
            comparisonRows
            as comparison
          }


            <line
              class="
                comparison-line
              "

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

              stroke={`
                url(
                  #${getGradientId(
                    comparison
                      .rowIndex
                  )}
                )
              `}

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


      <!-- hover line -->
      {#if
        !isHeadlineView &&
        hoverLinePath &&
        hoveredCohort &&
        selectedCohorts.length ===
          0
      }

        <g
          class="
            hover-line-group
          "

          in:fade={{
            duration: 100
          }}

          out:fade={{
            duration: 80
          }}
        >

          <path
            class="
              hover-line-outline
            "
            d={hoverLinePath}
          />

          <path
            class="
              hover-line
            "
            d={hoverLinePath}

            stroke={
              getCohortColour(
                hoveredCohort
              )
            }

            in:draw={{
              duration: 300
            }}
          />

        </g>

      {/if}


      <!-- averages -->
      <g
        class="average-markers"
        aria-hidden="true"
      >

        {#each
          averagePoints
          as point
        }

          <text
            class="average-value"

            x={xScale(
              point.value
            )}

            y={
              getRowY(
                point.rowIndex
              ) - 16
            }

            text-anchor="middle"
          >
            {point.value}<tspan
              font-size="7"
              baseline-shift="super"
            >%</tspan>
          </text>


          <line
            class="
              average-marker-outline
            "

            x1={xScale(
              point.value
            )}

            x2={xScale(
              point.value
            )}

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
            class="
              average-marker
            "

            x1={xScale(
              point.value
            )}

            x2={xScale(
              point.value
            )}

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


      <!-- headline -->
      {#if isHeadlineView}

        <g class="headline-points">

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

              fill={
                getHeadlineColour(
                  point
                    .headlineIndex
                )
              }

              stroke="#111111"

              stroke-width="2"
            />

            <text
              class="
                headline-value-label
              "

              x={xScale(
                point.value
              )}

              y={
                point
                  .headlineIndex ===
                0
                  ? getRowY(
                      point
                        .rowIndex
                    ) - 14
                  : getRowY(
                      point
                        .rowIndex
                    ) + 24
              }

              text-anchor="middle"

              fill={
                getHeadlineColour(
                  point
                    .headlineIndex
                )
              }
            >
              {point.value}<tspan
                font-size="7"
                baseline-shift="super"
              >%</tspan>
            </text>

          {/each}

        </g>


        <g class="
          headline-annotations
        ">

          {#each
            headlinePoints
            as point
          }

            {#if
              point.headlineIndex ===
                0 &&
              point.text
            }

              {@const dotX =
                xScale(
                  point.value
                )}

              {@const dotY =
                getRowY(
                  point.rowIndex
                )}

              {@const secondary =
                headlinePoints.find(
                  (candidate) =>
                    candidate
                      .rowIndex ===
                      point
                        .rowIndex &&
                    candidate
                      .headlineIndex ===
                      1
                )}

              {@const boxWidth =
                215}

              {@const boxHeight =
                42}

              {@const gap = 14}

              {@const leftSide =
                secondary
                  ? secondary.value >=
                    point.value
                  : dotX >
                    width / 2}

              {@const rawX =
                leftSide
                  ? dotX -
                    boxWidth -
                    gap
                  : dotX +
                    gap}

              {@const boxX =
                Math.max(
                  margin.left,

                  Math.min(
                    rawX,

                    width -
                      margin.right -
                      boxWidth
                  )
                )}

              {@const boxY =
                dotY -
                boxHeight / 2}


              <line
                class="
                  headline-annotation-connector
                "

                x1={
                  leftSide
                    ? dotX - 9
                    : dotX + 9
                }

                x2={
                  leftSide
                    ? boxX +
                      boxWidth
                    : boxX
                }

                y1={dotY}
                y2={dotY}

                stroke={
                  getHeadlineColour(
                    point
                      .headlineIndex
                  )
                }
              />


              <foreignObject
                x={boxX}
                y={boxY}

                width={boxWidth}
                height={boxHeight}
              >

                <div
                  xmlns="
                    http://www.w3.org/1999/xhtml
                  "

                  class="
                    headline-annotation
                  "

                  style:border-color={
                    getHeadlineColour(
                      point
                        .headlineIndex
                    )
                  }
                >
                  {point.text}
                </div>

              </foreignObject>

            {/if}

          {/each}

        </g>

      {/if}


      <!-- normal dots -->
      {#if !isHeadlineView}

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

              aria-hidden={
                hidden
              }

              aria-label={`
                ${point.cohort}:
                ${point.value}% —
                ${point.reason}
              `}

              aria-pressed={
                isSelected(
                  point.cohort
                )
              }

              onmouseenter={
                (event) =>
                  showTooltip(
                    event,
                    point
                  )
              }

              onmousemove={
                updateTooltipPosition
              }

              onmouseleave={
                hideTooltip
              }

              onfocus={(event) => {
                const bounds =
                  event
                    .currentTarget
                    .getBoundingClientRect();

                showTooltip(
                  {
                    clientX:
                      bounds.left +
                      bounds.width /
                        2,

                    clientY:
                      bounds.top +
                      bounds.height /
                        2
                  },

                  point
                );
              }}

              onblur={
                hideTooltip
              }

              onclick={(event) => {
                event
                  .stopPropagation();

                selectCohort(
                  point.cohort
                );
              }}

              onkeydown={
                (event) =>
                  handleDotKeydown(
                    event,
                    point
                  )
              }
            >

              <title>
                {point.cohort}:
                {point.value}%
              </title>

            </circle>

          {/each}

        </g>

      {/if}


      <!-- selected labels -->
      {#if
        !isHeadlineView &&
        selectedSeries.length >
          0
      }

        <g
          class="
            selected-values
          "

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

                x={xScale(
                  point.value
                )}

                y={getLabelY(
                  point,
                  series.cohort
                )}

                text-anchor="middle"

                fill={
                  getCohortColour(
                    series.cohort
                  )
                }
              >
                {point.value}<tspan
                  font-size="7"
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
              hoveredPoint
                .cohort
            )
          : '#05c690'
      }
    />

  {/if}

</section>


<style>
  .dot-plot-kf {
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

    line-height: 1.12;
  }

  .chart-heading p {
    max-width: 720px;

    margin:
      0.55rem
      0
      0;

    color: #626866;

    font-size: 0.85rem;
    line-height: 1.45;
  }

  .sticky-controls {
    position: sticky;
    top: 12px;
    z-index: 20;

    display: grid;
    gap: 0.9rem;

    margin-bottom: 1.25rem;
    padding: 1rem;

    border:
      1px solid
      #dfe3e1;

    border-radius: 0.9rem;

    background:
      rgb(
        255 255 255 /
        96%
      );

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

  .segment-selector {
    display: flex;
    flex-wrap: wrap;

    gap: 0.35rem;

    width: 100%;
  }

  .control-label {
    margin:
      0
      0
      0.55rem;

    color: #626866;

    font-size: 0.68rem;
    font-weight: 800;

    letter-spacing:
      0.06em;

    text-transform:
      uppercase;
  }

  .segment-selector button {
    border:
      1px solid
      #d5dad8;

    border-radius: 999px;

    padding:
      0.42rem
      0.68rem;

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

  .segment-selector
    button:hover,
  .segment-selector
    button:focus-visible {
    border-color: #8e9995;
    outline: none;
  }

  .segment-selector
    button.active {
    border-color: #123f37;

    background: #123f37;
    color: white;
  }

  /*
   * Headline retains its editorial
   * prominence even when inactive.
   */
  .segment-selector
  .headline-tab {
    border-color: #8e9995;
    background: #ffffff;
    color: #000000;
    font-weight: 800;
  }

  .segment-selector
  .headline-tab.active {
    border-color: #123f37;
    background: #123f37;
    color: white;
  }

  .chart-wrapper {
    width: 100%;
    min-width: 0;

    overflow-x: auto;

    overscroll-behavior-inline:
      contain;
  }

  svg {
    display: block;

    width: 100%;
    min-width: 700px;
    height: auto;

    overflow: visible;

    background: white;
  }

  .topic-label {
    fill: #007760;

    font-size: 15px;
    font-weight: 800;

    letter-spacing:
      0.055em;
  }

  .response-label {
    fill: #202422;

    font-size: 11px;
    font-weight: 700;

    pointer-events: none;

    paint-order: stroke;

    stroke: white;
    stroke-width: 4px;
    stroke-linejoin: round;
  }

  .row-guide {
    stroke: #dfe3e1;
    stroke-width: 1;
  }

  .range-line {
    stroke: #d7d9d8;

    stroke-width: 14;

    stroke-linecap:
      round;
  }

  .comparison-line {
    stroke-width: 14;

    stroke-linecap:
      round;

    pointer-events:
      none;
  }

  .hover-line,
  .hover-line-outline {
    fill: none;

    stroke-linecap:
      round;

    stroke-linejoin:
      round;

    pointer-events:
      none;
  }

  .hover-line-outline {
    stroke: white;
    stroke-width: 7;
  }

  .hover-line {
    stroke-width: 3;
  }

  .dot {
    box-sizing:
      border-box;

    cursor: pointer;

    stroke-width: 1.4;

    transition:
      r 180ms ease,
      fill 180ms ease,
      opacity 240ms ease,
      stroke 180ms ease,
      stroke-width 180ms ease;
  }

  .dot.active-dot {
    stroke-width: 2.2;
  }

  .dot:hover,
  .dot:focus-visible,
  .active-dot {
    stroke-width: 2;

    outline: none;

    filter:
      drop-shadow(
        0 2px 3px
        rgb(
          0 0 0 /
          20%
        )
      );
  }

  .hidden-dot {
    pointer-events:
      none;
  }

  .average-markers {
    pointer-events: none;
  }

  .average-marker-outline {
    stroke: white;

    stroke-width: 7;

    stroke-linecap:
      round;
  }

  .average-marker {
    stroke: #111111;

    stroke-width: 3;

    stroke-linecap:
      round;
  }

  .inline-key {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;

    border-radius: 999px;
    padding: 0.08rem 0.42rem;
  }

  .inline-key img {
    display: block;
    width: 11px;
    height: 11px;
    flex: 0 0 auto;
  }
    
  .cohort-key {
    background: #f0f2f1;
    color: #343a37;
  }

  .range-key {
    background: #d7d9d8;
    color: #343a37;
  }

  .average-value {
    font-size: 10px;
    font-weight: 500;
  }

  .highlight-key {
    background:
        color-mix(
        in srgb,
        var(--highlight-colour) 14%,
        white
        );

    color: #ffffff;
  }

  .compare-key {
    background:
        color-mix(
        in srgb,
        var(--compare-colour) 14%,
        white
        );

    color: #ffffff;
  }

  .value-label {
    font-size: 10px;
    font-weight: 800;

    pointer-events: none;

    paint-order: stroke;

    stroke: white;
    stroke-width: 3px;
    stroke-linejoin:
      round;
  }

  .headline-points,
  .headline-annotations {
    pointer-events: none;
  }

  .headline-dot {
    filter:
      drop-shadow(
        0 2px 3px
        rgb(
          0 0 0 /
          18%
        )
      );
  }

  .headline-value-label {
    font-size: 10px;
    font-weight: 800;

    paint-order: stroke;

    stroke: white;
    stroke-width: 3px;
    stroke-linejoin:
      round;
  }

  .headline-annotation-connector {
    stroke-width: 2;

    stroke-linecap:
      round;
  }

  .headline-annotation {
    display: flex;
    align-items: center;

    width: 100%;
    height: 100%;

    box-sizing:
      border-box;

    padding:
      0.35rem
      0.55rem;

    border:
      1px solid;

    border-radius: 8px;

    background:
      rgb(
        255 255 255 /
        96%
      );

    color: #252a28;

    font-size: 9px;
    font-weight: 600;
    line-height: 1.25;

    box-shadow:
      0 3px 8px
      rgb(
        0 0 0 /
        10%
      );
  }

  @media (
    max-width: 680px
  ) {
    .sticky-controls {
      position: static;

      backdrop-filter: none;

      -webkit-backdrop-filter:
        none;
    }
  }
</style>