import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';

const coreDir = resolve(__dirname, '../core');

export default defineConfig({
  main: {
    root: 'src/main',
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: { '@core': coreDir },
    },
    build: {
      outDir: resolve(__dirname, 'out/main'),
      rollupOptions: {
        input: resolve(__dirname, 'src/main/index.ts'),
      },
    },
  },
  preload: {
    root: 'src/preload',
    plugins: [externalizeDepsPlugin()],
    build: {
      outDir: resolve(__dirname, 'out/preload'),
      rollupOptions: {
        input: resolve(__dirname, 'src/preload/index.ts'),
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    resolve: {
      alias: { '@core': coreDir },
    },
    build: {
      outDir: resolve(__dirname, 'out/renderer'),
      rollupOptions: {
        input: resolve(__dirname, 'src/renderer/index.html'),
      },
    },
    plugins: [react(), tailwindcss()],
    server: { port: 3000 },
  },
});
