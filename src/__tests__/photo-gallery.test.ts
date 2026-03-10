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
  maxReached: 'Maximum 10 photos reached. Remove a photo to add a new one.',
  minRequired: '{count}/{min} photos — add at least {min} to publish.',
  constraints: 'JPEG, PNG, or WebP — max 5 MB each — up to 10 photos',
  uploading: 'Uploading…',
  errorType: 'Invalid file type.',
  errorSize: 'File too large.',
  errorUpload: 'Upload failed.',
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
  return PhotoGallery({ clubId: 'club-1', clubName: 'Test Club', photos, translations })
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

  it('shows photo count in min-photos hint when < 5 photos', () => {
    const photos = makePhotos(3)
    const result = render(photos)
    const tree = JSON.stringify(result)
    // minRequired template: '{count}/{min} photos — add at least {min} to publish.'
    // With 3 photos it becomes: '3/5 photos — add at least 5 to publish.'
    expect(tree).toContain('3/5 photos')
  })

  it('shows min photos hint when fewer than 5 photos', () => {
    const photos = makePhotos(2)
    const result = render(photos)
    const tree = JSON.stringify(result)
    expect(tree).toContain('2/5 photos')
    expect(tree).toContain('add at least 5 to publish')
  })

  it('does not show min photos hint when >= 5 photos', () => {
    const photos = makePhotos(5)
    const result = render(photos)
    const tree = JSON.stringify(result)
    expect(tree).not.toContain('add at least 5 to publish')
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
