import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize an SVG string, stripping scripts, event handlers, and other
 * potentially dangerous content. Returns the cleaned SVG markup.
 */
export function sanitizeSvg(raw: string): string {
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ADD_TAGS: ['use'],
    FORBID_ATTR: ['xlink:href'],
  })
}
