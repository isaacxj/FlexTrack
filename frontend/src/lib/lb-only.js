// This fork logs every weight in pounds. On by default in every build; VITE_ANY_UNIT=1 brings back
// upstream's kg/lb choice, which is what the test suite runs against (vite.config.js) so upstream's
// own tests keep holding. lb-only.test.js covers the pounds-only path.
export const LB_ONLY = import.meta.env.VITE_ANY_UNIT !== '1'
