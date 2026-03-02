'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { setupPassword } from '@/app/auth/setup/actions'

function getPasswordStrength(password: string): { label: string; color: string } {
  if (password.length === 0) return { label: '', color: '' }
  if (password.length < 8) return { label: 'Too short', color: 'text-red-600' }
  const checks = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/]
  const passed = checks.filter(r => r.test(password)).length
  if (password.length < 12 || passed < 3) return { label: 'Weak', color: 'text-orange-500' }
  if (passed < 4) return { label: 'Fair', color: 'text-yellow-600' }
  return { label: 'Strong', color: 'text-green-600' }
}

export function SetupPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const strength = getPasswordStrength(password)

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
        <Label htmlFor="password">New Password</Label>
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
          <p className={`text-xs ${strength.color}`}>Strength: {strength.label}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
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
        {isPending ? 'Setting password…' : 'Set Password'}
      </Button>
    </form>
  )
}
