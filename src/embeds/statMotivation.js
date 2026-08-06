import { mount } from 'svelte';

import Chart
  from '$lib/components/charts/stat-motivation/InteractiveMotivationChart.svelte';

const selector =
  '[data-kf-chart="stat-motivation"]';

function initialise() {
  document
    .querySelectorAll(selector)
    .forEach((target) => {

      /*
       * Avoid mounting the same
       * chart twice.
       */
      if (
        target.dataset
          .kfInitialised ===
        'true'
      ) {
        return;
      }

      mount(Chart, {
        target
      });

      target.dataset
        .kfInitialised =
        'true';
    });
}

if (
  document.readyState ===
  'loading'
) {
  document.addEventListener(
    'DOMContentLoaded',
    initialise,
    {
      once: true
    }
  );
} else {
  initialise();
}