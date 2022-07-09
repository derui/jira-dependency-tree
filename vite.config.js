import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const isProduction = process.env['NODE_ENV'] === 'production';

export default defineConfig({
  plugins: [solidPlugin(), tsconfigPaths()],
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
  publicDir: 'dist',
});
