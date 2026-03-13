'use client'
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { requestPasswordReset } from './actions'

interface ForgotPasswordFormT {
  email: string
  sendLink: string
  sending: string
  successMessage: string
  backToLogin: string
}

interface ForgotPasswordFormProps {
  lang: string
  t: ForgotPasswordFormT
}

export function ForgotPasswordForm({ lang, t }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await requestPasswordReset(email, lang)

      if (!result.success) {
        setError(result.error)
        return
      }

      setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <Alert>
          <AlertDescription>{t.successMessage}</AlertDescription>
        </Alert>
        <Link href={`/${lang}/auth/login`} className="text-sm text-muted-foreground hover:underline">
          {t.backToLogin}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">{t.email}</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          disabled={isPending}
          autoComplete="email"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t.sending : t.sendLink}
      </Button>

      <div className="text-center">
        <Link href={`/${lang}/auth/login`} className="text-sm text-muted-foreground hover:underline">
          {t.backToLogin}
        </Link>
      </div>
    </form>
  )
}
