module.exports = {
  files: [ "src/**/*.test.*"],
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
