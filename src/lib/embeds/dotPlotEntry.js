import { mount } from 'svelte';

import InteractiveDotPlot from '$lib/components/interactiveDotPlot_v1.svelte';
import { dotPlotV1Data } from '$lib/datasets/dotPlotV1Data.js';

function mountDotPlots() {
  const targets = document.querySelectorAll(
    '[data-interactive-dot-plot]'
  );

  targets.forEach((target) => {
    if (target.dataset.dotPlotMounted === 'true') {
      return;
    }

    mount(InteractiveDotPlot, {
      target,

      props: {
        data: dotPlotV1Data
      }
    });

    target.dataset.dotPlotMounted = 'true';
  });
}

if (document.readyState === 'loading') {
  document.addEventListener(
    'DOMContentLoaded',
    mountDotPlots
  );
} else {
  mountDotPlots();
}

window.mountInteractiveDotPlots = mountDotPlots;