import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock React hooks for direct function invocation
const mockSetState = vi.fn()
const mockStartTransition = vi.fn((fn: () => void) => fn())
vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useState: (init: unknown) => [init, mockSetState],
    useEffect: vi.fn(),
    useCallback: (fn: unknown) => fn,
    useRef: (init: unknown) => ({ current: init }),
    useTransition: () => [false, mockStartTransition],
    useSyncExternalStore: () => false,
  }
})

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('next/image', () => ({
  default: vi.fn((props: Record<string, unknown>) => ({
    type: 'img',
    props: { src: props.src, alt: props.alt },
  })),
}))

vi.mock('@/app/[lang]/(dashboard)/club/[clubId]/actions', () => ({
  getPresignedUploadUrl: vi.fn(),
  createClubPhoto: vi.fn(),
  deleteClubPhoto: vi.fn(),
}))

vi.mock('@/lib/r2', () => ({
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

import { PhotoGallery } from '@/components/app/club-admin/PhotoGallery'

const translations = {
  title: 'Photos',
  add: 'Add photos',
  delete: 'Delete',
  deleteConfirm: 'Delete this photo?',
  maxReached: 'Maximum {max} photos reached. Remove a photo to add a new one.',
  constraints: 'JPEG, PNG, or WebP — max {sizeMb} MB each — up to {max} photos',
  uploading: 'Uploading…',
  errorType: 'Invalid file type.',
  errorSize: 'File too large. Max {sizeMb} MB.',
  errorUpload: 'Upload failed.',
  setAsMain: 'Set as main',
  isMain: 'Main photo',
}

function makePhotos(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: `photo-${i + 1}`,
    url: `https://example.com/${i + 1}.jpg`,
    alt: `Photo ${i + 1}`,
    position: i,
  }))
}

function render(photos: ReturnType<typeof makePhotos>) {
  return PhotoGallery({ clubId: 'club-1', clubName: 'Test Club', photos, maxPhotos: 10, maxImageSizeBytes: 5 * 1024 * 1024, translations })
}

describe('PhotoGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all photos in the grid', () => {
    const photos = makePhotos(3)
    const result = render(photos)
    const tree = JSON.stringify(result)
    expect(tree).toContain('https://example.com/1.jpg')
    expect(tree).toContain('https://example.com/2.jpg')
    expect(tree).toContain('https://example.com/3.jpg')
  })

  it('shows max photos reached message when 10 photos', () => {
    const photos = makePhotos(10)
    const result = render(photos)
    const tree = JSON.stringify(result)
    expect(tree).toContain('Maximum 10 photos reached')
  })

  it('shows upload button when fewer than 10 photos', () => {
    const photos = makePhotos(3)
    const result = render(photos)
    const tree = JSON.stringify(result)
    expect(tree).toContain('Add photos')
  })

  it('hides upload button when 10 photos', () => {
    const photos = makePhotos(10)
    const result = render(photos)
    const tree = JSON.stringify(result)
    expect(tree).not.toContain('Add photos')
  })

  it('renders a delete button for each photo', () => {
    const photos = makePhotos(4)
    const result = render(photos)
    const tree = JSON.stringify(result)
    // Each photo has a button with aria-label "Delete"
    const deleteMatches = tree.match(/"aria-label":"Delete"/g)
    expect(deleteMatches).toHaveLength(4)
  })
})
