import {
  defineConfig
} from 'vite';

import {
  svelte
} from '@sveltejs/vite-plugin-svelte';

import cssInjectedByJsPlugin
  from 'vite-plugin-css-injected-by-js';

import path
  from 'node:path';

const stat =
  process.env.KF_STAT ?? '1';

const entry =
  path.resolve(
    process.cwd(),
    `src/embeds/stat${stat}.js`
  );

export default defineConfig({
  plugins: [
    svelte(),

    cssInjectedByJsPlugin()
  ],

  resolve: {
    alias: {
      $lib: path.resolve(
        process.cwd(),
        'src/lib'
      )
    }
  },

  build: {
    outDir:
      'dist-embeds',

    /*
     * Don't delete Stat 1 when
     * building Stat 2 etc.
     */
    emptyOutDir: false,

    minify: true,

    lib: {
      entry,

      name:
        `KFStat${stat}`,

      formats: [
        'iife'
      ],

      fileName: () =>
        `stat-${stat}.js`
    },

    rollupOptions: {
      output: {
        inlineDynamicImports: true
      }
    }
  }
});