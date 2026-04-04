import type { Translations } from '@/lib/i18n/translations/types'
import type { ApplicationEditableFields } from '@/lib/schemas/application'
import { SocialLinksFieldset } from '@/components/app/SocialLinksFieldset'
import { LocationTypeahead } from './LocationTypeahead'
import { CountryFlag } from '@/components/ui/country-flag'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ActivityTypeOption, CountryOption } from './types'

interface ClubInformationSectionProps {
  fields: ApplicationEditableFields
  activityTypes: ActivityTypeOption[]
  countries: CountryOption[]
  locale: string
  isPending: boolean
  translations: Translations
  updateField: <K extends keyof ApplicationEditableFields>(key: K, value: ApplicationEditableFields[K]) => void
}

export function ClubInformationSection({ fields, activityTypes, countries, locale, isPending, translations: t, updateField }: ClubInformationSectionProps) {
  const ta = t.admin.applications

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{ta.clubSection}</h3>

      <div className="space-y-2">
        <Label htmlFor="app-name">{ta.name} <span className="text-destructive">*</span></Label>
        <Input id="app-name" value={fields.name} onChange={(e) => updateField('name', e.target.value)} maxLength={200} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-clubEmail">{t.apply.fields.clubEmail}</Label>
        <Input id="app-clubEmail" type="email" value={fields.clubEmail ?? ''} onChange={(e) => updateField('clubEmail', e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-country">{ta.country}</Label>
        <Select value={fields.country} onValueChange={(v) => updateField('country', v)}>
          <SelectTrigger id="app-country" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {countries.map((c) => (
              <SelectItem key={c.code} value={c.code}><CountryFlag code={c.code} /> {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-activityType">{ta.activityType}</Label>
        <Select value={fields.activityType ?? ''} onValueChange={(v) => {
          updateField('activityType', v || null)
          if (v !== 'other') updateField('otherDescription', null)
        }}>
          <SelectTrigger id="app-activityType" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {activityTypes.map((at) => (
              <SelectItem key={at.slug} value={at.slug}>{at.name}</SelectItem>
            ))}
            <SelectItem value="other">{t.activityTypes.other}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {fields.activityType === 'other' && (
        <div className="space-y-2">
          <Label htmlFor="app-otherDescription">{t.apply.fields.otherDescription}</Label>
          <Input
            id="app-otherDescription"
            value={fields.otherDescription ?? ''}
            onChange={(e) => updateField('otherDescription', e.target.value)}
            placeholder={t.apply.placeholders.otherDescription}
            maxLength={200}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="app-location">{ta.location}</Label>
        <LocationTypeahead
          id="app-location"
          value={fields.location}
          country={fields.country}
          locale={locale}
          placeholder={t.apply.placeholders.location}
          onChange={(loc) => updateField('location', loc)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-description">{ta.description} <span className="text-destructive">*</span></Label>
        <Textarea id="app-description" value={fields.description} onChange={(e) => updateField('description', e.target.value)} maxLength={1000} rows={4} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-schedule">{ta.profileFields.schedule}</Label>
        <Textarea id="app-schedule" value={fields.schedule ?? ''} onChange={(e) => updateField('schedule', e.target.value)} maxLength={500} rows={2} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-howToJoin">{ta.profileFields.howToJoin}</Label>
        <Textarea id="app-howToJoin" value={fields.howToJoin ?? ''} onChange={(e) => updateField('howToJoin', e.target.value)} maxLength={1000} rows={2} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-contactPhone">{ta.profileFields.contactPhone}</Label>
        <PhoneInput
          id="app-contactPhone"
          value={fields.contactPhone ?? ''}
          onChange={(val) => updateField('contactPhone', val ?? '')}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-contactAddress">{ta.profileFields.contactAddress}</Label>
        <Textarea id="app-contactAddress" value={fields.contactAddress ?? ''} onChange={(e) => updateField('contactAddress', e.target.value)} maxLength={500} rows={2} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="app-externalWebsiteUrl">{ta.profileFields.externalWebsiteUrl}</Label>
        <Input id="app-externalWebsiteUrl" value={fields.externalWebsiteUrl ?? ''} onChange={(e) => updateField('externalWebsiteUrl', e.target.value)} />
      </div>

      {/* Social Media Links */}
      <SocialLinksFieldset
        label={ta.profileFields.socialLinks}
        labelAs="label"
        renderInput={(platform) => (
          <Input
            id={`app-${platform.key}`}
            aria-label={platform.label}
            placeholder={platform.label}
            value={(fields[platform.key] as string) ?? ''}
            onChange={(e) => updateField(platform.key, e.target.value)}
          />
        )}
      />
    </div>
  )
}
