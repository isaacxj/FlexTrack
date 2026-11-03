// This fork's name. Every translated string goes through t() (lib/i18n-core.js), which swaps
// upstream's "openGym" for it, so no locale pack needs touching. The test suite sets
// VITE_APP_NAME=openGym (vite.config.js) so upstream's tests keep reading upstream's text.
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'FlexTrack'
export const UPSTREAM_URL = 'https://github.com/DuarteSantos8/openGym'
// Where Settings sends people for the source of what they are running (AGPL §13).
export const SOURCE_URL = APP_NAME === 'openGym' ? UPSTREAM_URL : 'https://github.com/isaacxj/FlexTrack'

export const brand = s => (APP_NAME === 'openGym' || typeof s !== 'string' ? s : s.replaceAll('openGym', APP_NAME))
