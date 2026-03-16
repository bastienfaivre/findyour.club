'use client'
import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { setupPassword } from '@/app/[lang]/(dashboard)/auth/setup/actions'
import { getPasswordStrength } from '@/lib/password-strength'

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
  firstName: string
  lastName: string
  phone: string
  preferredLanguage: string
  passwordHint: string
  languageOptions: { value: string; label: string }[]
}

interface SetupPasswordFormProps {
  t: SetupPasswordFormT
  defaultLanguage: string
  lang: string
  /** When true, profile fields (name, phone, language) are read-only. */
  profileLocked: boolean
  defaultProfile: { firstName: string; lastName: string; phone: string }
}

export function SetupPasswordForm({ t, defaultLanguage, lang, profileLocked, defaultProfile }: SetupPasswordFormProps) {
  const [firstName, setFirstName] = useState(defaultProfile.firstName)
  const [lastName, setLastName] = useState(defaultProfile.lastName)
  const [phone, setPhone] = useState(defaultProfile.phone)
  const [preferredLanguage, setPreferredLanguage] = useState(defaultLanguage)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const strength = getPasswordStrength(password, t)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await setupPassword({ firstName, lastName, phone, preferredLanguage, password, confirmPassword }, lang)
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t.firstName} *</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            required
            disabled={isPending || profileLocked}
            autoComplete="given-name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t.lastName} *</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            required
            disabled={isPending || profileLocked}
            autoComplete="family-name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t.phone}</Label>
        <PhoneInput
          id="phone"
          value={phone}
          onChange={setPhone}
          disabled={isPending || profileLocked}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredLanguage">{t.preferredLanguage}</Label>
        <Select value={preferredLanguage} onValueChange={setPreferredLanguage} disabled={isPending || profileLocked}>
          <SelectTrigger id="preferredLanguage">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {t.languageOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <hr className="my-2" />

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
        {isPending ? t.settingPassword : t.setPasswordBtn}
      </Button>
    </form>
  )
}
