/** @type {import('@types/eslint').Linter.BaseConfig} */
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    '@remix-run/eslint-config/jest-testing-library',
    'plugin:prettier/recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['react', '@typescript-eslint', 'prettier'],
  // we're using vitest which has a very similar API to jest
  // (so the linting plugins work nicely), but it means we have to explicitly
  // set the jest version.

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  settings: {
    jest: {
      version: 28,
    },
  },
  rules: {
    '@typescript-eslint/no-explicit-any': ['error'],
    curly: ['error'],
    'no-else-return': [
      'error',
      {
        allowElseIf: false,
      },
    ],
    'no-console': ['warn'],
    'prefer-destructuring': [
      'error',
      {
        object: true,
        array: false,
      },
    ],
    'react/destructuring-assignment': ['error', 'always'],
    'react/react-in-jsx-scope': ['off'],
    'react/display-name': ['off'],
    '@typescript-eslint/no-empty-function': ['off'],
  },
}
