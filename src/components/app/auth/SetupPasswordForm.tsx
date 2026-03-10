'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
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
): { label: string; color: string; progressColor: string; value: number } {
  if (password.length === 0) return { label: '', color: '', progressColor: '', value: 0 }
  if (password.length < 8) return { label: t.strengthTooShort, color: 'text-red-600', progressColor: '[&_[data-slot=progress-indicator]]:bg-red-500', value: 25 }
  const checks = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/]
  const passed = checks.filter(r => r.test(password)).length
  if (password.length < 12 || passed < 3) return { label: t.strengthWeak, color: 'text-orange-500', progressColor: '[&_[data-slot=progress-indicator]]:bg-orange-500', value: 50 }
  if (passed < 4) return { label: t.strengthFair, color: 'text-yellow-600', progressColor: '[&_[data-slot=progress-indicator]]:bg-yellow-500', value: 75 }
  return { label: t.strengthStrong, color: 'text-green-600', progressColor: '[&_[data-slot=progress-indicator]]:bg-green-500', value: 100 }
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
          <div className="space-y-1">
            <Progress value={strength.value} className={`h-1.5 ${strength.progressColor}`} />
            <p className={`text-xs ${strength.color}`}>{t.strength}{strength.label}</p>
          </div>
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
