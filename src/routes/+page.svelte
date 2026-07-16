<script>
  // You can import SvelteKit modules here

  import BarChart from '$lib/components/barChartGenerator.svelte';
  import DotPlot from '$lib/components/dotPlotGenerator.svelte';
  import InteractiveDotPlot from '$lib/components/interactiveDotPlotGenerator.svelte';
  import InteractiveDotPlot_2 from '$lib/components/interactiveDotPlot/interactiveDotPlot.svelte'
</script>

<div>
    <h1>Korn Ferry Chart Generator</h1>

    <BarChart />
    <InteractiveDotPlot />
    <div class="chart-container">
      <InteractiveDotPlot_2 />
    </div>
    
</div>

<style>
  h1 {
    font-family: 'gotham', sans-serif;

  }

  .chart-container {
    width: min(100%, 900px);
    margin-inline: auto;
    padding: 1rem;
    overflow-x: auto;
    box-sizing: border-box;
  }
</style>