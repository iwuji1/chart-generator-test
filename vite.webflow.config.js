import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        /*
         * Your project uses Svelte 5 runes.
         */
        runes: true
      }
    })
  ],

  resolve: {
    alias: {
      /*
       * Recreate the $lib alias because this build runs
       * outside the normal SvelteKit configuration.
       */
      $lib: fileURLToPath(
        new URL('./src/lib', import.meta.url)
      )
    }
  },

  build: {
    /*
     * Files placed in static are copied into the final
     * SvelteKit/Netlify site.
     */
    outDir: 'static/embeds/interactive-dot-plot',

    /*
     * Only clear this specific embed folder.
     */
    emptyOutDir: true,

    lib: {
      entry: fileURLToPath(
        new URL(
          './src/lib/embeds/dotPlotEntry.js',
          import.meta.url
        )
      ),

      name: 'InfoStudiosInteractiveDotPlot',

      /*
       * IIFE produces a conventional browser script that
       * Webflow can load without type="module".
       */
      formats: ['iife'],

      fileName: () => 'interactive-dot-plot.js',

      cssFileName: 'interactive-dot-plot'
    },

    rollupOptions: {
      output: {
        /*
         * Keep this embed as one JavaScript file rather
         * than generating dynamic JS chunks.
         */
        inlineDynamicImports: true
      }
    }
  }
});