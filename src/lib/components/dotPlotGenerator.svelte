<script>
  import DotPlot from '$lib/components/dotPlot.svelte';

  const data = [
    {
      Measure: 'Starting planning too late',
      Total: '53',
      'Board member': '50',
      CEO: '57',
      'Tenured CEO': '60',
      'First-time CEO ': '56',
      '': ''
    },
    {
      Measure:
        'Failing to gather adequate 360-degree feedback (including input from direct reports, peers and cross-functional partners)',
      Total: '69',
      'Board member': '70',
      CEO: '69',
      'Tenured CEO': '54',
      'First-time CEO ': '74',
      '': ''
    },
    {
      Measure:
        'Choosing a candidate based on politics and/or tenure rather than capability',
      Total: '42',
      'Board member': '42',
      CEO: '42',
      'Tenured CEO': '49',
      'First-time CEO ': '39',
      '': ''
    },
    {
      Measure: 'Evaluating too few candidates',
      Total: '39',
      'Board member': '46',
      CEO: '32',
      'Tenured CEO': '29',
      'First-time CEO ': '33',
      '': ''
    },
    {
      Measure: 'Evaluating too many candidates',
      Total: '30',
      'Board member': '25',
      CEO: '34',
      'Tenured CEO': '46',
      'First-time CEO ': '30',
      '': ''
    },
    {
      Measure:
        "Choosing based on what's safe and has worked in the past versus what may transform the company",
      Total: '46',
      'Board member': '50',
      CEO: '41',
      'Tenured CEO': '34',
      'First-time CEO ': '43',
      '': ''
    }
  ];
</script>

<DotPlot {data} />