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
vi.mock('lucide-react', () => ({
  ChevronLeft: () => ({ type: 'ChevronLeft', props: {}, key: null }),
  ChevronRight: () => ({ type: 'ChevronRight', props: {}, key: null }),
  X: () => ({ type: 'X', props: {}, key: null }),
}))
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: unknown }) => ({ type: 'Dialog', props: { children }, key: null }),
  DialogContent: ({ children }: { children: unknown }) => ({ type: 'DialogContent', props: { children }, key: null }),
  DialogTitle: ({ children }: { children: unknown }) => ({ type: 'DialogTitle', props: { children }, key: null }),
}))
vi.mock('radix-ui', () => ({
  VisuallyHidden: { Root: ({ children }: { children: unknown }) => ({ type: 'VisuallyHidden', props: { children }, key: null }) },
}))

import { PhotoCarousel } from '@/components/app/club-profile/PhotoCarousel'

const mockPhotos = [
  { id: 'p1', url: 'https://example.com/1.jpg', alt: 'Photo 1' },
  { id: 'p2', url: 'https://example.com/2.jpg', alt: 'Photo 2' },
  { id: 'p3', url: 'https://example.com/3.jpg', alt: 'Photo 3' },
]

function renderCarousel(photos: typeof mockPhotos) {
  return PhotoCarousel({ photos, ariaLabel: 'Photos', goToPhotoLabel: 'Go to photo {n}', closeLabel: 'Close' })
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

  it('renders photo URLs in the carousel (with peek images for navigation)', () => {
    const result = renderCarousel(mockPhotos)
    expect(result).not.toBeNull()
    const tree = JSON.stringify(result)
    // Each photo URL should appear in the tree (may appear multiple times due to peek images and lightbox)
    expect(tree).toContain('example.com/1.jpg')
    expect(tree).toContain('example.com/2.jpg')
    expect(tree).toContain('example.com/3.jpg')
  })

  it('has carousel role, aria-roledescription, and aria-label in region element', () => {
    const result = renderCarousel(mockPhotos)
    expect(result).not.toBeNull()
    const tree = JSON.stringify(result)
    expect(tree).toContain('"role":"region"')
    expect(tree).toContain('"aria-roledescription":"carousel"')
    expect(tree).toContain('"aria-label":"Photos"')
  })

  it('renders all photo images', () => {
    const result = renderCarousel(mockPhotos)
    const tree = JSON.stringify(result)
    expect(tree).toContain('https://example.com/1.jpg')
    expect(tree).toContain('https://example.com/2.jpg')
    expect(tree).toContain('https://example.com/3.jpg')
  })
})
