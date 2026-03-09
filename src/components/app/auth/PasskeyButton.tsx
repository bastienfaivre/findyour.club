'use client'
import { useState, useTransition } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface PasskeyButtonT {
  authenticating: string
  signInWithPasskey: string
}

export function PasskeyButton({ t }: { t: PasskeyButtonT }) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handlePasskeyLogin() {
    setError(null)

    startTransition(async () => {
      try {
        const beginRes = await fetch('/api/auth/passkey/authenticate/begin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        })
        if (!beginRes.ok) {
          const data = await beginRes.json().catch(() => ({}))
          setError(data.error ?? 'Failed to start passkey authentication.')
          return
        }
        const options = await beginRes.json()
        const authResponse = await startAuthentication({ optionsJSON: options })
        const completeRes = await fetch('/api/auth/passkey/authenticate/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(authResponse),
        })
        const result = await completeRes.json()
        if (!result.success) {
          setError(result.error ?? 'Passkey authentication failed.')
          return
        }
        // Hard navigation so Server Components re-render with the new session cookie.
        // router.push() would use cached renders since fetch-based auth doesn't invalidate the router cache.
        window.location.href = '/'
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Passkey authentication failed.'
        setError(message)
      }
    })
  }

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        variant="outline"
        className="w-full"
        onClick={handlePasskeyLogin}
        disabled={isPending}
      >
        {isPending ? t.authenticating : t.signInWithPasskey}
      </Button>
    </div>
  )
}
