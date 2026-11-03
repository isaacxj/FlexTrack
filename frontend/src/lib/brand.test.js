// The fork's name (lib/brand.js). The rest of the suite runs as openGym (VITE_APP_NAME in
// vite.config.js); here it is FlexTrack, the way every build ships.
import { afterEach, describe, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

async function load(name) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_NAME', name)   // '' is what a build without the variable sees
  return { ...(await import('./brand.js')), ...(await import('./i18n-core.js')) }
}

describe('app name', () => {
  it('every translated string says FlexTrack, placeholders filled first', async () => {
    const { APP_NAME, t } = await load('')
    expect(APP_NAME).toBe('FlexTrack')
    expect(t('Reload openGym')).toBe('Reload FlexTrack')
    expect(t('Update to openGym v{0}', '1.5.0')).toBe('Update to FlexTrack v1.5.0')
    expect(t('Check for updates')).toBe('Check for updates')
  })

  it('run as openGym, nothing changes', async () => {
    const { t } = await load('openGym')
    expect(t('Reload openGym')).toBe('Reload openGym')
  })
})
