<script>
  let {
    cohorts = [],
    highlightedGroup = '',
    comparisonGroup = '',
    onHighlight,
    onCompare,
    onClearHighlight,
    onClearComparison
  } = $props();

  const comparisonOptions =
    $derived(
      cohorts.filter(
        (cohort) =>
          cohort !==
          highlightedGroup
      )
    );
</script>

<div class="comparison-selectors">

  <div class="select-field">
    <label
      class="select-label highlight-label"
      for="stat4-highlight-cohort"
    >
      HIGHLIGHT COHORT
    </label>

    <div class="select-input-row">
      <select
        id="stat4-highlight-cohort"
        value={highlightedGroup}
        onchange={onHighlight}
      >
        <option value="">
          Select a cohort
        </option>

        {#each cohorts as cohort}
          <option value={cohort}>
            {cohort}
          </option>
        {/each}
      </select>

      <button
        type="button"
        class="reset-selection reset-highlight"
        onclick={onClearHighlight}
        disabled={
          !highlightedGroup ||
          !!comparisonGroup
        }
        aria-label="Clear highlighted cohort"
        title={
          comparisonGroup
            ? 'Remove comparison first'
            : 'Clear highlighted cohort'
        }
      >
        <span aria-hidden="true">
          ×
        </span>
      </button>
    </div>
  </div>


  <div
    class="select-field"
    class:disabled-field={
      !highlightedGroup
    }
  >
    <label
      class="select-label compare-label"
      for="stat4-compare-cohort"
    >
      COMPARE WITH
    </label>

    <div class="select-input-row">
      <select
        id="stat4-compare-cohort"
        value={comparisonGroup}
        disabled={!highlightedGroup}
        onchange={onCompare}
      >
        <option value="">
          {highlightedGroup
            ? 'Select another cohort'
            : 'Choose highlight cohort first'}
        </option>

        {#each
          comparisonOptions
          as cohort
        }
          <option value={cohort}>
            {cohort}
          </option>
        {/each}
      </select>

      <button
        type="button"
        class="reset-selection reset-compare"
        onclick={onClearComparison}
        disabled={!comparisonGroup}
        aria-label="Clear comparison cohort"
      >
        <span aria-hidden="true">
          ×
        </span>
      </button>
    </div>
  </div>

</div>

<style>
  .comparison-selectors {
    display: grid;

    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );

    gap: 0.75rem;
  }

  .select-field {
    display: grid;
    gap: 0.35rem;

    min-width: 0;
  }

  .select-label {
    width: fit-content;

    border-radius: 999px;
    padding:
      0.08rem
      0.42rem;

    color: white;

    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.06em;
  }

  .highlight-label {
    background: #05c690;
  }

  .compare-label {
    background: #007da4;
  }

  .select-input-row {
    display: grid;

    grid-template-columns:
      minmax(0, 1fr)
      34px;

    gap: 0.4rem;
    align-items: center;

    width: 100%;
    min-width: 0;
  }

  select {
    width: 100%;
    min-width: 0;

    box-sizing: border-box;

    border:
      1px solid
      #cbd1ce;

    border-radius: 0.65rem;

    padding:
      0.65rem
      2.25rem
      0.65rem
      0.75rem;

    background: white;
    color: #202422;

    font: inherit;
    font-size: 0.82rem;
    font-weight: 600;

    cursor: pointer;
  }

  select:hover {
    border-color: #89938f;
  }

  select:focus-visible {
    border-color: #123f37;

    outline:
      2px solid
      rgb(18 63 55 / 20%);

    outline-offset: 2px;
  }

  select:disabled {
    background: #f2f4f3;
    color: #929995;

    cursor: not-allowed;
  }

  .reset-selection {
    display: grid;
    place-items: center;

    width: 34px;
    height: 34px;

    box-sizing: border-box;

    border:
      1px solid
      #cbd1ce;

    border-radius: 50%;

    background: white;

    font: inherit;
    font-size: 1.25rem;
    line-height: 1;

    cursor: pointer;

    transition:
      background 150ms ease,
      color 150ms ease,
      opacity 150ms ease,
      transform 150ms ease;
  }

  .reset-selection span {
    transform:
      translateY(-1px);
  }

  .reset-highlight {
    border-color: #05c690;
    color: #05c690;
  }

  .reset-highlight:hover:not(:disabled) {
    background: #05c690;
    color: white;
  }

  .reset-compare {
    border-color: #007da4;
    color: #007da4;
  }

  .reset-compare:hover:not(:disabled) {
    background: #007da4;
    color: white;
  }

  .reset-selection:disabled {
    border-color: #dfe3e1;

    background: #f3f5f4;
    color: #afb6b3;

    opacity: 0.55;

    cursor: not-allowed;
  }

  @media (
    max-width: 680px
  ) {
    .comparison-selectors {
      grid-template-columns:
        minmax(0, 1fr);
    }
  }
</style>