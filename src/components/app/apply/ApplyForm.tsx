'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { applicationSchema, slugRegex, type ApplicationInput } from '@/lib/schemas/application'
import { submitApplication, type SubmitApplicationResult } from '@/app/[lang]/(platform)/apply/actions'
import type { Translations } from '@/lib/i18n/translations'
import type { SupportedLanguage } from '@/lib/i18n'
import type { Country } from '@/lib/country'

type LocationResult = {
  swisstopoId: string
  plz: string
  name: string
  cantonCode: string
}

type Props = {
  lang: SupportedLanguage
  t: Translations
  activityTypes: { id: string; name: string }[]
  countries: { code: Country; label: string }[]
}

function RequiredMark() {
  return <span className="text-destructive" aria-hidden="true"> *</span>
}

function SlugField({
  register,
  errors,
  control,
  lang,
  t,
}: {
  register: ReturnType<typeof useForm<ApplicationInput>>['register']
  errors: ReturnType<typeof useForm<ApplicationInput>>['formState']['errors']
  control: ReturnType<typeof useForm<ApplicationInput>>['control']
  lang: SupportedLanguage
  t: Translations
}) {
  const slugValue = useWatch({ control, name: 'desiredSlug' }) ?? ''
  const countryValue = useWatch({ control, name: 'country' }) ?? 'ch'
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const trimmed = slugValue.trim()
  const isValid = trimmed.length > 0 && slugRegex.test(trimmed)
  const showFormatWarning = trimmed.length > 0 && !isValid
  const preview = isValid ? `${origin}/${lang}/${countryValue}/${trimmed}` : null

  return (
    <div className="space-y-2">
      <Label htmlFor="desiredSlug">{t.apply.fields.desiredSlug}<RequiredMark /></Label>
      <Input
        id="desiredSlug"
        {...register('desiredSlug')}
        placeholder={t.apply.placeholders.desiredSlug}
        maxLength={60}
        aria-required="true"
        aria-describedby={errors.desiredSlug ? 'desiredSlug-error' : 'desiredSlug-hint'}
        aria-invalid={!!errors.desiredSlug || showFormatWarning}
      />
      {preview && (
        <p className="text-sm text-muted-foreground font-mono break-all">
          {preview}
        </p>
      )}
      {showFormatWarning && (
        <p className="text-sm text-destructive">
          {t.apply.validation.desiredSlugInvalid}
        </p>
      )}
      <p id="desiredSlug-hint" className="text-sm text-muted-foreground">
        {t.apply.desiredSlugHint}
      </p>
      {errors.desiredSlug && !showFormatWarning && (
        <p id="desiredSlug-error" className="text-sm text-destructive">
          {t.apply.validation.desiredSlugRequired}
        </p>
      )}
    </div>
  )
}

export function ApplyForm({ lang, t, activityTypes, countries }: Props) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
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
      country: countries[0]?.code ?? 'ch',
      turnstileToken: '',
    },
    mode: 'onBlur',
  })

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
      // Explicitly trigger validation — mode: 'onBlur' ignores shouldValidate from setValue
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

  const onSubmit = async (data: ApplicationInput) => {
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
      <p className="text-sm text-muted-foreground">
        <span className="text-destructive">*</span> {t.apply.requiredLegend}
      </p>

      {serverError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {serverError}
        </div>
      )}

      {/* Association Name */}
      <div className="space-y-2">
        <Label htmlFor="name">{t.apply.fields.name}<RequiredMark /></Label>
        <Input
          id="name"
          {...register('name')}
          placeholder={t.apply.placeholders.name}
          aria-required="true"
          aria-describedby={errors.name ? 'name-error' : undefined}
          aria-invalid={!!errors.name}
        />
        {errors.name && (
          <p id="name-error" className="text-sm text-destructive">
            {t.apply.validation.nameRequired}
          </p>
        )}
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
          aria-describedby={errors.email ? 'email-error' : undefined}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-destructive">
            {t.apply.validation.emailInvalid}
          </p>
        )}
      </div>

      {/* Activity Type */}
      <div className="space-y-2">
        <Label htmlFor="activityType">{t.apply.fields.activityType}<RequiredMark /></Label>
        <Controller
          control={control}
          name="activityTypeId"
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange}>
              <SelectTrigger
                id="activityType"
                className="w-full"
                aria-required="true"
                aria-describedby={errors.activityTypeId ? 'activityType-error' : undefined}
                aria-invalid={!!errors.activityTypeId}
              >
                <SelectValue placeholder={t.apply.placeholders.activityType} />
              </SelectTrigger>
              <SelectContent>
                {activityTypes.map((at) => (
                  <SelectItem key={at.id} value={at.id}>
                    {at.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.activityTypeId && (
          <p id="activityType-error" className="text-sm text-destructive">
            {t.apply.validation.activityTypeRequired}
          </p>
        )}
      </div>

      {/* Country */}
      <div className="space-y-2">
        <Label htmlFor="country">{t.apply.fields.country}<RequiredMark /></Label>
        <Controller
          control={control}
          name="country"
          render={({ field }) => (
            <Select
              value={field.value}
              onValueChange={field.onChange}
              disabled={countries.length <= 1}
            >
              <SelectTrigger id="country" className="w-full" aria-required="true">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.label}
                  </SelectItem>
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
              // Enforce selection-only: if user typed but didn't pick from dropdown, reset
              if (!getValues('location')) {
                setLocationQuery('')
              }
              void trigger('location')
            }}
            placeholder={t.apply.placeholders.location}
            aria-required="true"
            aria-describedby={errors.location ? 'location-error' : undefined}
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
          <p id="location-error" className="text-sm text-destructive">
            {t.apply.validation.locationRequired}
          </p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t.apply.fields.description}<RequiredMark /></Label>
        <Textarea
          id="description"
          {...register('description')}
          placeholder={t.apply.placeholders.description}
          maxLength={1000}
          aria-required="true"
          aria-describedby={errors.description ? 'description-error' : undefined}
          aria-invalid={!!errors.description}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-destructive">
            {errors.description.type === 'too_big'
              ? t.apply.validation.descriptionMaxLength
              : t.apply.validation.descriptionRequired}
          </p>
        )}
      </div>

      {/* Profile Details */}
      <h3 className="text-lg font-semibold pt-2">{t.apply.fields.profileDetails}</h3>

      {/* How to Join */}
      <div className="space-y-2">
        <Label htmlFor="howToJoin">{t.apply.fields.howToJoin}<RequiredMark /></Label>
        <Textarea
          id="howToJoin"
          {...register('howToJoin')}
          placeholder={t.apply.placeholders.howToJoin}
          maxLength={1000}
          aria-required="true"
          aria-describedby={errors.howToJoin ? 'howToJoin-error' : undefined}
          aria-invalid={!!errors.howToJoin}
        />
        {errors.howToJoin && (
          <p id="howToJoin-error" className="text-sm text-destructive">
            {t.apply.validation.howToJoinRequired}
          </p>
        )}
      </div>

      {/* Schedule */}
      <div className="space-y-2">
        <Label htmlFor="schedule">{t.apply.fields.schedule}</Label>
        <Textarea
          id="schedule"
          {...register('schedule')}
          placeholder={t.apply.placeholders.schedule}
          maxLength={500}
          aria-describedby={errors.schedule ? 'schedule-error' : undefined}
          aria-invalid={!!errors.schedule}
        />
        {errors.schedule && (
          <p id="schedule-error" className="text-sm text-destructive">
            {t.apply.validation.scheduleMaxLength}
          </p>
        )}
      </div>

      {/* Contact Phone */}
      <div className="space-y-2">
        <Label htmlFor="contactPhone">{t.apply.fields.contactPhone}</Label>
        <Input
          id="contactPhone"
          type="tel"
          {...register('contactPhone')}
          placeholder={t.apply.placeholders.contactPhone}
          maxLength={30}
          aria-describedby={errors.contactPhone ? 'contactPhone-error' : undefined}
          aria-invalid={!!errors.contactPhone}
        />
        {errors.contactPhone && (
          <p id="contactPhone-error" className="text-sm text-destructive">
            {t.apply.validation.contactPhoneMaxLength}
          </p>
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
          aria-describedby={errors.contactAddress ? 'contactAddress-error' : undefined}
          aria-invalid={!!errors.contactAddress}
        />
        {errors.contactAddress && (
          <p id="contactAddress-error" className="text-sm text-destructive">
            {t.apply.validation.contactAddressMaxLength}
          </p>
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
          aria-describedby={errors.externalWebsiteUrl ? 'externalWebsiteUrl-error' : undefined}
          aria-invalid={!!errors.externalWebsiteUrl}
        />
        {errors.externalWebsiteUrl && (
          <p id="externalWebsiteUrl-error" className="text-sm text-destructive">
            {t.apply.validation.externalWebsiteUrlInvalid}
          </p>
        )}
      </div>

      {/* Desired URL Slug */}
      <SlugField
        register={register}
        errors={errors}
        control={control}
        lang={lang}
        t={t}
      />

      {/* Turnstile */}
      {siteKey && (
        <Turnstile
          ref={turnstileRef}
          siteKey={siteKey}
          onSuccess={(token) => setValue('turnstileToken', token, { shouldValidate: true })}
        />
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="min-h-[44px] min-w-[44px]">
          {isSubmitting ? t.apply.submitting : t.common.submit}
        </Button>
      </div>
    </form>
  )
}
