// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const globals = require('globals')
const expoConfig = require('eslint-config-expo/flat')

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*', 'android/*', 'ios/*', '.expo/*'],
  },
  {
    // Shared files use JSON import attributes, which eslint-plugin-import's
    // parser can't read (they are linted in packages/shared instead), so its
    // cross-file namespace check is off.
    rules: { 'import/namespace': 'off' },
  },
  {
    files: ['**/*.test.js', '*.config.js'],
    languageOptions: { globals: globals.node },
  },
])
