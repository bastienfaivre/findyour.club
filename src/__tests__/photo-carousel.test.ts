import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock React hooks so we can call the component function directly
const mockSetState = vi.fn()
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: (init: unknown) => [init, mockSetState],
    useEffect: vi.fn(),
    useCallback: (fn: unknown) => fn,
    useRef: (init: unknown) => ({ current: init }),
    useSyncExternalStore: () => false,
  }
})
vi.mock('next/image', () => ({
  default: vi.fn((props: Record<string, unknown>) => ({
    type: 'img',
    props: { src: props.src, alt: props.alt },
  })),
}))

import { PhotoCarousel } from '@/components/app/club-profile/PhotoCarousel'

const mockPhotos = [
  { id: 'p1', url: 'https://example.com/1.jpg', alt: 'Photo 1' },
  { id: 'p2', url: 'https://example.com/2.jpg', alt: 'Photo 2' },
  { id: 'p3', url: 'https://example.com/3.jpg', alt: 'Photo 3' },
]

function renderCarousel(photos: typeof mockPhotos) {
  return PhotoCarousel({ photos, ariaLabel: 'Photos', goToPhotoLabel: 'Go to photo {n}' })
}

describe('PhotoCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when photos array is empty', () => {
    const result = renderCarousel([])
    expect(result).toBeNull()
  })

  it('renders a container element for photos', () => {
    const result = renderCarousel(mockPhotos)
    expect(result).not.toBeNull()
    const container = result as { props: { children: unknown[] } }
    expect(container).toBeDefined()
  })

  it('duplicates photos for seamless looping', () => {
    const result = renderCarousel(mockPhotos)
    expect(result).not.toBeNull()
    const tree = JSON.stringify(result)
    // Each photo URL should appear twice (original + duplicate for looping)
    const count1 = (tree.match(/example\.com\/1\.jpg/g) || []).length
    expect(count1).toBe(2)
  })

  it('has carousel role, aria-roledescription, and aria-label', () => {
    const result = renderCarousel(mockPhotos)
    expect(result).not.toBeNull()
    const container = result as { props: Record<string, unknown> }
    expect(container.props.role).toBe('region')
    expect(container.props['aria-roledescription']).toBe('carousel')
    expect(container.props['aria-label']).toBe('Photos')
  })

  it('renders all photo images', () => {
    const result = renderCarousel(mockPhotos)
    const tree = JSON.stringify(result)
    expect(tree).toContain('https://example.com/1.jpg')
    expect(tree).toContain('https://example.com/2.jpg')
    expect(tree).toContain('https://example.com/3.jpg')
  })
})
