module.exports = {
  files: [ "src/**/*.test.tsx", 'src/**/*.test.ts'],
  extensions: {
    "ts": "module",
    "tsx": "module",
  },
  "nodeArguments": [
    "--loader=./loader.js"
  ],
  "require": [
    "esbuild-register",
    "jsdom-global/register"
  ]
}
