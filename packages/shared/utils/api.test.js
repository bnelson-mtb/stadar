import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as api from './api.js'

test('API_BASE defaults to same-origin', () => {
  assert.equal(api.API_BASE, '')
})

test('setApiBase updates the live API_BASE binding', () => {
  api.setApiBase('https://example.test')
  assert.equal(api.API_BASE, 'https://example.test')
  api.setApiBase('')
  assert.equal(api.API_BASE, '')
})
