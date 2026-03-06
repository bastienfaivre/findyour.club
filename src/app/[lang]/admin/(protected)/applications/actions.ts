'use server'

import { prisma } from '@/server/db'
import { getAuthSession } from '@/server/auth'
import { slugRegex } from '@/lib/schemas/application'

export type ApplicationActionResult =
  | { success: true }
  | { success: false; error: string; code: 'NOT_FOUND' | 'ALREADY_REVIEWED' | 'UNAUTHORIZED' | 'SLUG_REQUIRED' | 'SLUG_INVALID' | 'SLUG_CONFLICT' | 'SERVER_ERROR' }

export async function approveApplication(applicationId: string, slug: string): Promise<ApplicationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const trimmedSlug = slug.trim()
    if (!trimmedSlug) {
      return { success: false, error: 'A URL slug is required.', code: 'SLUG_REQUIRED' }
    }
    if (!slugRegex.test(trimmedSlug)) {
      return { success: false, error: 'Only lowercase letters, numbers, and hyphens allowed.', code: 'SLUG_INVALID' }
    }

    // Fetch the application to get its country for slug conflict check
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { id: true, status: true, country: true },
    })

    if (!application) {
      return { success: false, error: 'Application not found.', code: 'NOT_FOUND' }
    }
    if (application.status !== 'PENDING') {
      return { success: false, error: 'Application already reviewed.', code: 'ALREADY_REVIEWED' }
    }

    // Slug conflict check + approval in a serializable transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      const [clubConflict, appConflict] = await Promise.all([
        tx.club.findUnique({
          where: { slug_country: { slug: trimmedSlug, country: application.country } },
          select: { id: true },
        }),
        tx.application.findFirst({
          where: {
            desiredSlug: trimmedSlug,
            country: application.country,
            status: 'APPROVED',
            id: { not: applicationId },
          },
          select: { id: true },
        }),
      ])

      if (clubConflict || appConflict) {
        return 'SLUG_CONFLICT' as const
      }

      const updated = await tx.application.updateMany({
        where: { id: applicationId, status: 'PENDING' },
        data: { status: 'APPROVED', reviewedAt: new Date(), desiredSlug: trimmedSlug },
      })

      return updated.count === 0 ? 'ALREADY_REVIEWED' as const : 'SUCCESS' as const
    })

    if (result === 'SLUG_CONFLICT') {
      return { success: false, error: 'This slug is already taken.', code: 'SLUG_CONFLICT' }
    }
    if (result === 'ALREADY_REVIEWED') {
      return { success: false, error: 'Application already reviewed.', code: 'ALREADY_REVIEWED' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}

export async function rejectApplication(applicationId: string, reason?: string): Promise<ApplicationActionResult> {
  try {
    const session = await getAuthSession()
    if (!session?.user || session.user.role !== 'OPERATOR') {
      return { success: false, error: 'Unauthorized.', code: 'UNAUTHORIZED' }
    }

    const result = await prisma.application.updateMany({
      where: { id: applicationId, status: 'PENDING' },
      data: {
        status: 'REJECTED',
        rejectionReason: reason || null,
        reviewedAt: new Date(),
      },
    })

    if (result.count === 0) {
      const exists = await prisma.application.findUnique({
        where: { id: applicationId },
        select: { id: true },
      })
      return exists
        ? { success: false, error: 'Application already reviewed.', code: 'ALREADY_REVIEWED' }
        : { success: false, error: 'Application not found.', code: 'NOT_FOUND' }
    }

    return { success: true }
  } catch {
    return { success: false, error: 'An unexpected error occurred.', code: 'SERVER_ERROR' }
  }
}
