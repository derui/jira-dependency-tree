module.exports = {
  files: [ "test/**/*"],
  extensions: {
    "ts": "module"
  },
  "nodeArguments": [
    "--loader=./loader.js"
  ],
  "require": [
    "esbuild-register"
  ]
}
