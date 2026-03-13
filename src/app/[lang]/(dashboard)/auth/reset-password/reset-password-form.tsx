'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { resetPassword } from './actions'
import { getPasswordStrength } from '@/lib/password-strength'

interface ResetPasswordFormT {
  newPassword: string
  confirmPassword: string
  resetting: string
  resetBtn: string
  passwordHint: string
  strength: string
  strengthTooShort: string
  strengthWeak: string
  strengthFair: string
  strengthStrong: string
}

export function ResetPasswordForm({ t }: { t: ResetPasswordFormT }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const strength = getPasswordStrength(password, t)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await resetPassword({ password, confirmPassword })
      if (result && !result.success) {
        setError(result.error)
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
        <Label htmlFor="password">{t.newPassword} *</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isPending}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">{t.passwordHint}</p>
        {password && (
          <div className="space-y-1">
            <Progress value={strength.value} className={`h-1.5 ${strength.progressColor}`} />
            <p className={`text-xs ${strength.color}`}>{t.strength}{strength.label}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t.confirmPassword} *</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          disabled={isPending}
          autoComplete="new-password"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t.resetting : t.resetBtn}
      </Button>
    </form>
  )
}
