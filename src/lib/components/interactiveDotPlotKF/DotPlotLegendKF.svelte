<script>
  let {
    cohorts,
    getCohortColour,
    selectedCohorts = [],
    hoveredCohort = null,
    onSelect,
    onPreview,
    onClearPreview
  } = $props();

  function isSelected(cohort) {
    return selectedCohorts.includes(cohort);
  }

  function isActive(cohort) {
    return (
      isSelected(cohort) ||
      hoveredCohort === cohort
    );
  }

  function isMuted(cohort) {
    return (
      selectedCohorts.length > 0 &&
      !isSelected(cohort)
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
  role="group"
  aria-label="Select up to two cohorts"
>
  {#each cohorts as cohort}
    <button
      type="button"
      class:active={isActive(cohort)}
      class:selected={isSelected(cohort)}
      class:muted={isMuted(cohort)}
      style={`--cohort-colour: ${getCohortColour(cohort)}`}
      aria-pressed={isSelected(cohort)}
      onmouseenter={() => onPreview(cohort)}
      onmouseleave={onClearPreview}
      onfocus={() => onPreview(cohort)}
      onblur={onClearPreview}
      onclick={() => onSelect(cohort)}
      onkeydown={(event) =>
        handleKeydown(event, cohort)}
    >
      <span class="legend-dot"></span>

      <span>{cohort}</span>

      {#if isSelected(cohort)}
        <span
          class="selected-indicator"
          aria-hidden="true"
        >
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
    gap: 0.4rem;
    width: 100%;
  }

  button {
    display: inline-flex;
    gap: 0.42rem;
    align-items: center;

    border: 1px solid transparent;
    border-radius: 999px;
    padding: 0.45rem 0.68rem;

    background: transparent;
    color: #272c2a;

    font: inherit;
    font-size: 0.76rem;
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
    font-weight: 700;
  }

  button.muted {
    opacity: 0.45;
  }

  .legend-dot {
    width: 0.68rem;
    height: 0.68rem;
    flex: 0 0 auto;

    box-sizing: border-box;
    border: 1.5px solid #8f9895;
    border-radius: 50%;

    background: white;

    transition:
      transform 150ms ease,
      background 150ms ease,
      border-color 150ms ease;
  }

  button.active .legend-dot,
  button.selected .legend-dot {
    border-color: var(--cohort-colour);
    background: var(--cohort-colour);
    transform: scale(1.2);
  }

  .selected-indicator {
    color: var(--cohort-colour);
    font-size: 0.7rem;
    font-weight: 900;
  }
</style>