import { defineConfig } from 'vite';
import path from 'path';

const isProduction = process.env['NODE_ENV'] === 'production';
const isCI = process.env['CI'] === 'true';

export default defineConfig({
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
  },
  publicDir: 'dist',
  define:{
    "process.env": {
      "CI": isCI ? 'ci' : ''
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "./env": path.join(__dirname, 'src', isProduction ? 'env.prod' : 'env')
    },
  },
});
