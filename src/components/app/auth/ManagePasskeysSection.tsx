'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { startRegistration } from '@simplewebauthn/browser'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { deletePasskey } from '@/app/auth/passkey/actions'
import type { WebauthnCredential } from '@/generated/prisma/client'

interface ManagePasskeysSectionProps {
  passkeys: Pick<WebauthnCredential, 'credentialId' | 'deviceType' | 'createdAt'>[]
}

export function ManagePasskeysSection({ passkeys }: ManagePasskeysSectionProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleAddPasskey() {
    setError(null)
    setIsAdding(true)
    try {
      const beginRes = await fetch('/api/auth/passkey/register/begin', { method: 'POST' })
      if (!beginRes.ok) {
        const data = await beginRes.json().catch(() => ({}))
        setError(data.error ?? 'Failed to start passkey registration.')
        return
      }
      const options = await beginRes.json()
      const registrationResponse = await startRegistration({ optionsJSON: options })
      const completeRes = await fetch('/api/auth/passkey/register/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationResponse),
      })
      const result = await completeRes.json()
      if (!result.success) {
        setError(result.error ?? 'Failed to complete passkey registration.')
        return
      }
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Passkey registration failed.'
      setError(message)
    } finally {
      setIsAdding(false)
    }
  }

  function handleRemove(credentialId: string) {
    if (!confirm('Are you sure you want to remove this passkey?')) return
    setError(null)

    startTransition(async () => {
      const result = await deletePasskey(credentialId)
      if (!result.success) {
        setError(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {passkeys.length === 0 ? (
        <p className="text-sm text-muted-foreground">No passkeys registered.</p>
      ) : (
        <ul className="space-y-2">
          {passkeys.map(pk => (
            <li key={pk.credentialId} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <span className="text-sm font-medium capitalize">{pk.deviceType ?? 'Passkey'}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  Added {new Date(pk.createdAt).toLocaleDateString()}
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(pk.credentialId)}
                disabled={isPending}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" onClick={handleAddPasskey} disabled={isAdding || isPending}>
        {isAdding ? 'Working…' : 'Add passkey'}
      </Button>
    </div>
  )
}
