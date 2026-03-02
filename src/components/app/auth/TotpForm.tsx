'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { verifyTotpChallenge } from '@/app/auth/totp/actions'

export function TotpForm() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await verifyTotpChallenge({ code })
      if (result && !result.success) {
        setError(result.error)
        setCode('')
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="code">6-digit authentication code</Label>
        <Input
          id="code"
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          value={code}
          onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="123456"
          required
          disabled={isPending}
          autoComplete="one-time-code"
          autoFocus
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending || code.length !== 6}>
        {isPending ? 'Verifying…' : 'Verify'}
      </Button>
    </form>
  )
}
