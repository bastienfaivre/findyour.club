'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { loginWithCredentials } from '@/app/[lang]/(dashboard)/auth/login/actions'

interface LoginFormT {
  email: string
  password: string
  signingIn: string
  signIn: string
  forgotPassword: string
}

interface LoginFormProps {
  callbackUrl?: string
  lang: string
  t: LoginFormT
}

export function LoginForm({ callbackUrl, lang, t }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await loginWithCredentials({ email, password })

      if (!result.success) {
        setError(result.error)
        return
      }

      // If TOTP enrolled → challenge required (callbackUrl not carried through TOTP flow)
      if (result.totpEnabled) {
        router.push(`/${lang}/auth/totp`)
      } else if (callbackUrl) {
        router.push(callbackUrl)
      } else if (result.role === 'OPERATOR') {
        router.push(`/${lang}/admin/stats`)
      } else if (result.firstClubId) {
        router.push(`/${lang}/club/${result.firstClubId}`)
      } else {
        router.push(`/${lang}/`)
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t.password}</Label>
          <Link href={`/${lang}/auth/forgot-password`} className="text-xs text-muted-foreground hover:underline" tabIndex={-1}>
            {t.forgotPassword}
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isPending}
          autoComplete="current-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t.signingIn : t.signIn}
      </Button>
    </form>
  )
}
