import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [preact()],
  root: join(__dirname, 'client'),
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: join(__dirname, 'dist'),
    emptyOutDir: true,
    minify: 'esbuild',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
});