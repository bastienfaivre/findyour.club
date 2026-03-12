/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock React hooks for direct function invocation
const mockSetState = vi.fn()
const mockStartTransition = vi.fn((fn: () => void) => fn())
let formDirty = false
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

vi.mock('@/app/[lang]/(dashboard)/club/[clubId]/actions', () => ({
  saveClubProfile: vi.fn(async () => ({ success: true, data: { savedAt: new Date().toISOString() } })),
  getPresignedUploadUrl: vi.fn(),
  createClubPhoto: vi.fn(),
  deleteClubPhoto: vi.fn(),
  uploadLogo: vi.fn(),
  persistLogo: vi.fn(),
  deleteLogo: vi.fn(),
  updateLogoAlt: vi.fn(),
  togglePublish: vi.fn(),
}))

vi.mock('@/components/app/club-admin/AdminDirtyContext', () => ({
  useAdminDirty: () => ({ setIsDirty: vi.fn() }),
}))

vi.mock('@/hooks/use-unsaved-changes', () => ({
  useUnsavedChanges: () => ({ showDialog: false, confirmNavigation: vi.fn(), cancelNavigation: vi.fn() }),
}))

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }),
}))

vi.mock('@/lib/r2', () => ({
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
}))

// Mock sub-components
vi.mock('@/components/app/club-admin/LogoUpload', () => ({
  LogoUpload: (props: Record<string, unknown>) => ({ type: 'div', props: { 'data-testid': 'logo-upload', ...props } }),
}))

vi.mock('@/components/app/club-admin/PhotoGallery', () => ({
  PhotoGallery: (props: Record<string, unknown>) => ({ type: 'div', props: { 'data-testid': 'photo-gallery', ...props } }),
}))

vi.mock('@/components/app/club-admin/ProfilePreview', () => ({
  ProfilePreview: (props: Record<string, unknown>) => ({ type: 'div', props: { 'data-testid': 'profile-preview', ...props } }),
}))

vi.mock('@/components/app/club-admin/SaveBar', () => ({
  SaveBar: (props: Record<string, unknown>) => ({ type: 'div', props: { 'data-testid': 'save-bar', 'data-dirty': props.isDirty } }),
}))

vi.mock('@/components/app/club-admin/PublishToggle', () => ({
  VisibilityToggle: () => ({ type: 'div', props: { 'data-testid': 'publish-toggle' } }),
}))

vi.mock('@/components/app/club-admin/UnsavedChangesDialog', () => ({
  UnsavedChangesDialog: () => null,
}))

vi.mock('@/components/ui/phone-input', () => ({
  PhoneInput: (props: Record<string, unknown>) => ({
    type: 'input',
    props: { 'data-testid': 'phone-input', value: props.value ?? '', id: props.id },
  }),
}))

vi.mock('@/components/app/admin/AdminPageTitle', () => ({
  AdminPageTitle: (props: Record<string, unknown>) => ({
    type: 'div',
    props: { 'data-testid': 'admin-page-title', title: props.title },
  }),
}))

// Mock react-hook-form to avoid full form lifecycle
const mockRegister = vi.fn((name: string) => ({
  name,
  onChange: vi.fn(),
  onBlur: vi.fn(),
  ref: vi.fn(),
}))

const mockWatch = vi.fn()

vi.mock('react-hook-form', () => ({
  useForm: (opts: Record<string, unknown>) => {
    const defaults = (opts?.defaultValues ?? {}) as Record<string, unknown>
    mockWatch.mockReturnValue(defaults)
    return {
      register: mockRegister,
      formState: { errors: {}, isDirty: formDirty, isValid: true },
      handleSubmit: (onValid: (data: unknown) => void) => (e: { preventDefault?: () => void }) => {
        e?.preventDefault?.()
        onValid(defaults)
      },
      reset: vi.fn(),
      watch: mockWatch,
      control: {},
    }
  },
  Controller: ({ render }: { render: (args: { field: Record<string, unknown> }) => unknown }) =>
    render({ field: { value: '', onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn(), name: 'contactPhone' } }),
}))

vi.mock('@hookform/resolvers/zod', () => ({
  zodResolver: () => vi.fn(),
}))

import { ClubProfileForm } from '@/components/app/club-admin/ClubProfileForm'
import { LogoUpload } from '@/components/app/club-admin/LogoUpload'
import { PhotoGallery } from '@/components/app/club-admin/PhotoGallery'
import { ProfilePreview } from '@/components/app/club-admin/ProfilePreview'
import { SaveBar } from '@/components/app/club-admin/SaveBar'
import { AdminPageTitle } from '@/components/app/admin/AdminPageTitle'

type AnyElement = { type: any; props: Record<string, any>; key: null }

function findInTree(node: unknown, predicate: (n: unknown) => boolean): unknown[] {
  const results: unknown[] = []
  if (node === null || node === undefined || typeof node !== 'object') return results
  if (predicate(node)) results.push(node)
  if (Array.isArray(node)) {
    for (const child of node) results.push(...findInTree(child, predicate))
  } else {
    const el = node as { props?: Record<string, unknown> }
    if (el.props) {
      for (const value of Object.values(el.props)) {
        results.push(...findInTree(value, predicate))
      }
    }
  }
  return results
}

function findText(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (node === null || node === undefined) return ''
  if (Array.isArray(node)) return node.map(findText).join('')
  if (typeof node === 'object') {
    const el = node as { props?: { children?: unknown } }
    if (el.props?.children) return findText(el.props.children)
  }
  return ''
}

const defaultData = {
  name: 'Test Club',
  email: 'test@example.com',
  description: 'A test club',
  schedule: 'Weekends',
  howToJoin: 'Apply online',
  contactPhone: '+41791234567',
  contactAddress: '123 Main St',
  externalWebsiteUrl: 'https://example.com',
  instagramUrl: null,
  facebookUrl: null,
  xUrl: null,
  tiktokUrl: null,
  discordUrl: null,
  youtubeUrl: null,
  whatsappUrl: null,
  telegramUrl: null,
  githubUrl: null,
  logoUrl: null,
  logoAlt: null,
  photos: [],
}

const translations = {
  clubProfile: {
    title: 'Club Profile',
    preview: 'Preview',
    editTab: 'Edit',
    placeholder: 'Placeholder',
    fields: {
      name: 'Club Name',
      description: 'Description',
      schedule: 'Schedule',
      howToJoin: 'How to Join',
      contactEmail: 'Contact Email',
      contactPhone: 'Contact Phone',
      contactAddress: 'Contact Address',
      externalWebsiteUrl: 'Website',
    },
    placeholders: {
      name: 'e.g. Ski Club',
      description: 'Describe…',
      schedule: 'e.g. Tuesdays',
      howToJoin: 'e.g. Email us',
      contactEmail: 'e.g. contact@club.ch',
      contactPhone: '+41…',
      contactAddress: 'e.g. Main St',
      externalWebsiteUrl: 'https://…',
    },
    validation: {
      nameRequired: 'Name is required.',
      emailInvalid: 'Invalid email.',
      descriptionRequired: 'Description required.',
      descriptionMaxLength: 'Too long.',
      scheduleRequired: 'Schedule required.',
      scheduleMaxLength: 'Too long.',
      howToJoinRequired: 'How to join required.',
      howToJoinMaxLength: 'Too long.',
      contactPhoneInvalid: 'Invalid phone.',
      contactAddressMaxLength: 'Too long.',
      externalWebsiteUrlInvalid: 'Invalid URL.',
    },
    logo: {
      title: 'Logo',
      change: 'Change logo',
      remove: 'Remove logo',
      altLabel: 'Alt text',
      altPlaceholder: 'Describe…',
      altRequired: 'Alt text required.',
      uploading: 'Uploading…',
      errorType: 'Invalid type.',
      errorSize: 'Too large.',
      errorUpload: 'Upload failed.',
    },
    photos: {
      title: 'Photos',
      add: 'Add photos',
      delete: 'Delete',
      deleteConfirm: 'Delete this photo?',
      maxReached: 'Max {max} reached.',
      constraints: 'JPEG, PNG, WebP — {sizeMb} MB — {max} max',
      uploading: 'Uploading…',
      errorType: 'Invalid type.',
      errorSize: 'Too large. Max {sizeMb} MB.',
      errorUpload: 'Upload failed.',
    },
  },
  visibility: {
    title: 'Visibility',
    online: 'Live',
    offline: 'Offline',
    onlineSuccess: 'Now live.',
    offlineSuccess: 'Now offline.',
    forceOfflineWarning: 'Taken offline.',
    error: 'Failed.',
  },
  messages: {
    title: 'Messages',
    placeholder: 'Message…',
    send: 'Send',
    you: 'You',
    platform: 'Platform',
    empty: 'No messages',
    unreadBadge: '{count} new',
  },
  settings: {},
  save: {
    save: 'Save',
    discard: 'Discard',
    unsavedChanges: 'Unsaved changes',
    savedSuccessfully: 'Saved',
    discardConfirmTitle: 'Discard changes?',
    discardConfirmDescription: 'All unsaved changes will be lost.',
    leaveConfirmTitle: 'Unsaved changes',
    leaveConfirmDescription: 'You have unsaved changes.',
    stay: 'Stay',
    leave: 'Leave',
    keepEditing: 'Keep editing',
  },
  navigation: 'Admin navigation',
  openMenu: 'Open menu',
  skipToContent: 'Skip to content',
} as any

const clubSiteTranslations = {
  contactCta: 'Contact',
  visitWebsite: 'Visit',
  goToPhoto: 'Go to photo {n}',
  description: 'Who we are & what we do',
  schedule: 'Schedule',
  howToJoin: 'How to Join',
  contactInfo: 'Contact',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  photos: 'Photos',
}

function renderForm(overrides: Partial<typeof defaultData> = {}) {
  return ClubProfileForm({
    clubId: 'club-1',
    translations,
    clubSiteTranslations,
    initialData: { ...defaultData, ...overrides },
    maxPhotos: 10,
    maxImageSizeBytes: 5 * 1024 * 1024,
  })
}

describe('ClubProfileForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    formDirty = false
  })

  it('renders the page title', () => {
    const result = renderForm()
    const found = findInTree(result, (n) => (n as AnyElement).type === AdminPageTitle)
    expect(found.length).toBeGreaterThanOrEqual(1)
    expect((found[0] as AnyElement).props.title).toBe('Club Profile')
  })

  it('renders name input field', () => {
    const result = renderForm()
    const text = findText(result)
    expect(text).toContain('Club Name')
    // Check register was called with 'name'
    expect(mockRegister).toHaveBeenCalledWith('name')
  })

  it('renders contact email input field', () => {
    const result = renderForm()
    const text = findText(result)
    expect(text).toContain('Contact Email')
    expect(mockRegister).toHaveBeenCalledWith('email')
  })

  it('renders the LogoUpload sub-component', () => {
    const result = renderForm()
    const found = findInTree(result, (n) => (n as AnyElement).type === LogoUpload)
    expect(found.length).toBeGreaterThanOrEqual(1)
    expect((found[0] as AnyElement).props.clubId).toBe('club-1')
  })

  it('renders the PhotoGallery sub-component', () => {
    const result = renderForm()
    const found = findInTree(result, (n) => (n as AnyElement).type === PhotoGallery)
    expect(found.length).toBeGreaterThanOrEqual(1)
    expect((found[0] as AnyElement).props.clubId).toBe('club-1')
  })

  it('renders the ProfilePreview sub-component', () => {
    const result = renderForm()
    const found = findInTree(result, (n) => (n as AnyElement).type === ProfilePreview)
    expect(found.length).toBeGreaterThanOrEqual(1)
  })

  it('renders the SaveBar sub-component', () => {
    const result = renderForm()
    const found = findInTree(result, (n) => (n as AnyElement).type === SaveBar)
    expect(found.length).toBeGreaterThanOrEqual(1)
  })

  it('renders description, schedule, howToJoin, address, and website fields', () => {
    renderForm()
    expect(mockRegister).toHaveBeenCalledWith('description')
    expect(mockRegister).toHaveBeenCalledWith('schedule')
    expect(mockRegister).toHaveBeenCalledWith('howToJoin')
    expect(mockRegister).toHaveBeenCalledWith('contactAddress')
    expect(mockRegister).toHaveBeenCalledWith('externalWebsiteUrl')
  })

  it('renders the phone input section', () => {
    const result = renderForm()
    const text = findText(result)
    expect(text).toContain('Contact Phone')
  })

  it('passes initial values as default values to the form', () => {
    renderForm()
    // mockWatch returns the defaultValues passed to useForm
    const watchedValues = mockWatch()
    expect(watchedValues.name).toBe('Test Club')
    expect(watchedValues.email).toBe('test@example.com')
    expect(watchedValues.description).toBe('A test club')
    expect(watchedValues.schedule).toBe('Weekends')
    expect(watchedValues.howToJoin).toBe('Apply online')
    expect(watchedValues.contactPhone).toBe('+41791234567')
    expect(watchedValues.contactAddress).toBe('123 Main St')
    expect(watchedValues.externalWebsiteUrl).toBe('https://example.com')
  })

  it('renders Edit and Preview tabs', () => {
    const result = renderForm()
    const text = findText(result)
    expect(text).toContain('Edit')
    expect(text).toContain('Preview')
  })
})
