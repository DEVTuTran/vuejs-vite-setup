/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "@vue/eslint-config-prettier",
    "plugin:cypress/recommended",
  ],
  overrides: [
    {
      files: [
        "**/__tests__/*.{cy,spec}.{js,ts,jsx,tsx}",
        "cypress/e2e/**.{cy,spec}.{js,ts,jsx,tsx}",
      ],
      extends: ["plugin:cypress/recommended"],
    },
  ],
  rules: {
    "eol-last": ["error", "always"],
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
    "vue/multi-word-component-names": 0,
  },
};
