<script>
  import { fade } from 'svelte/transition';
  import MiniYearBarChart from './MiniYearBarChart.svelte';

  let {
    point = null,
    history = [],
    x = 0,
    y = 0,
    activeYear,
    colour = '#76bf3d'
  } = $props();

  const tooltipWidth = 310;
  const tooltipHeight = 235;
  const offset = 16;

  /*
   * Keep the tooltip within the browser viewport.
   */
  const left = $derived.by(() => {
    if (typeof window === 'undefined') {
      return x + offset;
    }

    const preferred = x + offset;

    if (preferred + tooltipWidth > window.innerWidth - 12) {
      return x - tooltipWidth - offset;
    }

    return preferred;
  });

  const top = $derived.by(() => {
    if (typeof window === 'undefined') {
      return y + offset;
    }

    const preferred = y + offset;

    if (preferred + tooltipHeight > window.innerHeight - 12) {
      return Math.max(12, y - tooltipHeight - offset);
    }

    return preferred;
  });
</script>

{#if point}
  <aside
    class="tooltip"
    style:left={`${left}px`}
    style:top={`${top}px`}
    style={`--active-colour: ${colour}`}
    role="tooltip"
    in:fade={{ duration: 120 }}
    out:fade={{ duration: 80 }}
  >
    <div class="tooltip-header">
      <span class="cohort-dot"></span>

      <p class="cohort">
        {point.cohort}
      </p>
    </div>

    <h3>{point.topic}</h3>

    <p class="response">
      {point.response}
    </p>

    <MiniYearBarChart
      data={history}
      {activeYear}
      {colour}
    />
  </aside>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 1000;
    box-sizing: border-box;
    width: 310px;
    padding: 1rem;
    border: 1px solid rgb(255 255 255 / 17%);
    border-radius: 0.85rem;
    background: rgb(10 52 45 / 97%);
    color: white;
    box-shadow:
      0 18px 45px rgb(0 0 0 / 28%),
      0 2px 8px rgb(0 0 0 / 18%);
    pointer-events: none;
  }

  .tooltip-header {
    display: flex;
    gap: 0.45rem;
    align-items: center;
    margin-bottom: 0.55rem;
  }

  .cohort-dot {
    width: 0.65rem;
    height: 0.65rem;
    border-radius: 50%;
    background: var(--active-colour);
  }

  .cohort,
  .response,
  h3 {
    margin: 0;
  }

  .cohort {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.045em;
    text-transform: uppercase;
    opacity: 0.78;
  }

  h3 {
    font-size: 1rem;
    line-height: 1.25;
  }

  .response {
    margin-top: 0.3rem;
    font-size: 0.84rem;
    line-height: 1.35;
    opacity: 0.78;
  }
</style>