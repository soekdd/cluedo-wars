module.exports = {
  env: {
    browser: true,
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: ["eslint:recommended"],
  ignorePatterns: ["**/public", "**/oldPublic"],
  rules: {
    sourceType: "module",
    "no-multi-spaces": "error",
    "no-extra-semi": "error",
    "no-extra-parens": "error",
    "comma-dangle": ["error", "never"],
    "space-infix-ops": ["error", { int32Hint: false }],
    "no-trailing-spaces": [2, { skipBlankLines: true }],
    "object-curly-spacing": ["error", "always"],
    "space-in-parens": ["error", "always"],
    "array-bracket-spacing": 2,
    "no-prototype-builtins": 0,
  },
};
