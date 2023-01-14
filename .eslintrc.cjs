module.exports = {
  plugins: ["@typescript-eslint", "import"],
  parser: '@typescript-eslint/parser',
  extends:  [
    "plugin:import/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  env: {
    es6: true,
    browser: true,
  },
  rules: {
    "import/order": "error",
    "func-style": ["error", "expression"],
    "import/no-unresolved": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-empty-function": "off",
  },
  settings:  {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx", ".js"]
    },
    "import/resolver": {}
  },
}
