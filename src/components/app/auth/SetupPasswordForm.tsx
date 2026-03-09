'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { setupPassword } from '@/app/[lang]/(dashboard)/auth/setup/actions'

interface SetupPasswordFormT {
  newPassword: string
  confirmPassword: string
  settingPassword: string
  setPasswordBtn: string
  strength: string
  strengthTooShort: string
  strengthWeak: string
  strengthFair: string
  strengthStrong: string
}

function getPasswordStrength(
  password: string,
  t: Pick<SetupPasswordFormT, 'strengthTooShort' | 'strengthWeak' | 'strengthFair' | 'strengthStrong'>,
): { label: string; color: string } {
  if (password.length === 0) return { label: '', color: '' }
  if (password.length < 8) return { label: t.strengthTooShort, color: 'text-red-600' }
  const checks = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/]
  const passed = checks.filter(r => r.test(password)).length
  if (password.length < 12 || passed < 3) return { label: t.strengthWeak, color: 'text-orange-500' }
  if (passed < 4) return { label: t.strengthFair, color: 'text-yellow-600' }
  return { label: t.strengthStrong, color: 'text-green-600' }
}

export function SetupPasswordForm({ t }: { t: SetupPasswordFormT }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const strength = getPasswordStrength(password, t)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await setupPassword({ password, confirmPassword })
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
        <Label htmlFor="password">{t.newPassword}</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isPending}
          autoComplete="new-password"
        />
        {password && (
          <p className={`text-xs ${strength.color}`}>{t.strength}{strength.label}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
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
        {isPending ? t.settingPassword : t.setPasswordBtn}
      </Button>
    </form>
  )
}
