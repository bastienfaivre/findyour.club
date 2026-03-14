import { describe, it, expect, vi } from 'vitest'

vi.mock('next/image', () => ({
  default: vi.fn((props: Record<string, unknown>) => ({
    type: 'img',
    props: { src: props.src, alt: props.alt },
  })),
}))
vi.mock('next/link', () => ({
  default: vi.fn(({ children }: { children: unknown }) => children),
}))

import { ProfilePage } from '@/components/app/club-profile/ProfilePage'
import { ProfileSection } from '@/components/app/club-profile/ProfileSection'
import { ContactInfo } from '@/components/app/club-profile/ContactInfo'

const translations = {
  description: 'Who we are & what we do',
  schedule: 'Schedule',
  howToJoin: 'How to join',
  contactInfo: 'Contact information',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  visitWebsite: 'Visit our website',
  photos: 'Photos',
  goToPhoto: 'Go to photo {n}',
  closeLightbox: 'Close',
}

const fullClub = {
  name: 'Test Club',
  logoUrl: 'https://example.com/logo.png',
  logoAlt: 'Test Club logo',
  description: 'A great club',
  schedule: 'Mondays 6pm',
  howToJoin: 'Just show up!',
  email: 'info@test.ch',
  contactPhone: '+41 12 345 67 89',
  contactAddress: '123 Main St\nBern',
  externalWebsiteUrl: 'https://test.ch',
  photos: [
    { id: '1', url: 'https://example.com/1.jpg', alt: 'Photo 1' },
  ],
}

function findInTree(node: unknown, predicate: (n: unknown) => boolean): unknown[] {
  const results: unknown[] = []
  if (node === null || node === undefined) return results
  if (predicate(node)) results.push(node)
  if (typeof node !== 'object') return results
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate))
    return results
  }
  const el = node as { props?: Record<string, unknown> }
  if (el.props) {
    for (const val of Object.values(el.props)) {
      results.push(...findInTree(val, predicate))
    }
  }
  return results
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function findByType(node: unknown, type: string | Function): unknown[] {
  return findInTree(node, (n) => {
    if (n === null || n === undefined || typeof n !== 'object') return false
    const el = n as { type?: unknown }
    return el.type === type || (typeof el.type === 'function' && (el.type as { name?: string }).name === (type as { name?: string }).name)
  })
}

describe('ProfilePage', () => {
  it('renders all sections when data is present', () => {
    const result = ProfilePage({
      club: fullClub,
      translations,
    })

    const sections = findByType(result, ProfileSection)
    // description, Schedule, howToJoin, contactInfo = 4 ProfileSections
    expect(sections.length).toBe(4)
  })

  it('omits schedule section when schedule is null', () => {
    const result = ProfilePage({
      club: { ...fullClub, schedule: null },
      translations,
    })

    const sections = findByType(result, ProfileSection)
    // description + howToJoin + contactInfo = 3
    expect(sections.length).toBe(3)
  })

  it('omits howToJoin section when howToJoin is null', () => {
    const result = ProfilePage({
      club: { ...fullClub, howToJoin: null },
      translations,
    })

    const sections = findByType(result, ProfileSection)
    // description + schedule + contactInfo = 3
    expect(sections.length).toBe(3)
  })

  it('always renders ContactInfo section', () => {
    const result = ProfilePage({
      club: { ...fullClub, schedule: null, howToJoin: null },
      translations,
    })

    const contactInfos = findByType(result, ContactInfo)
    expect(contactInfos.length).toBe(1)
  })

  it('renders with empty photos array', () => {
    const result = ProfilePage({
      club: { ...fullClub, photos: [] },
      translations,
    })

    expect(result).toBeTruthy()
  })
})

describe('ProfileSection', () => {
  it('renders title and children', () => {
    const result = ProfileSection({
      title: 'Test Section',
      children: 'Content here',
    })

    expect(result).not.toBeNull()
    const tree = JSON.stringify(result)
    expect(tree).toContain('Test Section')
    expect(tree).toContain('Content here')
  })

  it('returns null when children is falsy', () => {
    const result = ProfileSection({
      title: 'Empty',
      children: null,
    })

    expect(result).toBeNull()
  })
})

describe('ContactInfo', () => {
  it('renders email as mailto link', () => {
    const result = ContactInfo({
      email: 'info@test.ch',
      translations: { email: 'Email', phone: 'Phone', address: 'Address' },
      websiteLabel: 'Visit website',
    })

    const tree = JSON.stringify(result)
    expect(tree).toContain('mailto:info@test.ch')
    expect(tree).toContain('info@test.ch')
  })

  it('renders phone as tel link when provided', () => {
    const result = ContactInfo({
      email: 'info@test.ch',
      phone: '+41 12 345 67 89',
      translations: { email: 'Email', phone: 'Phone', address: 'Address' },
      websiteLabel: 'Visit website',
    })

    const tree = JSON.stringify(result)
    expect(tree).toContain('tel:+41 12 345 67 89')
  })

  it('does not render phone when null', () => {
    const result = ContactInfo({
      email: 'info@test.ch',
      phone: null,
      translations: { email: 'Email', phone: 'Phone', address: 'Address' },
      websiteLabel: 'Visit website',
    })

    const tree = JSON.stringify(result)
    expect(tree).not.toContain('tel:')
  })

  it('renders address when provided', () => {
    const result = ContactInfo({
      email: 'info@test.ch',
      address: '123 Main St',
      translations: { email: 'Email', phone: 'Phone', address: 'Address' },
      websiteLabel: 'Visit website',
    })

    const tree = JSON.stringify(result)
    expect(tree).toContain('123 Main St')
  })

  it('renders external website link with noopener noreferrer', () => {
    const result = ContactInfo({
      email: 'info@test.ch',
      websiteUrl: 'https://test.ch',
      websiteLabel: 'Visit our website',
      translations: { email: 'Email', phone: 'Phone', address: 'Address' },
    })

    const tree = JSON.stringify(result)
    expect(tree).toContain('https://test.ch')
    expect(tree).toContain('noopener noreferrer')
    expect(tree).toContain('_blank')
    expect(tree).toContain('Visit our website')
  })

  it('does not render website link when websiteUrl is null', () => {
    const result = ContactInfo({
      email: 'info@test.ch',
      websiteUrl: null,
      websiteLabel: 'Visit our website',
      translations: { email: 'Email', phone: 'Phone', address: 'Address' },
    })

    const tree = JSON.stringify(result)
    expect(tree).not.toContain('noopener noreferrer')
  })
})
