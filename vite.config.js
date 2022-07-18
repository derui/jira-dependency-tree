import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const isProduction = process.env['NODE_ENV'] === 'production';

export default defineConfig({
  plugins: [tsconfigPaths()],
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
  publicDir: 'dist',
});
