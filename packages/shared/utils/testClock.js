// Manual clock for tests of timer-driven code. Not imported by the app.
// advance(ms) runs every timer due in that window, in order, letting pending
// promises settle before and after each one.
import { setImmediate } from 'node:timers'

const settle = () => new Promise(resolve => setImmediate(resolve))

export function createTestClock() {
  let time = 0
  let nextId = 0
  const timers = new Map()

  return {
    now: () => time,
    setTimer(fn, ms) {
      nextId += 1
      timers.set(nextId, { at: time + ms, fn })
      return nextId
    },
    clearTimer(id) {
      timers.delete(id)
    },
    settle,
    async advance(ms) {
      const end = time + ms
      for (;;) {
        await settle()
        const due = [...timers.entries()]
          .filter(([, timer]) => timer.at <= end)
          .sort((a, b) => a[1].at - b[1].at)[0]
        if (!due) break
        timers.delete(due[0])
        time = due[1].at
        due[1].fn()
      }
      time = end
      await settle()
    },
  }
}

// A promise plus its resolve, for holding a fake request open.
export function deferred() {
  let resolve
  const promise = new Promise(r => { resolve = r })
  return { promise, resolve }
}
