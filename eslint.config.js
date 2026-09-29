// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/**', 'node_modules/**', '.expo/**'],
  },
  {
    // react-hooks/immutability: Reanimated SharedValue.value atamaları için
    // false-positive veriyor. Bu kural Reanimated pattern'larını anlamaz.
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
]);
