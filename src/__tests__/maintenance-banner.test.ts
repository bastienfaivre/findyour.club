import { describe, it, expect } from 'vitest'
import { splitLinks } from '@/components/app/MaintenanceBanner'

describe('MaintenanceBanner splitLinks', () => {
  it('returns plain text when there is no URL', () => {
    expect(splitLinks('Scheduled maintenance tonight.')).toEqual([
      { type: 'text', value: 'Scheduled maintenance tonight.' },
    ])
  })

  it('extracts a URL in the middle of the message', () => {
    expect(splitLinks('See https://findyour.club/status for details')).toEqual([
      { type: 'text', value: 'See ' },
      { type: 'link', value: 'https://findyour.club/status' },
      { type: 'text', value: ' for details' },
    ])
  })

  it('excludes trailing punctuation from the URL', () => {
    expect(splitLinks('More info (https://example.com/a?b=1).')).toEqual([
      { type: 'text', value: 'More info (' },
      { type: 'link', value: 'https://example.com/a?b=1' },
      { type: 'text', value: ').' },
    ])
  })

  it('handles multiple URLs and a URL at the start', () => {
    expect(splitLinks('http://a.com and https://b.com')).toEqual([
      { type: 'link', value: 'http://a.com' },
      { type: 'text', value: ' and ' },
      { type: 'link', value: 'https://b.com' },
    ])
  })

  it('does not link non-http schemes', () => {
    expect(splitLinks('javascript:alert(1)')).toEqual([
      { type: 'text', value: 'javascript:alert(1)' },
    ])
  })
})
