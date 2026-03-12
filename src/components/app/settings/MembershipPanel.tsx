'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRightLeft, UserMinus, Check, X, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { InviteEditorResult, TransferOwnershipResult, RevokeAccessResult, CancelInviteResult } from '@/app/[lang]/(dashboard)/club/[clubId]/settings/actions'
import type { Translations } from '@/lib/i18n/translations'

type MembershipPanelT = Translations['club']['membership']

interface Membership {
  id: string
  userId: string
  role: 'OWNER' | 'EDITOR'
  status: 'ACTIVE' | 'PENDING'
  user: {
    email: string | null
    name: string | null
  }
}

interface MembershipPanelProps {
  memberships: Membership[]
  currentUserId: string
  maxEditors: number
  inviteAction: (_prevState: InviteEditorResult | null, formData: FormData) => Promise<InviteEditorResult>
  transferOwnershipAction: (targetId: string) => Promise<TransferOwnershipResult>
  revokeAccessAction: (targetId: string) => Promise<RevokeAccessResult>
  cancelInviteAction: (membershipId: string) => Promise<CancelInviteResult>
  t: MembershipPanelT
}

export function MembershipPanel({ memberships, currentUserId, maxEditors, inviteAction, transferOwnershipAction, revokeAccessAction, cancelInviteAction, t }: MembershipPanelProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isPending, startTransition] = useTransition()
  const [confirmTransferId, setConfirmTransferId] = useState<string | null>(null)
  const [isPendingTransfer, startTransferTransition] = useTransition()
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null)
  const [isPendingRevoke, startRevokeTransition] = useTransition()
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)
  const [isPendingCancel, startCancelTransition] = useTransition()

  const isOwnerViewing = memberships.some(
    m => m.userId === currentUserId && m.role === 'OWNER' && m.status === 'ACTIVE',
  )

  const editorCount = memberships.filter(m => m.role === 'EDITOR').length
  const atEditorLimit = editorCount >= maxEditors

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const invitedEmail = formData.get('email') as string
    startTransition(async () => {
      const res = await inviteAction(null, formData)
      if (res.success) {
        toast.success(t.inviteSent.replace('{email}', invitedEmail))
        setEmail('')
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleRevokeConfirm(targetMembershipId: string) {
    startRevokeTransition(async () => {
      const res = await revokeAccessAction(targetMembershipId)
      setConfirmRevokeId(null)
      if (res.success) {
        toast.success(t.revokeSuccess)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleCancelInvite(targetMembershipId: string) {
    startCancelTransition(async () => {
      const res = await cancelInviteAction(targetMembershipId)
      setConfirmCancelId(null)
      if (res.success) {
        toast.success(t.inviteCancelled)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  function handleTransferConfirm(targetMembershipId: string) {
    startTransferTransition(async () => {
      const res = await transferOwnershipAction(targetMembershipId)
      setConfirmTransferId(null)
      if (res.success) {
        toast.success(t.transferSuccess)
        router.refresh()
      } else {
        toast.error(res.error)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-3">{t.members}</h2>
        {memberships.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t.noMembers}</p>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">{t.email}</th>
                <th className="pb-2 pr-4 font-medium">{t.role}</th>
                <th className="pb-2 pr-4 font-medium">{t.status}</th>
                <th className="pb-2 font-medium">{t.actions}</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{m.user.email ?? '—'}</td>
                  <td className="py-2 pr-4">
                    {m.role === 'OWNER' ? (
                      <Badge>{t.owner}</Badge>
                    ) : (
                      <Badge variant="secondary">{t.editor}</Badge>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {m.status === 'ACTIVE' ? (
                      <Badge variant="success">{t.active}</Badge>
                    ) : (
                      <Badge variant="destructive">{t.pending}</Badge>
                    )}
                  </td>
                  <td className="py-2">
                    {isOwnerViewing && m.status === 'PENDING' && (
                      confirmCancelId === m.id ? (
                        <span className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">{t.cancelInviteConfirm.replace('{email}', m.user.email ?? '—')}</span>
                          <Button
                            size="xs"
                            variant="destructive"
                            disabled={isPendingCancel}
                            onClick={() => handleCancelInvite(m.id)}
                          >
                            <Check className="h-3 w-3" />
                            {t.confirm}
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={isPendingCancel}
                            onClick={() => setConfirmCancelId(null)}
                          >
                            <X className="h-3 w-3" />
                            {t.cancel}
                          </Button>
                        </span>
                      ) : (
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setConfirmCancelId(m.id)}
                        >
                          <X className="h-3 w-3" />
                          {t.cancelInvite}
                        </Button>
                      )
                    )}
                    {isOwnerViewing && m.status === 'ACTIVE' && m.role === 'EDITOR' && (
                      confirmTransferId === m.id ? (
                        <span className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">{t.transferConfirm.replace('{email}', m.user.email ?? '—')}</span>
                          <Button
                            size="xs"
                            variant="destructive"
                            disabled={isPendingTransfer}
                            onClick={() => handleTransferConfirm(m.id)}
                          >
                            <Check className="h-3 w-3" />
                            {t.confirm}
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={isPendingTransfer}
                            onClick={() => setConfirmTransferId(null)}
                          >
                            <X className="h-3 w-3" />
                            {t.cancel}
                          </Button>
                        </span>
                      ) : confirmRevokeId === m.id ? (
                        <span className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">{t.revokeConfirm.replace('{email}', m.user.email ?? '—')}</span>
                          <Button
                            size="xs"
                            variant="destructive"
                            disabled={isPendingRevoke}
                            onClick={() => handleRevokeConfirm(m.id)}
                          >
                            <Check className="h-3 w-3" />
                            {t.confirm}
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={isPendingRevoke}
                            onClick={() => setConfirmRevokeId(null)}
                          >
                            <X className="h-3 w-3" />
                            {t.cancel}
                          </Button>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => { setConfirmRevokeId(null); setConfirmTransferId(m.id) }}
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            {t.transfer}
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => { setConfirmTransferId(null); setConfirmRevokeId(m.id) }}
                          >
                            <UserMinus className="h-3 w-3" />
                            {t.revoke}
                          </Button>
                        </span>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-medium">{t.inviteEditor}</h2>
          <span className="text-xs text-muted-foreground">
            {t.editorCount.replace('{current}', String(editorCount)).replace('{max}', String(maxEditors))}
          </span>
        </div>
        {atEditorLimit ? (
          <p className="text-sm text-muted-foreground">
            {t.editorLimitReached.replace('{max}', String(maxEditors))}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="flex-1 space-y-1">
              <Label htmlFor="invite-email">{t.emailAddress}</Label>
              <Input
                id="invite-email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="editor@example.com"
                required
                disabled={isPending}
              />
            </div>
            <Button type="submit" disabled={isPending || !email}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {isPending ? t.sending : t.inviteAsEditor}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
