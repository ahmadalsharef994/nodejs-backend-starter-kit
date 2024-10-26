const globals = require('globals');

module.exports = [
  {
    languageOptions: {
      ecmaVersion: 2018,
      globals: {
        ...globals.node,
        ...globals.jest,
        ...globals.amd,
      },
    },
    plugins: {
      prettier: require('eslint-plugin-prettier'),
      security: require('eslint-plugin-security'),
      jest: require('eslint-plugin-jest'),
    },
    rules: {
      'no-console': 'error',
      'func-names': 'off',
      'no-underscore-dangle': 'off',
      'consistent-return': 'off',
      'jest/expect-expect': 'off',
      'security/detect-object-injection': 'off',
      'import/extensions': 'off',
      'prefer-destructuring': ['error', { object: false, array: false }],
    },
  },
];
