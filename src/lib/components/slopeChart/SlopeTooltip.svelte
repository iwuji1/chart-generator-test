<script>
  import { fade } from 'svelte/transition';

  let {
    point = null,
    x = 0,
    y = 0,
    colour = '#4778a8'
  } = $props();

  const tooltipWidth = 340;
  const tooltipHeight = 220;
  const offset = 16;

  const left = $derived.by(() => {
    if (typeof window === 'undefined') {
      return x + offset;
    }

    return x + offset + tooltipWidth >
      window.innerWidth - 12
      ? x - tooltipWidth - offset
      : x + offset;
  });

  const top = $derived.by(() => {
    if (typeof window === 'undefined') {
      return y + offset;
    }

    return y + offset + tooltipHeight >
      window.innerHeight - 12
      ? Math.max(
          12,
          y - tooltipHeight - offset
        )
      : y + offset;
  });

  function formatPercent(value) {
    return `${Math.round(value * 100)}%`;
  }

  const difference = $derived(
    point
      ? point.rightValue - point.leftValue
      : 0
  );
</script>

{#if point}
  <aside
    class="tooltip"
    style:left={`${left}px`}
    style:top={`${top}px`}
    style={`--tooltip-colour: ${colour}`}
    role="tooltip"
    in:fade={{ duration: 100 }}
    out:fade={{ duration: 70 }}
  >
    <div class="tooltip-heading">
      <span class="group-dot"></span>

      <div>
        <p>{point.group}</p>
        <h3>{point.segment}</h3>
      </div>
    </div>

    <dl>
      <div>
        <dt>{point.leftMeasure}</dt>
        <dd>
          {formatPercent(point.leftValue)}
        </dd>
      </div>

      <div>
        <dt>{point.rightMeasure}</dt>
        <dd>
          {formatPercent(point.rightValue)}
        </dd>
      </div>
    </dl>

    <p class="difference">
      {difference > 0 ? '+' : ''}
      {Math.round(difference * 100)}
      percentage points
    </p>
  </aside>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 1000;
    box-sizing: border-box;
    width: 340px;
    padding: 1rem;
    border-radius: 0.8rem;
    background: rgb(15 51 46 / 97%);
    color: white;
    box-shadow: 0 16px 40px rgb(0 0 0 / 25%);
    pointer-events: none;
  }

  .tooltip-heading {
    display: flex;
    gap: 0.55rem;
    align-items: flex-start;
  }

  .group-dot {
    width: 0.7rem;
    height: 0.7rem;
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

  .tooltip-heading p {
    font-size: 0.7rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    opacity: 0.7;
  }

  h3 {
    margin-top: 0.15rem;
    font-size: 1rem;
  }

  dl {
    display: grid;
    gap: 0.65rem;
    margin-top: 0.85rem;
  }

  dl > div {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.75rem;
    padding-top: 0.6rem;
    border-top: 1px solid rgb(255 255 255 / 15%);
  }

  dt {
    font-size: 0.75rem;
    line-height: 1.35;
    opacity: 0.76;
  }

  dd {
    color: var(--tooltip-colour);
    font-weight: 800;
  }

  .difference {
    margin-top: 0.8rem;
    color: var(--tooltip-colour);
    font-size: 0.8rem;
    font-weight: 800;
  }
</style>