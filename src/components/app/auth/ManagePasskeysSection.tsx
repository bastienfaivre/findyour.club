'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { startRegistration } from '@simplewebauthn/browser'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { deletePasskey } from '@/app/[lang]/(dashboard)/account/passkey/actions'
import type { WebauthnCredential } from '@/generated/prisma/client'

interface ManagePasskeysSectionT {
  noPasskeys: string
  /** Use {date} as placeholder for the formatted date */
  passkeyAdded: string
  remove: string
  working: string
  addPasskey: string
  passkeyConfirmRemove: string
  passkeyDefaultName: string
  passkeyStartFailed: string
  passkeyCompleteFailed: string
  passkeyRegistrationFailed: string
}

interface ManagePasskeysSectionProps {
  passkeys: Pick<WebauthnCredential, 'credentialId' | 'deviceType' | 'createdAt'>[]
  lang: string
  t: ManagePasskeysSectionT
}

export function ManagePasskeysSection({ passkeys, lang, t }: ManagePasskeysSectionProps) {
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
        setError(data.error ?? t.passkeyStartFailed)
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
        setError(result.error ?? t.passkeyCompleteFailed)
        return
      }
      router.refresh()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.passkeyRegistrationFailed
      setError(message)
    } finally {
      setIsAdding(false)
    }
  }

  function handleRemove(credentialId: string) {
    if (!confirm(t.passkeyConfirmRemove)) return
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
        <p className="text-sm text-muted-foreground">{t.noPasskeys}</p>
      ) : (
        <ul className="space-y-2">
          {passkeys.map(pk => (
            <li key={pk.credentialId} className="flex items-center justify-between rounded-md border px-3 py-2">
              <div>
                <span className="text-sm font-medium capitalize">{pk.deviceType ?? t.passkeyDefaultName}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {t.passkeyAdded.replace('{date}', new Date(pk.createdAt).toLocaleDateString(lang))}
                </span>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemove(pk.credentialId)}
                disabled={isPending}
              >
                {t.remove}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button variant="outline" onClick={handleAddPasskey} disabled={isAdding || isPending}>
        {isAdding ? t.working : t.addPasskey}
      </Button>
    </div>
  )
}
