<script>
  import ChartControls from '$lib/components/chartControls.svelte';
  import HorizontalBarChart from '$lib/components/horizontalBarChart.svelte';
  import { defaultData, defaultAverage } from '$lib/datasets/chartData_1a.js';

  let chartData = $state(
      defaultData.map((point) => ({ ...point }))
    );

  let chartAverage = $state(defaultAverage);

  let darkMode = $state(false);

  let horizontalBarChart;

  function handleGenerate(event) {
    chartData = event.data;
    chartAverage = event.average;
  }

  function handleDownload(format) {
    horizontalBarChart?.downloadChart(format);
  }
</script>

<div class:dark-mode={darkMode} class="chart-generator-wrapper">
<div class="toolbar">
  <div class="download-controls">
    <span class="download-label">Download:</span>

    <button
      type="button"
      class="download-button"
      onclick={() => handleDownload('png')}
    >
      PNG
    </button>

    <button
      type="button"
      class="download-button"
      onclick={() => handleDownload('jpeg')}
    >
      JPEG
    </button>

    <button
      type="button"
      class="download-button"
      onclick={() => handleDownload('svg')}
    >
      SVG
    </button>
  </div>

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
      bind:this={horizontalBarChart}
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

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .download-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .download-label {
    margin-right: 0.25rem;
    font-size: 0.875rem;
    font-weight: 700;
  }

  .download-button {
    border: 1px solid #9ca3af;
    border-radius: 999px;
    padding: 0.55rem 0.8rem;
    background: white;
    color: #111827;
    font: inherit;
    font-size: 0.875rem;
    font-weight: 700;
    cursor: pointer;
  }

  .download-button:hover {
    background: #f3f4f6;
  }

  .dark-mode .download-button {
    border-color: rgb(255 255 255 / 45%);
    background: rgb(255 255 255 / 10%);
    color: white;
  }

  .dark-mode .download-button:hover {
    background: rgb(255 255 255 / 18%);
  }

  @media (max-width: 600px) {
    .toolbar {
      align-items: flex-start;
      flex-direction: column-reverse;
    }

    .download-controls {
      flex-wrap: wrap;
    }
  }

  @media (max-width: 800px) {
    .chart-generator {
      grid-template-columns: 1fr;
    }
  }
</style>