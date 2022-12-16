module.exports = {
  files: [ "test/**/*",
           '!test/helper.ts'
         ],
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
