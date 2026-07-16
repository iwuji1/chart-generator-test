<script>
  import BarChart from '$lib/components/barChartGenerator.svelte';
  import InteractiveDotPlot from '$lib/components/interactiveDotPlotGenerator.svelte';
  import InteractiveDotPlot_2 from '$lib/components/interactiveDotPlot/interactiveDotPlot.svelte';
  import ScatterPlot from '$lib/components/scatterPlot/ScatterPlot.svelte'
</script>

<svelte:head>
  <title>Korn Ferry Chart Generator</title>
</svelte:head>

<main>
  <h1>Korn Ferry Chart Generator</h1>

  <section class="standard-chart">
    <BarChart />
  </section>

  <section class="mid-chart">
    <InteractiveDotPlot />
  </section>

  <section class="wide-chart">
    <InteractiveDotPlot_2 />
  </section>

  <section class="wide-chart">
    <ScatterPlot />
  </section>
</main>

<style>
  main {
    width: 100%;
    padding-block: 2rem 5rem;
    box-sizing: border-box;
  }

  h1 {
    width: min(100% - 2rem, 1200px);
    margin: 0 auto 3rem;
    font-family: 'gotham', sans-serif;
  }

  .standard-chart {
    width: min(100% - 2rem, 1500px);
    margin: 0;
  }

  .mid-chart {
    width: min(100% - 2rem, 1000px);
    margin: 0 auto 5rem;
  }

  .wide-chart {
    width: min(100% - 2rem, 1440px);
    margin: 0 auto;
  }

  @media (max-width: 700px) {
    main {
      padding-block: 1rem 3rem;
    }

    h1,
    .standard-chart,
    .wide-chart {
      width: min(100% - 1rem, 1440px);
    }
  }
</style>