import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // Shared code runs in the browser, in React Native and in Node, so only
      // globals that exist in all of them are allowed. Reach browser-only
      // things (localStorage, window) through globalThis and guard them.
      globals: globals['shared-node-browser'],
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    // Tests and this config only ever run in Node.
    files: ['**/*.test.js', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
])
