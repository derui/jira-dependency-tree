
module.exports = {
  extends: ["stylelint-config-standard", "stylelint-config-prettier"],
  rules: {
    "selector-class-pattern": ".+"
  },
  ignoreFiles: [
    "src/css/reset.css"
  ]
}
