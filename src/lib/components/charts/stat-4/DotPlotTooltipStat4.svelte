<script>
  import {
    fade
  } from 'svelte/transition';

  let {
    point = null,
    x = 0,
    y = 0,
    colour = '#05c690'
  } = $props();

  const tooltipWidth = 310;
  const tooltipHeight = 155;
  const offset = 16;

  const left =
    $derived.by(() => {
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
          tooltipWidth >
        window.innerWidth - 12
      ) {
        return (
          x -
          tooltipWidth -
          offset
        );
      }

      return preferred;
    });

  const top =
    $derived.by(() => {
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
          tooltipHeight >
        window.innerHeight - 12
      ) {
        return Math.max(
          12,
          y -
            tooltipHeight -
            offset
        );
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
    in:fade={{
      duration: 120
    }}
    out:fade={{
      duration: 80
    }}
  >
    <div class="tooltip-header">
      {#if
        point.cohort ===
        'Average'
      }
        <span
          class="average-symbol"
          aria-hidden="true"
        ></span>
      {:else}
        <span
          class="cohort-dot"
          aria-hidden="true"
        ></span>
      {/if}

      <p class="cohort">
        {point.cohort}
      </p>
    </div>

    <p class="topic">
      {point.topic}
    </p>

    <h3>
      {point.reason}
    </h3>

    <p class="value">
      {point.value}<sup>%</sup>
    </p>
  </aside>
{/if}

<style>
  .tooltip {
    position: fixed;
    z-index: 1000;

    box-sizing: border-box;
    width: 310px;
    padding: 1rem;

    border:
      1px solid
      rgb(255 255 255 / 17%);

    border-radius: 0.85rem;

    background:
      rgb(10 52 45 / 97%);

    color: white;

    box-shadow:
      0 18px 45px
        rgb(0 0 0 / 28%),
      0 2px 8px
        rgb(0 0 0 / 18%);

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

    flex: 0 0 auto;

    border-radius: 50%;

    background:
      var(--active-colour);
  }

  .average-symbol {
    width: 3px;
    height: 0.95rem;

    flex: 0 0 auto;

    border-radius: 999px;

    background: white;
  }

  .cohort,
  .topic,
  h3,
  .value {
    margin: 0;
  }

  .cohort {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.045em;
    text-transform: uppercase;

    opacity: 0.78;
  }

  .topic {
    color: #05c690;

    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.06em;
  }

  h3 {
    margin-top: 0.2rem;

    font-size: 0.95rem;
    line-height: 1.3;
  }

  .value {
    margin-top: 0.7rem;

    font-size: 1.4rem;
    font-weight: 800;
  }

  .value sup {
    font-size: 0.55em;
    vertical-align: super;
  }
</style>