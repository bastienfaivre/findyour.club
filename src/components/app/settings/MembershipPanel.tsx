'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { InviteEditorResult, TransferOwnershipResult, RevokeAccessResult } from '@/app/(country)/[country]/[club]/settings/actions'

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
  inviteAction: (_prevState: InviteEditorResult | null, formData: FormData) => Promise<InviteEditorResult>
  transferOwnershipAction: (targetId: string) => Promise<TransferOwnershipResult>
  revokeAccessAction: (targetId: string) => Promise<RevokeAccessResult>
}

export function MembershipPanel({ memberships, currentUserId, inviteAction, transferOwnershipAction, revokeAccessAction }: MembershipPanelProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [lastInvitedEmail, setLastInvitedEmail] = useState('')
  const [result, setResult] = useState<InviteEditorResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const [confirmTransferId, setConfirmTransferId] = useState<string | null>(null)
  const [transferResult, setTransferResult] = useState<TransferOwnershipResult | null>(null)
  const [isPendingTransfer, startTransferTransition] = useTransition()
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null)
  const [revokeResult, setRevokeResult] = useState<RevokeAccessResult | null>(null)
  const [isPendingRevoke, startRevokeTransition] = useTransition()

  const isOwnerViewing = memberships.some(
    m => m.userId === currentUserId && m.role === 'OWNER' && m.status === 'ACTIVE',
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)

    const formData = new FormData(e.currentTarget)
    setLastInvitedEmail(formData.get('email') as string)
    startTransition(async () => {
      const res = await inviteAction(null, formData)
      setResult(res)
      if (res.success) {
        setEmail('')
        router.refresh()
      }
    })
  }

  function handleRevokeConfirm(targetMembershipId: string) {
    setRevokeResult(null)
    startRevokeTransition(async () => {
      const res = await revokeAccessAction(targetMembershipId)
      setRevokeResult(res)
      setConfirmRevokeId(null)
      if (res.success) {
        router.refresh()
      }
    })
  }

  function handleTransferConfirm(targetMembershipId: string) {
    setTransferResult(null)
    startTransferTransition(async () => {
      const res = await transferOwnershipAction(targetMembershipId)
      setTransferResult(res)
      setConfirmTransferId(null)
      if (res.success) {
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium mb-3">Members</h2>
        {memberships.length === 0 ? (
          <p className="text-muted-foreground text-sm">No members yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="pb-2 pr-4 font-medium">Email</th>
                <th className="pb-2 pr-4 font-medium">Role</th>
                <th className="pb-2 pr-4 font-medium">Status</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {memberships.map((m) => (
                <tr key={m.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{m.user.email ?? '—'}</td>
                  <td className="py-2 pr-4">
                    {m.role === 'OWNER' ? (
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800">Owner</span>
                    ) : (
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">Editor</span>
                    )}
                  </td>
                  <td className="py-2 pr-4">
                    {m.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">Active</span>
                    ) : (
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border border-gray-300 text-gray-500">Pending</span>
                    )}
                  </td>
                  <td className="py-2">
                    {isOwnerViewing && m.status === 'ACTIVE' && m.role === 'EDITOR' && (
                      confirmTransferId === m.id ? (
                        <span className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Transfer ownership to {m.user.email ?? '—'}? You will become an Editor.</span>
                          <Button
                            size="xs"
                            variant="destructive"
                            disabled={isPendingTransfer}
                            onClick={() => handleTransferConfirm(m.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={isPendingTransfer}
                            onClick={() => setConfirmTransferId(null)}
                          >
                            Cancel
                          </Button>
                        </span>
                      ) : confirmRevokeId === m.id ? (
                        <span className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">Revoke {m.user.email ?? '—'}&apos;s access? They will immediately lose access to the club.</span>
                          <Button
                            size="xs"
                            variant="destructive"
                            disabled={isPendingRevoke}
                            onClick={() => handleRevokeConfirm(m.id)}
                          >
                            Confirm
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            disabled={isPendingRevoke}
                            onClick={() => setConfirmRevokeId(null)}
                          >
                            Cancel
                          </Button>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => { setConfirmRevokeId(null); setRevokeResult(null); setConfirmTransferId(m.id) }}
                          >
                            Transfer
                          </Button>
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => { setConfirmTransferId(null); setTransferResult(null); setRevokeResult(null); setConfirmRevokeId(m.id) }}
                          >
                            Revoke
                          </Button>
                        </span>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {transferResult && (
          <div className="mt-3">
            {transferResult.success ? (
              <Alert>
                <AlertDescription>Ownership transferred successfully.</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>{transferResult.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
        {revokeResult && (
          <div className="mt-3">
            {revokeResult.success ? (
              <Alert>
                <AlertDescription>Access revoked successfully.</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>{revokeResult.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-medium mb-3">Invite an Editor</h2>
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="invite-email">Email address</Label>
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
            {isPending ? 'Sending…' : 'Invite as Editor'}
          </Button>
        </form>

        {result && (
          <div className="mt-3">
            {result.success ? (
              <Alert>
                <AlertDescription>Invitation sent to {lastInvitedEmail}!</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
