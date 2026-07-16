<script>
  let {
    measures,
    segmentGroups,
    xMeasure,
    yMeasure,
    selectedGroups,
    onXMeasureChange,
    onYMeasureChange,
    onToggleGroup,
    onSelectAll,
    onResetGroups,
    onSwapAxes
  } = $props();

  const groupNames = Object.keys(segmentGroups);
</script>

<div class="controls">
  <div class="axis-controls">
    <label>
      <span>X-axis measure</span>

      <select
        value={xMeasure}
        onchange={(event) =>
          onXMeasureChange(event.currentTarget.value)}
      >
        {#each measures as measure}
          <option value={measure}>
            {measure}
          </option>
        {/each}
      </select>
    </label>

    <button
      type="button"
      class="swap-button"
      aria-label="Swap horizontal and vertical measures"
      onclick={onSwapAxes}
    >
      ⇄
      <span>Swap axes</span>
    </button>

    <label>
      <span>Y-axis measure</span>

      <select
        value={yMeasure}
        onchange={(event) =>
          onYMeasureChange(event.currentTarget.value)}
      >
        {#each measures as measure}
          <option value={measure}>
            {measure}
          </option>
        {/each}
      </select>
    </label>
  </div>

  <fieldset>
    <legend>Segment groups</legend>
    <span>
    {selectedGroups.length} of {groupNames.length}
  </span>
    <div class="group-options">
      {#each groupNames as group}
        <label class="checkbox-label">
          <input
            type="checkbox"
            checked={selectedGroups.includes(group)}
            onchange={() => onToggleGroup(group)}
          />

          <span>{group}</span>

          <small>
            {segmentGroups[group].length}
          </small>
        </label>
      {/each}
    </div>

    <div class="filter-actions">
      <button
        type="button"
        onclick={onSelectAll}
      >
        Select all
      </button>

      <button
        type="button"
        onclick={onResetGroups}
      >
        Show all
      </button>
    </div>
  </fieldset>
</div>

<style>
  .controls {
    display: grid;
    gap: 1.2rem;
    padding: 1rem;
    border: 1px solid #d7dcda;
    border-radius: 0.8rem;
    background: #f7f9f8;
  }

  .axis-controls {
    display: grid;
    grid-template-columns:
      minmax(0, 1fr)
      auto
      minmax(0, 1fr);
    gap: 0.8rem;
    align-items: end;
  }

  label {
    display: grid;
    gap: 0.35rem;
  }

  label > span,
  legend {
    color: #303633;
    font-size: 0.8rem;
    font-weight: 700;
  }

  select {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    border: 1px solid #b8bfbc;
    border-radius: 0.45rem;
    padding: 0.62rem;
    background: white;
    color: #171a19;
    font: inherit;
  }

  .swap-button {
    display: grid;
    justify-items: center;
    border: 1px solid #b8bfbc;
    border-radius: 0.5rem;
    padding: 0.45rem 0.65rem;
    background: white;
    color: #1f5147;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .swap-button span {
    font-size: 0.65rem;
  }

  fieldset {
    margin: 0;
    border: 0;
    padding: 0;
  }

  legend {
    margin-bottom: 0.55rem;
  }

  .group-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.45rem;
  }

  .checkbox-label {
    display: inline-flex;
    grid-template-columns: none;
    gap: 0.4rem;
    align-items: center;
    border: 1px solid #d2d7d5;
    border-radius: 999px;
    padding: 0.42rem 0.65rem;
    background: white;
    cursor: pointer;
  }

  .checkbox-label small {
    color: #747c79;
    font-size: 0.7rem;
  }

  .filter-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.7rem;
  }

  .filter-actions button {
    border: 0;
    padding: 0;
    background: transparent;
    color: #1d6356;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
  }

  @media (max-width: 700px) {
    .axis-controls {
      grid-template-columns: 1fr;
    }

    .swap-button {
      justify-self: start;
    }
  }
</style>