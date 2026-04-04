'use client'

import { useState, useTransition } from 'react'
import { updateProfile } from '@/app/[lang]/(dashboard)/account/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { SUPPORTED_LANGUAGES } from '@/lib/schemas/profile'

const LANG_LABELS: Record<string, string> = {
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  en: 'English',
}

interface ProfileSectionProps {
  initialData: {
    firstName: string
    lastName: string
    phone: string
    preferredLanguage: string
  }
  lang: string
  t: {
    firstName: string
    lastName: string
    phone: string
    preferredLanguage: string
    saving: string
    saved: string
  }
  commonT: {
    save: string
  }
}

export function ProfileSection({ initialData, lang, t, commonT }: ProfileSectionProps) {
  const [firstName, setFirstName] = useState(initialData.firstName)
  const [lastName, setLastName] = useState(initialData.lastName)
  const [phone, setPhone] = useState(initialData.phone)
  const [preferredLanguage, setPreferredLanguage] = useState(initialData.preferredLanguage)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const hasChanges =
    firstName !== initialData.firstName ||
    lastName !== initialData.lastName ||
    phone !== initialData.phone ||
    preferredLanguage !== initialData.preferredLanguage

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      const result = await updateProfile({
        firstName,
        lastName,
        phone: phone || undefined,
        preferredLanguage,
      }, lang)
      if (result.success) {
        setMessage({ type: 'success', text: t.saved })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t.firstName}</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">{t.lastName}</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t.phone}</Label>
        <PhoneInput
          id="phone"
          value={phone}
          onChange={setPhone}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="preferredLanguage">{t.preferredLanguage}</Label>
        <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
          <SelectTrigger id="preferredLanguage">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_LANGUAGES.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {LANG_LABELS[lang]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
          {message.text}
        </p>
      )}

      <Button type="submit" disabled={isPending || !hasChanges}>
        {isPending ? t.saving : commonT.save}
      </Button>
    </form>
  )
}
