'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { applicationSchema, type ApplicationInput } from '@/lib/schemas/application'
import { SUPPORTED_LANGUAGES } from '@/lib/schemas/profile'
import { SocialLinksFieldset } from '@/components/app/SocialLinksFieldset'
import { SharePlatformButton } from '@/components/app/SharePlatformButton'
import { submitApplication, type SubmitApplicationResult } from '@/app/[lang]/(dashboard)/apply/actions'
import type { Translations } from '@/lib/i18n/translations'
import type { SupportedLanguage } from '@/lib/i18n'
import type { Country } from '@/lib/country'

const LANG_LABELS: Record<string, string> = {
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  en: 'English',
}

type LocationResult = {
  swisstopoId: string
  plz: string
  name: string
  cantonCode: string
}

type Props = {
  lang: SupportedLanguage
  t: Translations
  activityTypes: { slug: string; name: string }[]
  countries: { code: Country; label: string }[]
  userProfile?: {
    firstName: string
    lastName: string
    email: string
    phone: string
    preferredLanguage: string
  } | null
}

function RequiredMark() {
  return <span className="text-destructive" aria-hidden="true"> *</span>
}

export function ApplyForm({ lang, t, activityTypes, countries, userProfile }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [sameEmail, setSameEmail] = useState(false)
  const [samePhone, setSamePhone] = useState(false)
  const [locationResults, setLocationResults] = useState<LocationResult[]>([])
  const [locationOpen, setLocationOpen] = useState(false)
  const [locationQuery, setLocationQuery] = useState('')
  const [activeLocationIndex, setActiveLocationIndex] = useState(-1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const turnstileRef = useRef<TurnstileInstance | null>(null)
  const locationWrapperRef = useRef<HTMLDivElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      applicantFirstName: userProfile?.firstName ?? '',
      applicantLastName: userProfile?.lastName ?? '',
      email: userProfile?.email ?? '',
      applicantPhone: userProfile?.phone ?? '',
      applicantPreferredLanguage: (userProfile?.preferredLanguage ?? lang) as typeof SUPPORTED_LANGUAGES[number],
      country: countries[0]?.code ?? 'ch',
      turnstileToken: '',
    },
    mode: 'onBlur',
  })

  const watchedActivityType = useWatch({ control, name: 'activityType' })
  const watchedEmail = useWatch({ control, name: 'email' })
  const watchedPhone = useWatch({ control, name: 'applicantPhone' })

  // Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Close location dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationWrapperRef.current && !locationWrapperRef.current.contains(event.target as Node)) {
        setLocationOpen(false)
        setActiveLocationIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectLocation = useCallback(
    (loc: LocationResult) => {
      setValue(
        'location',
        {
          swisstopoId: loc.swisstopoId,
          plz: loc.plz,
          cantonCode: loc.cantonCode,
          name: loc.name,
        },
        { shouldValidate: true },
      )
      void trigger('location')
      const display = loc.plz
        ? `${loc.name} (${loc.cantonCode}) — ${loc.plz}`
        : `${loc.name} (${loc.cantonCode})`
      setLocationQuery(display)
      setLocationOpen(false)
      setLocationResults([])
      setActiveLocationIndex(-1)
    },
    [setValue, trigger],
  )

  const searchLocations = useCallback(
    (query: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      if (query.length < 2) {
        setLocationResults([])
        setLocationOpen(false)
        setActiveLocationIndex(-1)
        return
      }
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `/api/locations?country=${encodeURIComponent(getValues('country'))}&q=${encodeURIComponent(query)}&lang=${lang}`,
          )
          if (res.ok) {
            const data = (await res.json()) as LocationResult[]
            setLocationResults(data)
            setLocationOpen(data.length > 0)
            setActiveLocationIndex(-1)
          }
        } catch {
          // silently fail — user can retry
        }
      }, 300)
    },
    [lang, getValues],
  )

  const handleLocationKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!locationOpen || locationResults.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveLocationIndex((prev) =>
          prev < locationResults.length - 1 ? prev + 1 : 0,
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveLocationIndex((prev) =>
          prev > 0 ? prev - 1 : locationResults.length - 1,
        )
      } else if (e.key === 'Enter' && activeLocationIndex >= 0) {
        e.preventDefault()
        selectLocation(locationResults[activeLocationIndex])
      } else if (e.key === 'Escape') {
        setLocationOpen(false)
        setActiveLocationIndex(-1)
      }
    },
    [locationOpen, locationResults, activeLocationIndex, selectLocation],
  )

  const goToStep2 = async () => {
    const step1Valid = await trigger([
      'applicantFirstName',
      'applicantLastName',
      'email',
      'applicantPhone',
      'applicantPreferredLanguage',
    ])
    if (step1Valid) {
      setStep(2)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const onSubmit = async (data: ApplicationInput) => {
    // Apply "same as" logic before submission
    if (sameEmail) {
      data.clubEmail = ''
    }
    if (samePhone && data.applicantPhone) {
      data.contactPhone = data.applicantPhone
    }

    setServerError(null)
    const result: SubmitApplicationResult = await submitApplication(data)
    if (result.success) {
      setSubmitted(true)
    } else {
      if (result.code === 'RATE_LIMITED') {
        setServerError(t.apply.errors.rateLimited)
      } else if (result.code === 'TURNSTILE_FAILED') {
        setServerError(t.apply.errors.turnstileFailed)
        turnstileRef.current?.reset()
      } else {
        setServerError(t.apply.errors.serverError)
      }
    }
  }

  if (submitted) {
    return (
      <div className="rounded-md border border-green-200 bg-green-50 p-6 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
        <p>{t.apply.success}</p>
      </div>
    )
  }

  // eslint-disable-next-line react-hooks/refs -- react-hook-form's handleSubmit is not a React ref
  const formOnSubmit = handleSubmit(onSubmit)

  return (
    <form onSubmit={formOnSubmit} className="space-y-6" noValidate>
      {/* Responsible person warning */}
      {step === 1 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-center dark:border-amber-900 dark:bg-amber-950/30">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            {t.apply.responsibleWarning}
          </p>
          <p className="mt-2 text-sm text-amber-700 dark:text-amber-400">
            {t.apply.responsibleShare}
          </p>
          <div className="mt-3 flex items-center justify-center">
            <SharePlatformButton
              label={t.apply.responsibleShareButton}
              copiedMessage={t.clubSite.linkCopied}
              className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-900/40"
            />
          </div>
        </div>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`flex items-center justify-center rounded-full h-7 w-7 text-xs font-medium ${step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</span>
        <span className={step === 1 ? 'font-medium' : 'text-muted-foreground'}>{t.apply.steps.aboutYou}</span>
        <span className="text-muted-foreground mx-1">—</span>
        <span className={`flex items-center justify-center rounded-full h-7 w-7 text-xs font-medium ${step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>2</span>
        <span className={step === 2 ? 'font-medium' : 'text-muted-foreground'}>{t.apply.steps.aboutYourClub}</span>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="text-destructive">*</span> {t.apply.requiredLegend}
      </p>

      {serverError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* ── STEP 1: About You ── */}
      <div className={step === 1 ? '' : 'hidden'}>
        <div className="space-y-6">
          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicantFirstName">{t.apply.fields.firstName}<RequiredMark /></Label>
              <Input
                id="applicantFirstName"
                {...register('applicantFirstName')}
                placeholder={t.apply.placeholders.firstName}
                aria-required="true"
                aria-invalid={!!errors.applicantFirstName}
              />
              {errors.applicantFirstName && (
                <p className="text-sm text-destructive">{t.apply.validation.firstNameRequired}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicantLastName">{t.apply.fields.lastName}<RequiredMark /></Label>
              <Input
                id="applicantLastName"
                {...register('applicantLastName')}
                placeholder={t.apply.placeholders.lastName}
                aria-required="true"
                aria-invalid={!!errors.applicantLastName}
              />
              {errors.applicantLastName && (
                <p className="text-sm text-destructive">{t.apply.validation.lastNameRequired}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t.apply.fields.email}<RequiredMark /></Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder={t.apply.placeholders.email}
              aria-required="true"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{t.apply.validation.emailInvalid}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="applicantPhone">{t.apply.fields.phone}</Label>
            <Controller
              control={control}
              name="applicantPhone"
              render={({ field }) => (
                <PhoneInput
                  id="applicantPhone"
                  value={field.value ?? ''}
                  onChange={(val) => field.onChange(val ?? '')}
                  placeholder={t.apply.placeholders.phone}
                  aria-invalid={!!errors.applicantPhone}
                />
              )}
            />
            {errors.applicantPhone && (
              <p className="text-sm text-destructive">{t.apply.validation.applicantPhoneInvalid}</p>
            )}
          </div>

          {/* Preferred Language */}
          <div className="space-y-2">
            <Label htmlFor="applicantPreferredLanguage">{t.apply.fields.preferredLanguage}<RequiredMark /></Label>
            <Controller
              control={control}
              name="applicantPreferredLanguage"
              render={({ field }) => (
                <Select value={field.value ?? ''} onValueChange={field.onChange}>
                  <SelectTrigger id="applicantPreferredLanguage" className="w-full" aria-required="true" aria-invalid={!!errors.applicantPreferredLanguage}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>{LANG_LABELS[lang]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.applicantPreferredLanguage && (
              <p className="text-sm text-destructive">{t.apply.validation.preferredLanguageRequired}</p>
            )}
          </div>

          {/* Next button */}
          <div className="flex justify-end">
            <Button type="button" onClick={goToStep2} className="min-h-[44px] min-w-[44px]">
              {t.apply.steps.next}
            </Button>
          </div>
        </div>
      </div>

      {/* ── STEP 2: About Your Club ── */}
      <div className={step === 2 ? '' : 'hidden'}>
        <div className="space-y-6">

          {/* Section: Identity */}
          <section className="rounded-lg border p-4 space-y-4">
            <h3 className="text-sm font-medium">{t.apply.sections.identity}</h3>

            {/* Club Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t.apply.fields.name}<RequiredMark /></Label>
              <Input
                id="name"
                {...register('name')}
                placeholder={t.apply.placeholders.name}
                aria-required="true"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{t.apply.validation.nameRequired}</p>
              )}
            </div>

            {/* Activity Type */}
            <div className="space-y-2">
              <Label htmlFor="activityType">{t.apply.fields.activityType}<RequiredMark /></Label>
              <p className="text-sm text-muted-foreground">{t.apply.helpers.activityType}</p>
              <Controller
                control={control}
                name="activityType"
                render={({ field }) => (
                  <Select value={field.value ?? ''} onValueChange={field.onChange}>
                    <SelectTrigger id="activityType" className="w-full" aria-required="true" aria-invalid={!!errors.activityType}>
                      <SelectValue placeholder={t.apply.placeholders.activityType} />
                    </SelectTrigger>
                    <SelectContent>
                      {activityTypes.map((at) => (
                        <SelectItem key={at.slug} value={at.slug}>{at.name}</SelectItem>
                      ))}
                      <SelectItem key="other" value="other">{t.activityTypes.other}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.activityType && (
                <p className="text-sm text-destructive">{t.apply.validation.activityTypeRequired}</p>
              )}
              {watchedActivityType === 'other' && (
                <div className="space-y-2 mt-2">
                  <Label htmlFor="otherDescription">{t.apply.fields.otherDescription}<RequiredMark /></Label>
                  <Input
                    id="otherDescription"
                    {...register('otherDescription')}
                    placeholder={t.apply.placeholders.otherDescription}
                    aria-required="true"
                    aria-invalid={!!errors.otherDescription}
                  />
                  {errors.otherDescription && (
                    <p className="text-sm text-destructive">{t.apply.validation.otherDescriptionRequired}</p>
                  )}
                </div>
              )}
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">{t.apply.fields.country}<RequiredMark /></Label>
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={countries.length <= 1}>
                    <SelectTrigger id="country" className="w-full" aria-required="true">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Location Typeahead */}
            <div className="space-y-2">
              <Label htmlFor="location">{t.apply.fields.location}<RequiredMark /></Label>
              <div className="relative" ref={locationWrapperRef}>
                <Input
                  id="location"
                  role="combobox"
                  value={locationQuery}
                  onChange={(e) => {
                    const q = e.target.value
                    setLocationQuery(q)
                    searchLocations(q)
                    if (getValues('location')) {
                      setValue('location', undefined as never, { shouldValidate: false })
                    }
                  }}
                  onKeyDown={handleLocationKeyDown}
                  onBlur={() => {
                    if (!getValues('location')) {
                      setLocationQuery('')
                    }
                    void trigger('location')
                  }}
                  placeholder={t.apply.placeholders.location}
                  aria-required="true"
                  aria-invalid={!!errors.location}
                  aria-expanded={locationOpen}
                  aria-controls="location-listbox"
                  aria-activedescendant={
                    activeLocationIndex >= 0 ? `location-option-${activeLocationIndex}` : undefined
                  }
                  autoComplete="off"
                />
                {locationOpen && locationResults.length > 0 && (
                  <ul
                    id="location-listbox"
                    ref={listboxRef}
                    role="listbox"
                    className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
                  >
                    {locationResults.map((loc, index) => (
                      <li
                        key={loc.swisstopoId}
                        id={`location-option-${index}`}
                        role="option"
                        aria-selected={index === activeLocationIndex}
                        className={`w-full cursor-pointer rounded-sm px-2 py-1.5 text-left text-sm ${
                          index === activeLocationIndex
                            ? 'bg-accent text-accent-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground'
                        }`}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          selectLocation(loc)
                        }}
                      >
                        {loc.name} ({loc.cantonCode}){loc.plz ? ` — ${loc.plz}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.location && (
                <p className="text-sm text-destructive">{t.apply.validation.locationRequired}</p>
              )}
            </div>
          </section>

          {/* Section: About */}
          <section className="rounded-lg border p-4 space-y-4">
            <h3 className="text-sm font-medium">{t.apply.sections.about}</h3>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">{t.apply.fields.description}<RequiredMark /></Label>
              <p className="text-sm text-muted-foreground">{t.apply.helpers.description}</p>
              <Textarea
                id="description"
                {...register('description')}
                placeholder={t.apply.placeholders.description}
                maxLength={1000}
                aria-required="true"
                aria-invalid={!!errors.description}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.type === 'too_big'
                    ? t.apply.validation.descriptionMaxLength
                    : t.apply.validation.descriptionRequired}
                </p>
              )}
            </div>

            {/* Schedule */}
            <div className="space-y-2">
              <Label htmlFor="schedule">{t.apply.fields.schedule}<RequiredMark /></Label>
              <p className="text-sm text-muted-foreground">{t.apply.helpers.schedule}</p>
              <Textarea
                id="schedule"
                {...register('schedule')}
                placeholder={t.apply.placeholders.schedule}
                maxLength={500}
                aria-required="true"
                aria-invalid={!!errors.schedule}
              />
              {errors.schedule && (
                <p className="text-sm text-destructive">
                  {errors.schedule.type === 'too_big'
                    ? t.apply.validation.scheduleMaxLength
                    : t.apply.validation.scheduleRequired}
                </p>
              )}
            </div>

            {/* How to Join */}
            <div className="space-y-2">
              <Label htmlFor="howToJoin">{t.apply.fields.howToJoin}<RequiredMark /></Label>
              <p className="text-sm text-muted-foreground">{t.apply.helpers.howToJoin}</p>
              <Textarea
                id="howToJoin"
                {...register('howToJoin')}
                placeholder={t.apply.placeholders.howToJoin}
                maxLength={1000}
                aria-required="true"
                aria-invalid={!!errors.howToJoin}
              />
              {errors.howToJoin && (
                <p className="text-sm text-destructive">{t.apply.validation.howToJoinRequired}</p>
              )}
            </div>
          </section>

          {/* Section: Contact */}
          <section className="rounded-lg border p-4 space-y-4">
            <h3 className="text-sm font-medium">{t.apply.sections.contact}</h3>

            {/* Club Email with "same as" checkbox */}
            <div className="space-y-2">
              <Label htmlFor="clubEmail">{t.apply.fields.clubEmail}</Label>
              <div className="flex items-center gap-2 mb-2">
                <Checkbox
                  id="sameEmail"
                  checked={sameEmail}
                  onCheckedChange={(checked: boolean) => {
                    setSameEmail(!!checked)
                    if (checked) {
                      setValue('clubEmail', '')
                    }
                  }}
                />
                <Label htmlFor="sameEmail" className="text-sm font-normal cursor-pointer">
                  {t.apply.fields.sameAsMyEmail}
                </Label>
              </div>
              {!sameEmail && (
                <Input
                  id="clubEmail"
                  type="email"
                  {...register('clubEmail')}
                  placeholder={t.apply.placeholders.clubEmail}
                />
              )}
              {sameEmail && (
                <p className="text-sm text-muted-foreground">{watchedEmail}</p>
              )}
            </div>

            {/* Contact Phone */}
            <div className="space-y-2">
              <Label htmlFor="contactPhone">{t.apply.fields.contactPhone}</Label>
              {watchedPhone && (
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox
                    id="samePhone"
                    checked={samePhone}
                    onCheckedChange={(checked: boolean) => {
                      setSamePhone(!!checked)
                      if (checked) {
                        setValue('contactPhone', watchedPhone)
                      } else {
                        setValue('contactPhone', '')
                      }
                    }}
                  />
                  <Label htmlFor="samePhone" className="text-sm font-normal cursor-pointer">
                    {t.apply.fields.sameAsMyPhone}
                  </Label>
                </div>
              )}
              {!samePhone && (
                <Controller
                  control={control}
                  name="contactPhone"
                  render={({ field }) => (
                    <PhoneInput
                      id="contactPhone"
                      value={field.value ?? ''}
                      onChange={(val) => field.onChange(val ?? '')}
                      placeholder={t.apply.placeholders.contactPhone}
                      aria-invalid={!!errors.contactPhone}
                    />
                  )}
                />
              )}
              {samePhone && watchedPhone && (
                <p className="text-sm text-muted-foreground">{watchedPhone}</p>
              )}
              {errors.contactPhone && !samePhone && (
                <p className="text-sm text-destructive">{t.apply.validation.contactPhoneInvalid}</p>
              )}
            </div>

            {/* Contact Address */}
            <div className="space-y-2">
              <Label htmlFor="contactAddress">{t.apply.fields.contactAddress}</Label>
              <Textarea
                id="contactAddress"
                {...register('contactAddress')}
                placeholder={t.apply.placeholders.contactAddress}
                maxLength={500}
                aria-invalid={!!errors.contactAddress}
              />
              {errors.contactAddress && (
                <p className="text-sm text-destructive">{t.apply.validation.contactAddressMaxLength}</p>
              )}
            </div>

            {/* External Website URL */}
            <div className="space-y-2">
              <Label htmlFor="externalWebsiteUrl">{t.apply.fields.externalWebsiteUrl}</Label>
              <Input
                id="externalWebsiteUrl"
                type="url"
                {...register('externalWebsiteUrl')}
                placeholder="https://..."
                aria-invalid={!!errors.externalWebsiteUrl}
              />
              {errors.externalWebsiteUrl && (
                <p className="text-sm text-destructive">{t.apply.validation.externalWebsiteUrlInvalid}</p>
              )}
            </div>
          </section>

          {/* Section: Social Media */}
          <section className="rounded-lg border p-4 space-y-4">
            <h3 className="text-sm font-medium">{t.apply.sections.social}</h3>
            <SocialLinksFieldset
              label={t.apply.fields.socialLinks}
              renderInput={(platform) => (
                <Input
                  id={`apply-${platform.key}`}
                  {...register(platform.key)}
                  placeholder={platform.placeholder}
                  aria-label={platform.label}
                />
              )}
            />
          </section>

          {/* Turnstile */}
          {siteKey && (
            <Turnstile
              ref={turnstileRef}
              siteKey={siteKey}
              onSuccess={(token) => setValue('turnstileToken', token, { shouldValidate: true })}
            />
          )}

          {/* Back / Submit */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }) }} className="min-h-[44px] min-w-[44px]">
              {t.apply.steps.back}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-h-[44px] min-w-[44px]">
              {isSubmitting ? t.apply.submitting : t.common.submit}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
