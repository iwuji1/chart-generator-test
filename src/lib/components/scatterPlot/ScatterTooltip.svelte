<script>
  import { fade } from 'svelte/transition';

  let {
    point = null,
    x = 0,
    y = 0,
    xMeasure,
    yMeasure,
    colour = '#00796b'
  } = $props();

  const tooltipWidth = 330;
  const tooltipHeight = 240;
  const offset = 16;

  const left = $derived.by(() => {
    if (typeof window === 'undefined') {
      return x + offset;
    }

    if (
      x + offset + tooltipWidth >
      window.innerWidth - 12
    ) {
      return x - tooltipWidth - offset;
    }

    return x + offset;
  });

  const top = $derived.by(() => {
    if (typeof window === 'undefined') {
      return y + offset;
    }

    if (
      y + offset + tooltipHeight >
      window.innerHeight - 12
    ) {
      return Math.max(
        12,
        y - tooltipHeight - offset
      );
    }

    return y + offset;
  });

  function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
  }
</script>

{#if point}
  <aside
    class="tooltip"
    style:left={`${left}px`}
    style:top={`${top}px`}
    style={`--tooltip-colour: ${colour}`}
    role="tooltip"
    in:fade={{ duration: 110 }}
    out:fade={{ duration: 70 }}
  >
    <div class="tooltip-heading">
      <span class="group-dot"></span>

      <div>
        <p class="group">{point.group}</p>
        <h3>{point.segment}</h3>
      </div>
    </div>

    <dl>
      <div>
        <dt>{xMeasure}</dt>
        <dd>{formatPercent(point.x)}</dd>
      </div>

      <div>
        <dt>{yMeasure}</dt>
        <dd>{formatPercent(point.y)}</dd>
      </div>
    </dl>
  </aside>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 1000;
    box-sizing: border-box;
    width: 330px;
    padding: 1rem;
    border: 1px solid rgb(255 255 255 / 18%);
    border-radius: 0.85rem;
    background: rgb(12 54 47 / 97%);
    color: white;
    box-shadow:
      0 18px 45px rgb(0 0 0 / 28%),
      0 2px 8px rgb(0 0 0 / 18%);
    pointer-events: none;
  }

  .tooltip-heading {
    display: flex;
    gap: 0.6rem;
    align-items: flex-start;
  }

  .group-dot {
    width: 0.7rem;
    height: 0.7rem;
    flex: 0 0 auto;
    margin-top: 0.25rem;
    border-radius: 50%;
    background: var(--tooltip-colour);
  }

  h3,
  p,
  dl,
  dt,
  dd {
    margin: 0;
  }

  .group {
    margin-bottom: 0.2rem;
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.045em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  h3 {
    font-size: 1rem;
  }

  dl {
    display: grid;
    gap: 0.85rem;
    margin-top: 1rem;
  }

  dl > div {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.8rem;
    align-items: start;
    padding-top: 0.75rem;
    border-top: 1px solid rgb(255 255 255 / 15%);
  }

  dt {
    font-size: 0.78rem;
    line-height: 1.35;
    opacity: 0.76;
  }

  dd {
    color: var(--tooltip-colour);
    font-size: 1rem;
    font-weight: 800;
  }
</style>