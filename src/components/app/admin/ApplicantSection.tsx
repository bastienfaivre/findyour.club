import { Loader2 } from 'lucide-react'
import type { Translations } from '@/lib/i18n/translations/types'
import type { ApplicationEditableFields } from '@/lib/schemas/application'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { PhoneInput } from '@/components/ui/phone-input'

interface ApplicantSectionProps {
  fields: ApplicationEditableFields
  existingClubs: { id: string; name: string; role: string }[] | null
  isPending: boolean
  translations: Translations
  updateField: <K extends keyof ApplicationEditableFields>(key: K, value: ApplicationEditableFields[K]) => void
  navigateToClub: (clubId: string) => void
}

export function ApplicantSection({ fields, existingClubs, isPending, translations: t, updateField, navigateToClub }: ApplicantSectionProps) {
  const ta = t.admin.applications

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{ta.applicantSection}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="app-firstName">{t.apply.fields.firstName}</Label>
          <Input id="app-firstName" value={fields.applicantFirstName ?? ''} onChange={(e) => updateField('applicantFirstName', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="app-lastName">{t.apply.fields.lastName}</Label>
          <Input id="app-lastName" value={fields.applicantLastName ?? ''} onChange={(e) => updateField('applicantLastName', e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-email">{ta.email} <span className="text-destructive">*</span></Label>
        <Input id="app-email" type="email" value={fields.email} onChange={(e) => updateField('email', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-applicantPhone">{t.apply.fields.phone}</Label>
        <PhoneInput
          id="app-applicantPhone"
          value={fields.applicantPhone ?? ''}
          onChange={(val) => updateField('applicantPhone', val ?? '')}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label>{t.apply.fields.preferredLanguage}</Label>
        <p className="text-sm text-muted-foreground">{fields.applicantPreferredLanguage ?? '-'}</p>
      </div>

      {/* Existing Clubs */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">{ta.existingClubs}</h4>
        {existingClubs === null ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : existingClubs.length === 0 ? (
          <p className="text-sm text-muted-foreground">{ta.noExistingClubs}</p>
        ) : (
          <div className="space-y-1">
            {existingClubs.map((club) => (
              <button
                key={club.id}
                type="button"
                onClick={() => navigateToClub(club.id)}
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <span>{club.name}</span>
                <Badge variant="secondary" className="text-xs">
                  {club.role === 'OWNER' ? t.admin.users.owner : t.admin.users.editor}
                </Badge>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
