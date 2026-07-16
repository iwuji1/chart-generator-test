<script>
  import ChartControls from '$lib/components/chartControls.svelte';
  import HorizontalBarChart from '$lib/components/horizontalBarChart.svelte';
  import { defaultData, defaultAverage } from '$lib/datasets/chartData_1a.js';

let chartData = $state(
    defaultData.map((point) => ({ ...point }))
  );

  let chartAverage = $state(defaultAverage);

  let darkMode = $state(false);

  function handleGenerate(event) {
    chartData = event.data;
    chartAverage = event.average;
  }
</script>

<div class:dark-mode={darkMode} class="chart-generator-wrapper">
  <div class="toolbar">
    <button
      type="button"
      class="mode-button"
      aria-pressed={darkMode}
      onclick={() => {
        darkMode = !darkMode;
      }}
    >
      {darkMode ? 'Light mode' : 'Dark mode'}
    </button>
  </div>

  <div class="chart-generator">
    <ChartControls
      {defaultData}
      {defaultAverage}
      onGenerate={handleGenerate}
      {darkMode}
    />

    <HorizontalBarChart
      data={chartData}
      average={chartAverage}
      {darkMode}
    />
  </div>
</div>

<style>
  .chart-generator-wrapper {
    box-sizing: border-box;
    width: 100%;
    padding: 1.5rem;
    background: #ffffff;
    color: #111111;
    transition:
      background 220ms ease,
      color 220ms ease;
  }

  .chart-generator-wrapper.dark-mode {
  background:
    radial-gradient(
      circle at 15% 85%,
      #2f9d7c 0%,
      rgba(47, 157, 124, 0.45) 20%,
      rgba(47, 157, 124, 0) 45%
    ),
    radial-gradient(
      circle at 55% 45%,
      rgba(34, 120, 104, 0.35) 0%,
      rgba(34, 120, 104, 0) 45%
    ),
    linear-gradient(
      135deg,
      #14584c 0%,
      #0a5b4f 35%,
      #07463d 70%,
      #053a33 100%
    );

  color: white;
}

  .toolbar {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 1rem;
  }

  .mode-button {
    border: 1px solid #9ca3af;
    border-radius: 999px;
    padding: 0.55rem 0.9rem;
    background: white;
    color: #111827;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }

  .mode-button:hover {
    background: #f3f4f6;
  }

  .dark-mode .mode-button {
    border-color: rgb(255 255 255 / 45%);
    background: rgb(255 255 255 / 10%);
    color: white;
  }

  .dark-mode .mode-button:hover {
    background: rgb(255 255 255 / 18%);
  }

  .chart-generator {
    display: grid;
    grid-template-columns: minmax(250px, 320px) minmax(0, 900px);
    gap: 2rem;
    align-items: start;
    width: 100%;
  }

  @media (max-width: 800px) {
    .chart-generator {
      grid-template-columns: 1fr;
    }
  }
</style>