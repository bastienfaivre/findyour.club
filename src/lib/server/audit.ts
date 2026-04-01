import { prisma } from '@/server/db'

/**
 * Append an entry to the audit log. Fire-and-forget — never blocks the caller.
 */
export function logAuditEvent(opts: {
  actorId: string
  action: string
  targetId?: string | null
  oldValue?: unknown
  newValue?: unknown
}) {
  prisma.auditLog
    .create({
      data: {
        actorId: opts.actorId,
        action: opts.action,
        targetId: opts.targetId ?? null,
        oldValue: opts.oldValue !== undefined ? (opts.oldValue as object) : undefined,
        newValue: opts.newValue !== undefined ? (opts.newValue as object) : undefined,
      },
    })
    .catch(() => {
      // Silently ignore — audit logging must never break the user flow
    })
}
