// @vitest-environment happy-dom
// FlexTrack's own look (lib/brand.js): the logo's orange as the accent. The rest of the suite runs
// as openGym (VITE_APP_NAME in vite.config.js); here the name is FlexTrack, the way every build ships.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../lib/brand.js', async orig => ({ ...(await orig()), APP_NAME: 'FlexTrack' }))
vi.mock('../lib/api.js', () => ({ api: vi.fn(), setRemoteAuth: vi.fn() }))
vi.mock('./useUI.js', () => ({ useUI: { getState: () => ({ toast: vi.fn() }) } }))

import { api } from '../lib/api.js'
import { BRAND_ORANGE } from '../lib/brand.js'
import { DEF, useStore } from './useStore.js'

const clone = v => JSON.parse(JSON.stringify(v))
const puts = () => api.mock.calls.filter(([, o]) => o?.method === 'PUT').map(([, o]) => JSON.parse(o.body))

function serve(over) {
  const state = { ...clone(DEF), unit: 'lb', _ts: 100, ...over }
  api.mockImplementation(async (path, opts) => {
    if (opts?.method === 'PUT') return { ok: true, rev: 2 }
    if (opts?.method) return { ok: true }
    if (path.includes('/api/config')) return { invite_only: false, allow_guest: true }
    if (path.includes('/api/me')) return { user: { id: 'user-1', name: 'One' } }
    return { state: { ...state, _rev: 1 }, rev: 1 }
  })
}
async function boot(over) {
  serve(over)
  await useStore.getState().boot()
  await vi.runAllTimersAsync()
  return useStore.getState().S
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  localStorage.clear(); localStorage.setItem('gym_owner', 'user-1')
  api.mockReset()
  useStore.setState({ S: clone(DEF), user: null, ready: false })
})
afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  useStore.setState({ S: clone(DEF), user: null, ready: false })
})

describe('the FlexTrack accent', () => {
  it('a new profile starts in the logo orange', () => {
    expect(DEF.accent).toBe('custom')
    expect(DEF.accentCustom).toBe(BRAND_ORANGE)
  })

  it('a profile on upstream’s default green moves to the orange at boot, and it is pushed', async () => {
    const S = await boot({ accent: 'lime', accentCustom: undefined })
    expect(S.accent).toBe('custom')
    expect(S.accentCustom).toBe(BRAND_ORANGE)
    expect(puts().at(-1)?.state?.accentCustom ?? puts().at(-1)?.accentCustom).toBe(BRAND_ORANGE)
  })

  it('a colour picked in Settings is left alone', async () => {
    expect((await boot({ accent: 'sky', accentCustom: undefined })).accent).toBe('sky')
  })

  it('green picked on purpose, after a colour of one’s own, stays green', async () => {
    const S = await boot({ accent: 'lime', accentCustom: '#123456' })
    expect(S.accent).toBe('lime')
    expect(S.accentCustom).toBe('#123456')
  })
})
