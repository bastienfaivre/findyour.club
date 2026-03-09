/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/components/app/club-site/ClubHeroSection', () => ({
  ClubHeroSection: vi.fn(() => null),
}))

vi.mock('@/components/app/club-profile/PhotoCarousel', () => ({
  PhotoCarousel: vi.fn(() => null),
}))

vi.mock('@/components/app/club-profile/ProfileSection', () => ({
  ProfileSection: vi.fn(({ title, children }: any) => ({
    type: 'ProfileSection',
    props: { title, children },
    key: null,
  })),
}))

vi.mock('@/components/app/club-profile/ContactInfo', () => ({
  ContactInfo: vi.fn(() => null),
}))

import { ProfilePreview } from '@/components/app/club-admin/ProfilePreview'
import { ClubHeroSection } from '@/components/app/club-site/ClubHeroSection'
import { PhotoCarousel } from '@/components/app/club-profile/PhotoCarousel'
import { ProfileSection } from '@/components/app/club-profile/ProfileSection'
import { ContactInfo } from '@/components/app/club-profile/ContactInfo'

type AnyElement = { type: unknown; props: Record<string, any>; key: null }

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
  schedule: 'Schedule',
  howToJoin: 'How to join',
  contactInfo: 'Contact information',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  visitWebsite: 'Visit our website',
  photos: 'Photos',
  goToPhoto: 'Go to photo {n}',
  contactCta: 'Contact us',
  preview: 'Preview',
}

const baseFormValues = {
  name: 'Test Club',
  email: 'info@test.ch',
  description: 'A great club',
  schedule: null as string | null,
  howToJoin: null as string | null,
  contactPhone: null as string | null,
  contactAddress: null as string | null,
  externalWebsiteUrl: null as string | null,
}

describe('ProfilePreview', () => {
  it('renders hero section with club name and description', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const heroes = findByType(result, ClubHeroSection)
    expect(heroes).toHaveLength(1)
    expect(heroes[0].props.club).toEqual(
      expect.objectContaining({ name: 'Test Club', description: 'A great club' }),
    )
  })

  it('shows ellipsis placeholder when name is empty', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues, name: '' },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const heroes = findByType(result, ClubHeroSection)
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

    const sections = findByType(result, ProfileSection)
    const scheduleSection = sections.find((s) => s.props.title === 'Schedule')
    expect(scheduleSection).toBeDefined()
    const text = findText(scheduleSection!.props.children)
    expect(text).toContain('Mondays 6pm')
  })

  it('hides schedule section when schedule is null', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues, schedule: null },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const sections = findByType(result, ProfileSection)
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

    const sections = findByType(result, ProfileSection)
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

    const carousels = findByType(result, PhotoCarousel)
    expect(carousels).toHaveLength(1)
    expect(carousels[0].props.photos).toHaveLength(2)
  })

  it('shows contact info with email', () => {
    const result = ProfilePreview({
      formValues: { ...baseFormValues, email: 'contact@club.ch' },
      logoUrl: null,
      logoAlt: null,
      photos: [],
      translations: defaultTranslations,
    })

    const contactInfos = findByType(result, ContactInfo)
    expect(contactInfos).toHaveLength(1)
    expect(contactInfos[0].props.email).toBe('contact@club.ch')
  })
})
