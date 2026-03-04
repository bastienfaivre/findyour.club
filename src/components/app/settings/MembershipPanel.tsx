'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { InviteEditorResult } from '@/app/(country)/[country]/[club]/settings/actions'

interface Membership {
  id: string
  role: 'OWNER' | 'EDITOR'
  status: 'ACTIVE' | 'PENDING' | 'REVOKED'
  user: {
    email: string | null
    name: string | null
  }
}

interface MembershipPanelProps {
  memberships: Membership[]
  inviteAction: (_prevState: InviteEditorResult | null, formData: FormData) => Promise<InviteEditorResult>
}

export function MembershipPanel({ memberships, inviteAction }: MembershipPanelProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [lastInvitedEmail, setLastInvitedEmail] = useState('')
  const [result, setResult] = useState<InviteEditorResult | null>(null)
  const [isPending, startTransition] = useTransition()

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
                <th className="pb-2 font-medium">Status</th>
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
                  <td className="py-2">
                    {m.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">Active</span>
                    ) : (
                      <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border border-gray-300 text-gray-500">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
