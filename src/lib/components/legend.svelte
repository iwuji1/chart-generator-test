<script>
  let {
    cohorts,
    colourScale,
    selectedCohort,
    hoveredCohort,
    onSelect,
    onPreview,
    onClearPreview
  } = $props();

  const activeCohort = $derived(
    hoveredCohort ?? selectedCohort
  );

  function handleKeydown(event, cohort) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(cohort);
    }
  }
</script>

<div
  class="legend"
  role="group"
  aria-label="Select a cohort"
>
  {#each cohorts as cohort}
    <button
      type="button"
      class:active={activeCohort === cohort}
      class:muted={activeCohort &&
        activeCohort !== cohort}
      aria-pressed={selectedCohort === cohort}
      onmouseenter={() => onPreview(cohort)}
      onmouseleave={onClearPreview}
      onfocus={() => onPreview(cohort)}
      onblur={onClearPreview}
      onclick={() => onSelect(cohort)}
      onkeydown={(event) =>
        handleKeydown(event, cohort)}
    >
      <span
        class="legend-dot"
        style={`--cohort-colour: ${colourScale(cohort)}`}
      ></span>

      <span>{cohort}</span>
    </button>
  {/each}
</div>

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.55rem;
  }

  button {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    border: 1px solid transparent;
    border-radius: 999px;
    padding: 0.45rem 0.7rem;
    background: transparent;
    color: #252525;
    font: inherit;
    font-size: 0.875rem;
    cursor: pointer;
    transition:
      background 160ms ease,
      border-color 160ms ease,
      opacity 160ms ease;
  }

  button:hover,
  button:focus-visible,
  button.active {
    border-color: #c7cbd0;
    background: #f4f5f6;
    outline: none;
  }

  button.muted {
    opacity: 0.42;
  }

  .legend-dot {
    width: 0.7rem;
    height: 0.7rem;
    flex: 0 0 auto;
    border-radius: 50%;
    background: #9ca3af;
    transition:
      background 160ms ease,
      transform 160ms ease;
  }

  button.active .legend-dot,
  button:hover .legend-dot,
  button:focus-visible .legend-dot {
    background: var(--cohort-colour);
    transform: scale(1.2);
  }
</style>