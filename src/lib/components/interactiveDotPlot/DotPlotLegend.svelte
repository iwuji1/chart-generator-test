<script>
  let {
    cohorts,
    colourScale,
    selectedCohort = null,
    hoveredCohort = null,
    onSelect,
    onPreview,
    onClearPreview,
    vertical = false
  } = $props();

  const activeCohort = $derived(
    hoveredCohort ?? selectedCohort
  );

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
  aria-label="Select a leadership cohort"
>
  {#each cohorts as cohort}
    <button
      type="button"
      class:active={activeCohort === cohort}
      class:muted={
        activeCohort &&
        activeCohort !== cohort
      }
      aria-pressed={
        selectedCohort === cohort
      }
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
  button:hover .legend-dot,
  button:focus-visible .legend-dot {
    background: var(--cohort-colour);
    transform: scale(1.25);
  }
</style>