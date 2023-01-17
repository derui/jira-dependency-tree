module.exports = {
  files: [ "src/**/*.test.*"],
  extensions: {
    "ts": "module",
    "tsx": "module",
  },
  "nodeArguments": [
    "--loader=./loader.js",
    "--no-warnings"
  ],
  "require": [
    "esbuild-register",
    "jsdom-global/register"
  ]
}
