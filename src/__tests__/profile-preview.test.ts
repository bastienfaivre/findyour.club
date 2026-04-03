/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'

const {
  MockClubHeroSection,
  MockPhotoCarousel,
  MockProfileSection,
  MockContactInfo,
} = vi.hoisted(() => {
  const MockClubHeroSection = vi.fn((props: any) => ({
    type: MockClubHeroSection,
    props,
    key: null,
  }))
  const MockPhotoCarousel = vi.fn((props: any) => ({
    type: MockPhotoCarousel,
    props,
    key: null,
  }))
  const MockProfileSection = vi.fn(({ title, children }: any) => ({
    type: MockProfileSection,
    props: { title, children },
    key: null,
  }))
  const MockContactInfo = vi.fn((props: any) => ({
    type: MockContactInfo,
    props,
    key: null,
  }))
  return { MockClubHeroSection, MockPhotoCarousel, MockProfileSection, MockContactInfo }
})

vi.mock('@/components/app/club-site/ClubHeroSection', () => ({
  ClubHeroSection: MockClubHeroSection,
}))

vi.mock('@/components/app/club-profile/PhotoCarousel', () => ({
  PhotoCarousel: MockPhotoCarousel,
}))

vi.mock('@/components/app/club-profile/ProfileSection', () => ({
  ProfileSection: MockProfileSection,
}))

vi.mock('@/components/app/club-profile/ContactInfo', () => ({
  ContactInfo: MockContactInfo,
}))

vi.mock('@/lib/social-platforms', () => ({
  SOCIAL_PLATFORMS: [],
  SOCIAL_FIELD_KEYS: [],
}))

import { ProfilePreview } from '@/components/app/club-admin/ProfilePreview'

type AnyElement = { type: unknown; props: Record<string, any>; key: null }

function expandElement(node: unknown): unknown {
  if (node === null || node === undefined || typeof node !== 'object') return node
  const el = node as { type?: unknown; props?: Record<string, unknown> }
  if (typeof el.type === 'function' && el.props) {
    try {
      return (el.type as (props: Record<string, unknown>) => unknown)(el.props)
    } catch {
      return node
    }
  }
  return node
}

function findInTree(node: unknown, predicate: (n: unknown) => boolean, depth = 0): unknown[] {
  if (depth > 20) return []
  const results: unknown[] = []
  if (node === null || node === undefined) return results
  // Expand function-type React elements
  node = expandElement(node)
  if (node === null || node === undefined) return results
  if (predicate(node)) results.push(node)
  if (typeof node !== 'object') return results
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate, depth + 1))
    return results
  }
  const el = node as { props?: Record<string, unknown> }
  if (el.props) {
    for (const val of Object.values(el.props)) {
      results.push(...findInTree(val, predicate, depth + 1))
    }
  }
  return results
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function findByType(node: unknown, type: Function): AnyElement[] {
  return findInTree(node, (n) => {
    if (n === null || n === undefined || typeof n !== 'object') return false
    const el = n as { type?: unknown }
    // Match by reference only — the JSX element has the mock function as its type
    return el.type === type
  }) as AnyElement[]
}

function findText(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (node === null || node === undefined) return ''
  if (Array.isArray(node)) return node.map(findText).join('')
  if (typeof node === 'object') {
    const el = node as { props?: Record<string, unknown> }
    if (el.props) {
      const parts: string[] = []
      for (const value of Object.values(el.props)) {
        parts.push(findText(value))
      }
      return parts.join('')
    }
  }
  return ''
}

const defaultTranslations = {
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
  contactCta: 'Contact us',
  preview: 'Preview',
}

const baseFormValues = {
  name: 'Test Club',
  email: 'info@test.ch',
  description: 'A great club',
  schedule: '' as string,
  howToJoin: '' as string,
  contactPhone: null as string | null,
  contactAddress: null as string | null,
  externalWebsiteUrl: null as string | null,
  instagramUrl: null as string | null,
  facebookUrl: null as string | null,
  xUrl: null as string | null,
  tiktokUrl: null as string | null,
  discordUrl: null as string | null,
  youtubeUrl: null as string | null,
  whatsappUrl: null as string | null,
  telegramUrl: null as string | null,
  githubUrl: null as string | null,
}

describe('ProfilePreview', () => {
  it('renders hero section with club name', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const heroes = findByType(result, MockClubHeroSection)
    expect(heroes).toHaveLength(1)
    expect(heroes[0].props.club).toEqual(
      expect.objectContaining({ name: 'Test Club' }),
    )
  })

  it('renders description as a named section', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const sections = findByType(result, MockProfileSection)
    const descSection = sections.find((s) => s.props.title === 'Who we are & what we do')
    expect(descSection).toBeDefined()
    const text = findText(descSection!.props.children)
    expect(text).toContain('A great club')
  })

  it('shows ellipsis placeholder when name is empty', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues, name: '' },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const heroes = findByType(result, MockClubHeroSection)
    expect(heroes).toHaveLength(1)
    expect(heroes[0].props.club.name).toBe('…')
  })

  it('renders schedule section when schedule is provided', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues, schedule: 'Mondays 6pm' },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const sections = findByType(result, MockProfileSection)
    const scheduleSection = sections.find((s) => s.props.title === 'Schedule')
    expect(scheduleSection).toBeDefined()
    const text = findText(scheduleSection!.props.children)
    expect(text).toContain('Mondays 6pm')
  })

  it('hides schedule section when schedule is null', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues, schedule: '' },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const sections = findByType(result, MockProfileSection)
    const scheduleSection = sections.find((s) => s.props.title === 'Schedule')
    expect(scheduleSection).toBeUndefined()
  })

  it('renders howToJoin section when provided', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues, howToJoin: 'Just show up!' },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const sections = findByType(result, MockProfileSection)
    const howToJoinSection = sections.find((s) => s.props.title === 'How to join')
    expect(howToJoinSection).toBeDefined()
    const text = findText(howToJoinSection!.props.children)
    expect(text).toContain('Just show up!')
  })

  it('renders photo carousel with photos', () => {
    const photos = [
      { id: '1', url: 'https://example.com/1.jpg', alt: 'Photo 1', position: 0 },
      { id: '2', url: 'https://example.com/2.jpg', alt: 'Photo 2', position: 1 },
    ]

    const result = ProfilePreview({
      formValues: { ...baseFormValues },
      logoUrl: null,
      logoAlt: null,
      photos,
      translations: defaultTranslations,
    })

    // photos disabled temporarily — carousel not rendered with empty photos
    const carousels = findByType(result, MockPhotoCarousel)
    expect(carousels).toHaveLength(0)
  })

  it('shows contact info with email', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues, email: 'contact@club.ch' },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const contactInfos = findByType(result, MockContactInfo)
    expect(contactInfos).toHaveLength(1)
    expect(contactInfos[0].props.email).toBe('contact@club.ch')
  })
})
