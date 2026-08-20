import test from 'node:test'
import assert from 'node:assert/strict'
import { importPromptBody } from './importPromptCopy.js'

test('pluralizes both collections', () => {
  assert.equal(importPromptBody({ favorites: 3, savedEvents: 2 }),
    'Import your 3 saved teams and 2 saved events into your account?')
})

test('uses singular for a count of one', () => {
  assert.equal(importPromptBody({ favorites: 1, savedEvents: 1 }),
    'Import your 1 saved team and 1 saved event into your account?')
})

test('omits a collection with a zero count', () => {
  assert.equal(importPromptBody({ favorites: 0, savedEvents: 4 }),
    'Import your 4 saved events into your account?')
  assert.equal(importPromptBody({ favorites: 2, savedEvents: 0 }),
    'Import your 2 saved teams into your account?')
})
