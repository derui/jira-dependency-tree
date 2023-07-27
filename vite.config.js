import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const isProduction = process.env['NODE_ENV'] === 'production';
const isCI = process.env['CI'] === 'true';

export default defineConfig({
  build: {
    target: 'esnext',
    polyfillDynamicImport: false,
    jsx: isProduction ? 'react-jsx' : 'react-jsxdev',
  },
  publicDir: 'public',
  define:{
    "process.env": {
      "CI": isCI ? 'ci' : ''
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "./env": path.join(__dirname, 'src', isProduction ? 'env.prod' : 'env')
    },
  },
});
