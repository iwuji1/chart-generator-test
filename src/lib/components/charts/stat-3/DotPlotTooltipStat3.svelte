<script>
  import {
    formatSubsegmentLabel
  } from './stat3Data.js';

  let {
    point = null,
    x = 0,
    y = 0,
    colour = '#009b77'
  } = $props();

  const tooltipWidth = 210;
  const tooltipHeight = 48;
  const offset = 16;
  const viewportPadding = 12;

  function portal(node) {
    document.body.appendChild(node);

    return {
      destroy() {
        node.remove();
      }
    };
  }

  const tooltipX = $derived.by(() => {
    if (
      typeof window ===
      'undefined'
    ) {
      return x + offset;
    }

    const preferred =
      x + offset;

    if (
      preferred +
        tooltipWidth +
        viewportPadding <=
      window.innerWidth
    ) {
      return preferred;
    }

    return Math.max(
      viewportPadding,
      x -
        tooltipWidth -
        offset
    );
  });

  const tooltipY = $derived.by(() => {
    if (
      typeof window ===
      'undefined'
    ) {
      return y + offset;
    }

    const preferred =
      y + offset;

    if (
      preferred +
        tooltipHeight +
        viewportPadding <=
      window.innerHeight
    ) {
      return preferred;
    }

    return Math.max(
      viewportPadding,
      y -
        tooltipHeight -
        offset
    );
  });
</script>

{#if point}
  <aside
    use:portal
    class="tooltip"
    style:left={`${tooltipX}px`}
    style:top={`${tooltipY}px`}
    style:border-color={colour}
    role="tooltip"
  >
    {formatSubsegmentLabel(
      point.cohort
    )}
  </aside>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 9999;

    box-sizing: border-box;
    max-width:
      calc(100vw - 24px);

    border:
      1.5px solid
      #009b77;
    border-radius: 999px;

    padding:
      0.5rem
      0.8rem;

    background: #ffffff;
    color: #053328;

    font-family:
      'Gotham',
      Arial,
      sans-serif;

    font-size: 14px;
    font-weight: 400;
    line-height: 1.2;

    white-space: nowrap;

    box-shadow:
      0 5px 16px
      rgb(0 0 0 / 10%);

    pointer-events: none;
  }

  @media (max-width: 680px) {
    .tooltip {
      font-size: 13px;
    }
  }
</style>