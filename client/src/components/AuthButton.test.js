import test from 'node:test'
import assert from 'node:assert/strict'
import { getAuthButtonCopy } from './authButtonCopy.js'

test('anonymous auth control invites users to sign in with Google', () => {
  assert.deepEqual(getAuthButtonCopy('anonymous'), {
    label: 'Sign in with Google',
    title: 'Sign in with Google',
  })
})

test('authenticated auth control keeps a sign-out action', () => {
  assert.deepEqual(getAuthButtonCopy('authenticated'), {
    label: 'Sign out',
    title: 'Sign out',
  })
})
