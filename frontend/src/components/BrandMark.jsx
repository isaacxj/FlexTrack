import { MARK_SVG } from '../lib/brand-mark.js'

// The FlexTrack heart at the top of the sign-in and phone welcome screens, in the accent colour.
// The markup is the fixed string from lib/brand-mark.js, nothing user-supplied.
const HTML = MARK_SVG('', 'currentColor')

export default function BrandMark() {
  return <span aria-hidden="true" style={{ display: 'inline-flex', width: '1.35em' }} dangerouslySetInnerHTML={{ __html: HTML }} />
}
