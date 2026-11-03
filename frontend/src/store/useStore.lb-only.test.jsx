// @vitest-environment happy-dom
// This fork is pounds only (lib/lb-only.js). The rest of the suite runs with upstream's kg/lb
// choice (VITE_ANY_UNIT in vite.config.js); here the switch is on, the way every build ships.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/lb-only.js', () => ({ LB_ONLY: true }))
vi.mock('../lib/api.js', () => ({ api: vi.fn(), setRemoteAuth: vi.fn() }))
vi.mock('./useUI.js', () => ({ useUI: { getState: () => ({ toast: vi.fn() }) } }))

import { api } from '../lib/api.js'
import { DEF, useStore } from './useStore.js'

const clone = v => JSON.parse(JSON.stringify(v))
const puts = () => api.mock.calls.filter(([, o]) => o?.method === 'PUT').map(([, o]) => JSON.parse(o.body))
const BENCH = '0025'

// A server copy logged in kg: bench at 100 kg, a weigh-in of 80 kg.
const kgCopy = () => ({
  ...clone(DEF), unit: 'kg', _ts: 100,
  routines: [{ id: 'A', name: 'Push', _ts: 100, ex: [{ id: BENCH, sets: 3, reps: 5, weight: 100 }] }],
  workouts: [{ id: 'w1', d: '2026-09-01', start: 1, entries: [{ id: BENCH, sets: [{ w: 100, r: 5, done: true }] }] }],
  bodyweight: [{ d: '2026-09-01', w: 80 }],
})

function serve(state) {
  api.mockImplementation(async (path, opts) => {
    if (opts?.method === 'PUT') return { ok: true, rev: 2 }
    if (opts?.method) return { ok: true }
    if (path.includes('/api/config')) return { invite_only: false, allow_guest: true }
    if (path.includes('/api/me')) return { user: { id: 'user-1', name: 'One' } }
    return { state: { ...state, _rev: 1 }, rev: 1 }
  })
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  localStorage.clear()
  api.mockReset()
  useStore.setState({ S: clone(DEF), user: null, ready: false })
})
afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  useStore.setState({ S: clone(DEF), user: null, ready: false })
})

describe('pounds only', () => {
  it('a new profile starts in lb', () => {
    expect(DEF.unit).toBe('lb')
  })

  it('a profile pulled in kg is converted to lb at boot, every weight with it, and pushed', async () => {
    localStorage.setItem('gym_owner', 'user-1')
    serve(kgCopy())
    await useStore.getState().boot()
    await vi.runAllTimersAsync()

    const { S } = useStore.getState()
    expect(S.unit).toBe('lb')
    expect(S.routines[0].ex[0].weight).toBe(220.5)
    expect(S.workouts[0].entries[0].sets[0].w).toBe(220.5)
    expect(S.bodyweight[0].w).toBe(176.4)
    expect(puts().at(-1)?.state?.unit ?? puts().at(-1)?.unit).toBe('lb')
  })

  it('a profile already in lb is left exactly as it was and pushes nothing', async () => {
    localStorage.setItem('gym_owner', 'user-1')
    const lb = { ...kgCopy(), unit: 'lb' }
    serve(lb)
    await useStore.getState().boot()
    await vi.runAllTimersAsync()

    expect(useStore.getState().S.routines[0].ex[0].weight).toBe(100)
    expect(puts()).toHaveLength(0)
  })
})
