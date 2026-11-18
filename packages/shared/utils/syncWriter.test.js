import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createSyncWriter } from './syncWriter.js'
import { createTestClock, deferred } from './testClock.js'

// A persist() whose requests stay open until the test answers them.
function heldPersist() {
  const calls = []
  return {
    calls,
    persist(value) {
      const call = { value, ...deferred() }
      calls.push(call)
      return call.promise
    },
  }
}

test('writes never overlap, and values queued behind one collapse to the newest', async () => {
  const clock = createTestClock()
  const { calls, persist } = heldPersist()
  const confirmed = []
  const writer = createSyncWriter({ persist, onConfirmed: v => confirmed.push(v), ...clock })

  writer.write(['a'])
  writer.write(['a', 'b'])
  writer.write(['a', 'b', 'c'])
  await clock.settle()
  assert.deepEqual(calls.map(c => c.value), [['a']], 'only the first write is in flight')

  calls[0].resolve({ ok: true })
  await clock.settle()
  assert.deepEqual(calls.map(c => c.value), [['a'], ['a', 'b', 'c']], 'the middle value was never sent')

  calls[1].resolve({ ok: true })
  await clock.settle()
  assert.deepEqual(confirmed, [['a'], ['a', 'b', 'c']])
  assert.equal(writer.isBusy(), false)
})

test('a delayed write waits for a pause, so a burst of edits is one request', async () => {
  const clock = createTestClock()
  const { calls, persist } = heldPersist()
  const writer = createSyncWriter({ persist, ...clock })

  for (const text of ['h', 'he', 'hel', 'hell', 'hello']) {
    writer.write(text, { delayMs: 800 })
    await clock.advance(100)
  }
  assert.equal(calls.length, 0, 'still typing')

  await clock.advance(800)
  assert.deepEqual(calls.map(c => c.value), ['hello'])
})

test('flush sends a waiting value immediately', async () => {
  const clock = createTestClock()
  const { calls, persist } = heldPersist()
  const writer = createSyncWriter({ persist, ...clock })

  writer.write('note', { delayMs: 800 })
  writer.flush()
  await clock.settle()
  assert.deepEqual(calls.map(c => c.value), ['note'])
})

test('a failed write is retried, then reported once the retries run out', async () => {
  const clock = createTestClock()
  let attempts = 0
  const failed = []
  const writer = createSyncWriter({
    persist: async () => { attempts += 1; return { ok: false, status: 500 } },
    onFailed: (value, result) => failed.push({ value, status: result.status }),
    retryDelaysMs: [1500, 4000],
    ...clock,
  })

  writer.write(['a'])
  await clock.advance(1499)
  assert.equal(attempts, 1)
  await clock.advance(1)
  assert.equal(attempts, 2)
  await clock.advance(4000)
  assert.equal(attempts, 3)
  assert.deepEqual(failed, [{ value: ['a'], status: 500 }])
  assert.equal(writer.isBusy(), false)
})

test('a retry that succeeds is confirmed and nothing is reported as failed', async () => {
  const clock = createTestClock()
  const results = [{ ok: false, status: 503 }, { ok: true }]
  const confirmed = []
  const failed = []
  const writer = createSyncWriter({
    persist: async () => results.shift(),
    onConfirmed: v => confirmed.push(v),
    onFailed: v => failed.push(v),
    retryDelaysMs: [1500],
    ...clock,
  })

  writer.write(['a'])
  await clock.advance(1500)
  assert.deepEqual(confirmed, [['a']])
  assert.deepEqual(failed, [])
})

test('401 is not retried', async () => {
  const clock = createTestClock()
  let attempts = 0
  const failed = []
  const writer = createSyncWriter({
    persist: async () => { attempts += 1; return { ok: false, status: 401 } },
    onFailed: (_value, result) => failed.push(result.status),
    retryDelaysMs: [1500, 4000],
    ...clock,
  })

  writer.write(['a'])
  await clock.advance(10000)
  assert.equal(attempts, 1)
  assert.deepEqual(failed, [401])
})

test('a newer value supersedes a failed one instead of the failure being reported', async () => {
  const clock = createTestClock()
  const { calls, persist } = heldPersist()
  const confirmed = []
  const failed = []
  const writer = createSyncWriter({
    persist,
    onConfirmed: v => confirmed.push(v),
    onFailed: v => failed.push(v),
    retryDelaysMs: [1500],
    ...clock,
  })

  writer.write(['a'])
  await clock.settle()
  writer.write(['a', 'b'])
  calls[0].resolve({ ok: false, status: 500 })
  await clock.settle()
  calls[1].resolve({ ok: true })
  await clock.settle()

  assert.deepEqual(calls.map(c => c.value), [['a'], ['a', 'b']])
  assert.deepEqual(confirmed, [['a', 'b']])
  assert.deepEqual(failed, [])
})

test('a write made while waiting to retry goes out at once in place of the retry', async () => {
  const clock = createTestClock()
  const sent = []
  const writer = createSyncWriter({
    persist: async value => { sent.push(value); return { ok: sent.length > 1 } },
    retryDelaysMs: [1500],
    ...clock,
  })

  writer.write(['a'])
  await clock.advance(500)
  writer.write(['a', 'b'])
  await clock.advance(5000)
  assert.deepEqual(sent, [['a'], ['a', 'b']])
})

test('whenIdle resolves only after everything queued has been sent', async () => {
  const clock = createTestClock()
  const { calls, persist } = heldPersist()
  const writer = createSyncWriter({ persist, ...clock })
  let idle = false

  writer.write(['a'])
  writer.write(['a', 'b'])
  writer.whenIdle().then(() => { idle = true })
  await clock.settle()
  calls[0].resolve({ ok: true })
  await clock.settle()
  assert.equal(idle, false, 'second write still in flight')
  calls[1].resolve({ ok: true })
  await clock.settle()
  assert.equal(idle, true)
})

test('cancel drops unsent values and ignores the result of the write in flight', async () => {
  const clock = createTestClock()
  const { calls, persist } = heldPersist()
  const confirmed = []
  const writer = createSyncWriter({ persist, onConfirmed: v => confirmed.push(v), ...clock })

  writer.write(['a'])
  writer.write(['a', 'b'])
  await clock.settle()
  writer.cancel()
  calls[0].resolve({ ok: true })
  await clock.advance(5000)

  assert.equal(calls.length, 1)
  assert.deepEqual(confirmed, [])
})
