<script>
  let {
    cohorts,
    colourScale,
    selectedCohorts = [],
    hoveredCohort = null,
    onSelect,
    onPreview,
    onClearPreview,
    vertical = false
  } = $props();

  const activeCohorts = $derived.by(() => {
    const active = [...selectedCohorts];

    if (
      hoveredCohort &&
      !active.includes(hoveredCohort)
    ) {
      active.push(hoveredCohort);
    }

    return active;
  });

  function isSelected(cohort) {
    return selectedCohorts.includes(cohort);
  }

  function isActive(cohort) {
    return activeCohorts.includes(cohort);
  }

  function isMuted(cohort) {
    return (
      activeCohorts.length > 0 &&
      !activeCohorts.includes(cohort)
    );
  }

  function handleKeydown(event, cohort) {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault();
      onSelect(cohort);
    }
  }
</script>

<div
  class="legend"
  class:vertical
  role="group"
  aria-label="Select up to two leadership cohorts"
>
  {#each cohorts as cohort}
    <button
      type="button"
      class:active={isActive(cohort)}
      class:selected={isSelected(cohort)}
      class:muted={isMuted(cohort)}
      aria-pressed={isSelected(cohort)}
      onmouseenter={() =>
        onPreview(cohort)}
      onmouseleave={onClearPreview}
      onfocus={() =>
        onPreview(cohort)}
      onblur={onClearPreview}
      onclick={() =>
        onSelect(cohort)}
      onkeydown={(event) =>
        handleKeydown(event, cohort)}
    >
      <span
        class="legend-dot"
        style={`--cohort-colour: ${colourScale(cohort)}`}
      ></span>

      <span>{cohort}</span>

      {#if isSelected(cohort)}
        <span class="selected-indicator">
          ✓
        </span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .legend.vertical {
    display: grid;
    grid-template-columns: 1fr;
  }

  .legend.vertical button {
    justify-content: flex-start;
    width: 100%;
    text-align: left;
  }

  button {
    display: inline-flex;
    gap: 0.45rem;
    align-items: center;

    border: 1px solid transparent;
    border-radius: 999px;
    padding: 0.48rem 0.72rem;

    background: transparent;
    color: #272c2a;

    font: inherit;
    font-size: 0.8rem;
    cursor: pointer;

    transition:
      opacity 150ms ease,
      background 150ms ease,
      border-color 150ms ease;
  }

  button:hover,
  button:focus-visible,
  button.active {
    border-color: #cad0cd;
    background: #f2f4f3;
    outline: none;
  }

  button.selected {
    border-color: var(--cohort-colour);
    background: #f2f4f3;
    font-weight: 700;
  }

  button.muted {
    opacity: 0.38;
  }

  .legend-dot {
    width: 0.72rem;
    height: 0.72rem;
    flex: 0 0 auto;

    border-radius: 50%;
    background: #929b98;

    transition:
      transform 150ms ease,
      background 150ms ease;
  }

  button.active .legend-dot,
  button.selected .legend-dot,
  button:hover .legend-dot,
  button:focus-visible .legend-dot {
    background: var(--cohort-colour);
    transform: scale(1.25);
  }

  .selected-indicator {
    margin-left: auto;
    color: var(--cohort-colour);
    font-size: 0.75rem;
    font-weight: 900;
  }
</style>