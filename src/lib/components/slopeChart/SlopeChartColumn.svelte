<script>
  let {
    column,
    x,
    width,
    height,
    margin,
    yScale,
    leftMeasure,
    rightMeasure,
    colour,
    activeLineKey = null,
    selectedLineKey = null,

    onPreviewLine,
    onClearLinePreview,
    onSelectLine,

    onShowTooltip,
    onMoveTooltip,
    onHideTooltip,
    onLineKeydown
  } = $props();

  const innerPadding = 26;

  const leftX = $derived(
    x + innerPadding
  );

  const rightX = $derived(
    x + width - innerPadding
  );

  const plotBottom = height - margin.bottom;

  function getLineOpacity(line) {
    if (!activeLineKey) {
      return 0.88;
    }

    return line.lineKey === activeLineKey
      ? 1
      : 0.12;
  }

  function getLineWidth(line) {
    return line.lineKey === activeLineKey
      ? 4
      : 2.6;
  }

  function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
  }

  function truncateLabel(text, maximumLength = 58) {
  if (text.length <= maximumLength) {
    return text;
  }

  return `${text.slice(0, maximumLength).trim()}…`;
}
</script>

<g class="column">
  <line
    class="column-divider"
    x1={x}
    x2={x}
    y1={margin.top - 30}
    y2={plotBottom + 80}
  />

  <text
    class="group-heading"
    x={x + width / 2}
    y={margin.top - 28}
    text-anchor="middle"
    fill={colour}
  >
    {column.group}
  </text>

  <g class="slope-lines">
    {#each column.lines as line (line.lineKey)}
      <g
        class="slope-line-group"
        role="button"
        tabindex="0"
        aria-label={`${line.segment}: ${formatPercent(line.leftValue)} to ${formatPercent(line.rightValue)}`}
        aria-pressed={
          selectedLineKey === line.lineKey
        }
        onmouseenter={(event) => {
          onPreviewLine(line.lineKey);

          onShowTooltip(event, {
            ...line,
            leftMeasure,
            rightMeasure
          });
        }}
        onmousemove={onMoveTooltip}
        onmouseleave={() => {
          onClearLinePreview();
          onHideTooltip();
        }}
        onfocus={(event) => {
          onPreviewLine(line.lineKey);

          onShowTooltip(event, {
            ...line,
            leftMeasure,
            rightMeasure
          });
        }}
        onblur={() => {
          onClearLinePreview();
          onHideTooltip();
        }}
        onclick={(event) => {
          event.stopPropagation();
          onSelectLine(line.lineKey);
        }}
        onkeydown={(event) =>
          onLineKeydown(event, line.lineKey)}
      >
        <line
          class="line-hit-area"
          x1={leftX}
          y1={yScale(line.leftValue)}
          x2={rightX}
          y2={yScale(line.rightValue)}
        />

        <line
          class="slope-line"
          class:active={
            line.lineKey === activeLineKey
          }
          x1={leftX}
          y1={yScale(line.leftValue)}
          x2={rightX}
          y2={yScale(line.rightValue)}
          stroke={colour}
          stroke-width={getLineWidth(line)}
          opacity={getLineOpacity(line)}
        />

        <circle
          class="endpoint"
          cx={leftX}
          cy={yScale(line.leftValue)}
          r={
            line.lineKey === activeLineKey
              ? 4.5
              : 3
          }
          fill={colour}
          opacity={getLineOpacity(line)}
        />

        <circle
          class="endpoint"
          cx={rightX}
          cy={yScale(line.rightValue)}
          r={
            line.lineKey === activeLineKey
              ? 4.5
              : 3
          }
          fill={colour}
          opacity={getLineOpacity(line)}
        />

        {#if line.lineKey === activeLineKey}
          <text
            class="value-label"
            x={leftX - 7}
            y={yScale(line.leftValue)}
            dy="0.35em"
            text-anchor="end"
            fill={colour}
          >
            {formatPercent(line.leftValue)}
          </text>

          <text
            class="value-label"
            x={rightX + 7}
            y={yScale(line.rightValue)}
            dy="0.35em"
            text-anchor="start"
            fill={colour}
          >
            {formatPercent(line.rightValue)}
          </text>
        {/if}
      </g>
    {/each}
  </g>

<!-- Left measure label -->
  <g
    transform={`
      translate(${leftX}, ${plotBottom + 18})
      rotate(-90)
    `}
  >
    <text
      class="measure-label"
      text-anchor="end"
      dominant-baseline="middle"
    >
      <title>{leftMeasure}</title>
      {truncateLabel(leftMeasure)}
    </text>
  </g>

  <!-- Right measure label -->
  <g
    transform={`
      translate(${rightX}, ${plotBottom + 18})
      rotate(-90)
    `}
  >
    <text
      class="measure-label"
      text-anchor="end"
      dominant-baseline="middle"
    >
      <title>{rightMeasure}</title>
      {truncateLabel(rightMeasure)}
    </text>
  </g>
</g>

<style>
  .column-divider {
    stroke: #d7dcda;
    stroke-width: 1;
  }

  .group-heading {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: 700;
  }

  .slope-line-group {
    cursor: pointer;
    outline: none;
  }

  .line-hit-area {
    stroke: transparent;
    stroke-width: 15;
  }

  .slope-line,
  .endpoint {
    transition:
      y1 320ms ease,
      y2 320ms ease,
      cy 320ms ease,
      stroke-width 150ms ease,
      opacity 150ms ease,
      r 150ms ease;
    pointer-events: none;
  }

  .slope-line {
    stroke-linecap: round;
  }

  .slope-line.active {
    filter:
      drop-shadow(0 1px 2px rgb(0 0 0 / 18%));
  }

  .value-label {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    font-weight: 800;
    pointer-events: none;
  }

  .measure-label {
    fill: #323735;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
    font-weight: 600;
    pointer-events: none;
  }
</style>