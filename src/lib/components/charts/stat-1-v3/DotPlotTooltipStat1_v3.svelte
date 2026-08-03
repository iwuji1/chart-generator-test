<script>
  import {
    formatSubsegmentLabel
  } from './stat1Data.js';

  let {
    point = null,
    x = 0,
    y = 0,
    colour = '#009b77'
  } = $props();

  const offset = 14;
  const viewportPadding = 12;

  function portal(node) {
    document.body.appendChild(
      node
    );

    return {
      destroy() {
        node.remove();
      }
    };
  }

  const tooltipX =
    $derived.by(() => {
      if (
        typeof window ===
        'undefined'
      ) {
        return x + offset;
      }

      return Math.min(
        x + offset,
        window.innerWidth -
          180 -
          viewportPadding
      );
    });

  const tooltipY =
    $derived.by(() => {
      if (
        typeof window ===
        'undefined'
      ) {
        return y + offset;
      }

      return Math.min(
        y + offset,
        window.innerHeight -
          50 -
          viewportPadding
      );
    });
</script>

{#if point}
  <aside
    use:portal
    class="tooltip"
    style:left={`${Math.max(
      viewportPadding,
      tooltipX
    )}px`}
    style:top={`${Math.max(
      viewportPadding,
      tooltipY
    )}px`}
    style:border-color={colour}
    role="tooltip"
  >
    <span
      class="tooltip-dot"
      style:background={
        point.cohort ===
        'AVERAGE'
          ? '#009b77'
          : colour
      }
    ></span>

    <span class="cohort">
      {formatSubsegmentLabel(
        point.cohort
      )}
    </span>
  </aside>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 9999;

    display: inline-flex;
    gap: 0.45rem;
    align-items: center;

    box-sizing: border-box;

    max-width:
      calc(
        100vw - 24px
      );

    margin: 0;

    border:
      1px solid
      #009b77;

    border-radius: 999px;

    padding:
      0.45rem
      0.7rem;

    background: white;
    color: #053328;

    font-family:
      'Gotham',
      Arial,
      sans-serif;

    box-shadow:
      0 5px 16px
      rgb(0 0 0 / 12%);

    pointer-events: none;
  }

  .tooltip-dot {
    width: 9px;
    height: 9px;
    flex: 0 0 auto;

    border-radius: 50%;
  }

  .cohort {
    overflow: hidden;

    font-size: 14px;
    font-weight: 700;
    line-height: 1.1;

    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>