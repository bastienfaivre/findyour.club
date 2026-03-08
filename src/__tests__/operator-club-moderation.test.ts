import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/server/db', () => ({
  prisma: {
    club: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    operatorMessage: {
      create: vi.fn(),
    },
    $transaction: vi.fn(async (ops: unknown[]) => ops),
  },
}))
vi.mock('@/server/auth', () => ({
  getAuthSession: vi.fn(),
}))
vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn(),
}))

import { revalidatePath } from 'next/cache'
import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { sendEmail } from '@/lib/email'
import {
  sendOperatorMessage,
  toggleForceOffline,
  liftForceOffline,
} from '@/app/[lang]/admin/(protected)/clubs/[id]/actions'
import {
  buildOperatorMessageEmailHtml,
  buildForceOfflineEmailHtml,
} from '@/lib/email-templates'

const OPERATOR_SESSION = {
  user: { id: 'op-1', role: 'OPERATOR', totpEnabled: false, totpVerified: true, clubId: null, clubRole: null },
  expires: '2099-01-01',
}

const NON_OPERATOR_SESSION = {
  user: { id: 'u-1', role: 'CLUB_ADMIN', totpEnabled: false, totpVerified: true, clubId: null, clubRole: null },
  expires: '2099-01-01',
}

const CLUB = {
  id: 'club-1',
  name: 'Ski Club Valais',
  email: 'admin@skiclub.ch',
  slug: 'ski-club-valais',
  country: 'ch',
}

describe('sendOperatorMessage()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OPERATOR_SESSION as never)
    vi.mocked(prisma.club.findUnique).mockResolvedValue(CLUB as never)
    vi.mocked(prisma.operatorMessage.create).mockResolvedValue({} as never)
    vi.mocked(sendEmail).mockResolvedValue(undefined)
  })

  it('creates OperatorMessage and sends email (happy path)', async () => {
    const result = await sendOperatorMessage('club-1', 'Please update your description.')

    expect(result).toEqual({ success: true })
    expect(prisma.operatorMessage.create).toHaveBeenCalledWith({
      data: { clubId: 'club-1', message: 'Please update your description.' },
    })
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'admin@skiclub.ch',
      subject: 'Message from the platform about Ski Club Valais',
      html: expect.any(String),
    })
  })

  it('rejects non-operator users', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(NON_OPERATOR_SESSION as never)

    const result = await sendOperatorMessage('club-1', 'Hello')

    expect(result).toEqual({ success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' })
    expect(prisma.operatorMessage.create).not.toHaveBeenCalled()
  })

  it('rejects unauthenticated users', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(null as never)

    const result = await sendOperatorMessage('club-1', 'Hello')

    expect(result).toEqual({ success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' })
  })

  it('rejects empty message', async () => {
    const result = await sendOperatorMessage('club-1', '   ')

    expect(result).toEqual({ success: false, error: 'Message is required.', code: 'VALIDATION' })
    expect(prisma.operatorMessage.create).not.toHaveBeenCalled()
  })

  it('rejects message exceeding 1000 characters', async () => {
    const longMessage = 'a'.repeat(1001)

    const result = await sendOperatorMessage('club-1', longMessage)

    expect(result).toEqual({ success: false, error: 'Message must be 1000 characters or less.', code: 'VALIDATION' })
  })

  it('returns NOT_FOUND when club does not exist', async () => {
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)

    const result = await sendOperatorMessage('nonexistent', 'Hello')

    expect(result).toEqual({ success: false, error: 'Club not found.', code: 'NOT_FOUND' })
  })

  it('still succeeds if email delivery fails (DB is source of truth)', async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error('SMTP error'))

    const result = await sendOperatorMessage('club-1', 'Hello')

    expect(result).toEqual({ success: true })
    expect(prisma.operatorMessage.create).toHaveBeenCalled()
  })
})

describe('toggleForceOffline()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OPERATOR_SESSION as never)
    vi.mocked(prisma.club.findUnique).mockResolvedValue(CLUB as never)
    vi.mocked(prisma.club.update).mockResolvedValue({} as never)
    vi.mocked(prisma.operatorMessage.create).mockResolvedValue({} as never)
    vi.mocked(sendEmail).mockResolvedValue(undefined)
  })

  it('sets forceOffline=true, creates message in transaction, sends email, revalidates (happy path)', async () => {
    const result = await toggleForceOffline('club-1', 'Inappropriate content')

    expect(result).toEqual({ success: true })
    expect(prisma.$transaction).toHaveBeenCalledWith([
      expect.anything(),
      expect.anything(),
    ])
    expect(sendEmail).toHaveBeenCalledWith({
      to: 'admin@skiclub.ch',
      subject: 'Your club page has been taken offline — Ski Club Valais',
      html: expect.any(String),
    })
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('rejects non-operator users', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(NON_OPERATOR_SESSION as never)

    const result = await toggleForceOffline('club-1', 'Reason')

    expect(result).toEqual({ success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' })
  })

  it('rejects empty reason', async () => {
    const result = await toggleForceOffline('club-1', '')

    expect(result).toEqual({ success: false, error: 'A reason is required.', code: 'VALIDATION' })
  })

  it('returns NOT_FOUND when club does not exist', async () => {
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)

    const result = await toggleForceOffline('nonexistent', 'Reason')

    expect(result).toEqual({ success: false, error: 'Club not found.', code: 'NOT_FOUND' })
  })

  it('still succeeds if email delivery fails', async () => {
    vi.mocked(sendEmail).mockRejectedValue(new Error('SMTP error'))

    const result = await toggleForceOffline('club-1', 'Reason')

    expect(result).toEqual({ success: true })
    expect(prisma.$transaction).toHaveBeenCalled()
  })
})

describe('liftForceOffline()', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getAuthSession).mockResolvedValue(OPERATOR_SESSION as never)
    vi.mocked(prisma.club.findUnique).mockResolvedValue(CLUB as never)
    vi.mocked(prisma.club.update).mockResolvedValue({} as never)
  })

  it('sets forceOffline=false and revalidates (happy path)', async () => {
    const result = await liftForceOffline('club-1')

    expect(result).toEqual({ success: true })
    expect(prisma.club.update).toHaveBeenCalledWith({
      where: { id: 'club-1' },
      data: { forceOffline: false },
    })
    expect(revalidatePath).toHaveBeenCalled()
  })

  it('rejects non-operator users', async () => {
    vi.mocked(getAuthSession).mockResolvedValue(NON_OPERATOR_SESSION as never)

    const result = await liftForceOffline('club-1')

    expect(result).toEqual({ success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' })
  })

  it('returns NOT_FOUND when club does not exist', async () => {
    vi.mocked(prisma.club.findUnique).mockResolvedValue(null)

    const result = await liftForceOffline('nonexistent')

    expect(result).toEqual({ success: false, error: 'Club not found.', code: 'NOT_FOUND' })
  })
})

describe('Email template rendering', () => {
  it('buildOperatorMessageEmailHtml produces valid HTML with escaped content', () => {
    const html = buildOperatorMessageEmailHtml({
      clubName: 'Test <Club> & "Friends"',
      message: 'Please fix <script>alert("xss")</script>',
    })

    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Test &lt;Club&gt; &amp; &quot;Friends&quot;')
    expect(html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;')
    expect(html).not.toContain('<script>')
  })

  it('buildForceOfflineEmailHtml produces valid HTML with escaped content', () => {
    const html = buildForceOfflineEmailHtml({
      clubName: 'Club <Test>',
      reason: 'Content violates <rules> & "guidelines"',
    })

    expect(html).toContain('<!DOCTYPE html>')
    expect(html).toContain('Club &lt;Test&gt;')
    expect(html).toContain('&lt;rules&gt; &amp; &quot;guidelines&quot;')
    expect(html).toContain('taken offline')
    expect(html).not.toContain('<rules>')
  })
})
