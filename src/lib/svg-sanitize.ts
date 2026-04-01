import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize an SVG string, stripping scripts, event handlers, and other
 * potentially dangerous content. Returns the cleaned SVG markup.
 */
export function sanitizeSvg(raw: string): string {
  return DOMPurify.sanitize(raw, {
    USE_PROFILES: { svg: true },
    FORBID_TAGS: ['script', 'style', 'animate', 'animateMotion', 'set', 'filter', 'feImage', 'foreignObject'],
    FORBID_ATTR: ['xlink:href', 'href', 'onload', 'onerror', 'onclick', 'onmouseover'],
  })
}
