<script>
  let {
    defaultData,
    defaultAverage,
    onGenerate,
    darkMode = false
  } = $props();

  let formData = $state(
    defaultData.map(() => ({
      label: '',
      value: ''
    }))
  );

  let formAverage = $state('');

  function getValue(value, fallback) {
    if (
      value === '' ||
      value === undefined ||
      value === null
    ) {
      return fallback;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return fallback;
    }

    return Math.min(100, Math.max(0, parsedValue));
  }

  function getLabel(value, fallback) {
    return value?.trim() || fallback;
  }

  function generateChart() {
    const data = defaultData.map((defaultPoint, index) => ({
      ...defaultPoint,
      label: getLabel(
        formData[index].label,
        defaultPoint.label
      ),
      value: getValue(
        formData[index].value,
        defaultPoint.value
      )
    }));

    const average = getValue(
      formAverage,
      defaultAverage
    );

    onGenerate({
      data,
      average
    });
  }
</script>

<form
  class:dark-mode={darkMode}
  class="chart-controls"
  onsubmit={(event) => {
    event.preventDefault();
    generateChart();
  }}
>
  <h2>Chart data</h2>

  <div class="input-heading">
    <span>Category</span>
    <span>Value</span>
  </div>

  {#each formData as input, i}
    <div class="input-row">
      <input
        type="text"
        bind:value={input.label}
        placeholder={defaultData[i].label}
        aria-label={`Category ${i + 1}`}
      />

      <label class="value-input">
        <input
          type="number"
          min="0"
          max="100"
          step="1"
          bind:value={input.value}
          placeholder={String(defaultData[i].value)}
          aria-label={`Value for category ${i + 1}`}
        />

        <span>%</span>
      </label>
    </div>
  {/each}

  <label class="average-input">
    <span>Average</span>

    <div class="value-input">
      <input
        type="number"
        min="0"
        max="100"
        step="1"
        bind:value={formAverage}
        placeholder={String(defaultAverage)}
      />

      <span>%</span>
    </div>
  </label>

  <button type="submit">
    Generate
  </button>

  <p>Blank fields use the original values.</p>
</form>

<style>
  .chart-controls {
    display: grid;
    gap: 0.8rem;
    padding: 1.25rem;
    border: 1px solid #d1d5db;
    border-radius: 0.75rem;
    background: #f8f8f8;
  }

  h2,
  p {
    margin: 0;
  }

  .input-heading,
  .input-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 90px;
    gap: 0.75rem;
  }

  .input-heading {
    font-size: 0.8rem;
    font-weight: 700;
    color: #4b5563;
  }

  input {
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    border: 1px solid #9ca3af;
    border-radius: 0.4rem;
    padding: 0.6rem;
    background: white;
    font: inherit;
  }

  .value-input {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .average-input {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 90px;
    gap: 0.75rem;
    align-items: center;
    margin-top: 0.5rem;
    font-weight: 700;
  }

  button {
    margin-top: 0.5rem;
    border: 0;
    border-radius: 0.5rem;
    padding: 0.7rem 1rem;
    background: #facc15;
    color: #111827;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  p {
    font-size: 0.8rem;
    color: #6b7280;
  }
  .chart-controls {
  background: #f8f8f8;
  color: #111;
  transition:
    background 220ms ease,
    color 220ms ease,
    border-color 220ms ease;
  }

  .chart-controls.dark-mode {
    border-color: rgb(255 255 255 / 25%);
    background: rgb(0 0 0 / 16%);
    color: white;
  }

  .chart-controls.dark-mode input {
    border-color: rgb(255 255 255 / 35%);
    background: rgb(255 255 255 / 10%);
    color: white;
  }

  .chart-controls.dark-mode input::placeholder {
    color: rgb(255 255 255 / 60%);
  }

  .chart-controls.dark-mode p,
  .chart-controls.dark-mode .input-heading {
    color: rgb(255 255 255 / 70%);
  }

</style>