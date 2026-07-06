import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  // Relative base so the static bundle works at any hosting path
  // (GitHub Pages project sites, custom domains, local file previews).
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        demo: resolve(import.meta.dirname, 'demo.html'),
      },
    },
  },
});
