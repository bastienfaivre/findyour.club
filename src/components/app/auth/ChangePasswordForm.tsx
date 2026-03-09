'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { changePassword } from '@/app/[lang]/(dashboard)/account/actions'

interface ChangePasswordFormT {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  passwordHint: string
  updatingPassword: string
  updatePassword: string
  passwordChanged: string
}

export function ChangePasswordForm({ t }: { t: ChangePasswordFormT }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    startTransition(async () => {
      const result = await changePassword({ currentPassword, password, confirmPassword })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(t.passwordChanged)
      setCurrentPassword('')
      setPassword('')
      setConfirmPassword('')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">{t.currentPassword}</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={e => setCurrentPassword(e.target.value)}
          required
          disabled={isPending}
          autoComplete="current-password"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">{t.newPassword}</Label>
        <Input
          id="newPassword"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          disabled={isPending}
          autoComplete="new-password"
        />
        <p className="text-xs text-muted-foreground">{t.passwordHint}</p>
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

      <Button type="submit" disabled={isPending}>
        {isPending ? t.updatingPassword : t.updatePassword}
      </Button>
    </form>
  )
}
