'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Image from 'next/image'
import { Loader2, Pencil, Eye, X, Download } from 'lucide-react'
import type { Translations } from '@/lib/i18n/translations/types'
import { extractClubEditableFields } from '@/lib/schemas/club'
import type { ClubEditableFields } from '@/lib/schemas/club'
import { SocialLinksFieldset } from '@/components/app/SocialLinksFieldset'
import { updateClubFields, operatorDeleteClubPhoto, operatorDeleteClubLogo, operatorUploadClubLogo, operatorPersistClubLogo, operatorUpdateClubLogoAlt, operatorDeleteClub } from '@/app/[lang]/(dashboard)/admin/clubs/[id]/actions'
import { useAdminSelection } from '@/components/app/AdminSelectionContext'
import type { ClubListItem } from './ClubQueue'
import type { ActivityTypeOption, CountryOption } from './types'
import { LocationTypeahead } from './LocationTypeahead'
import { ForceOfflineDialog } from './ForceOfflineDialog'
import { LiftOfflineButton } from './LiftOfflineButton'
import { ProfilePreview } from '@/components/app/club-admin/ProfilePreview'
import { LogoUpload, type LogoActions } from '@/components/app/club-admin/LogoUpload'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhoneInput } from '@/components/ui/phone-input'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface ClubDetailProps {
  club: ClubListItem
  activityTypes: ActivityTypeOption[]
  countries: CountryOption[]
  translations: Translations
  locale: string
}

export function ClubDetail({ club, activityTypes, countries, translations: t, locale }: ClubDetailProps) {
  const router = useRouter()
  const { setSelectedUserId } = useAdminSelection()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const tc = t.admin.clubs
  const cs = t.clubSite

  const navigateToUser = (userId: string) => {
    setSelectedUserId(userId)
    router.push(`/${locale}/admin/users`)
  }

  // Delete club state
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Centralized form state
  const initialFields = extractClubEditableFields(club)
  const [fields, setFields] = useState<ClubEditableFields>(initialFields)
  const [photos, setPhotos] = useState(club.photos)

  const updateField = <K extends keyof ClubEditableFields>(key: K, value: ClubEditableFields[K]) => {
    setFields(prev => ({ ...prev, [key]: value }))
  }

  const logoActions: LogoActions = {
    upload: operatorUploadClubLogo,
    persist: operatorPersistClubLogo,
    remove: operatorDeleteClubLogo,
    updateAlt: operatorUpdateClubLogoAlt,
  }

  const handleDeletePhoto = (photoId: string) => {
    startTransition(async () => {
      const result = await operatorDeleteClubPhoto(club.id, photoId)
      if (result.success) {
        setPhotos(prev => prev.filter(p => p.id !== photoId))
        router.refresh()
      } else {
        toast.error(result.error)
      }
    })
  }

  const canSave = fields.name.trim() && fields.email.trim() && fields.slug.trim()

  const handleSave = () => {
    setError(null)
    startTransition(async () => {
      const trimmedFields: ClubEditableFields = {
        name: fields.name.trim(),
        email: fields.email.trim(),
        country: fields.country,
        activityType: fields.activityType,
        location: fields.location,
        description: fields.description.trim(),
        schedule: fields.schedule?.trim() || '',
        contactPhone: fields.contactPhone?.trim() || null,
        contactAddress: fields.contactAddress?.trim() || null,
        howToJoin: fields.howToJoin?.trim() || '',
        externalWebsiteUrl: fields.externalWebsiteUrl?.trim() || null,
        instagramUrl: fields.instagramUrl?.trim() || null,
        facebookUrl: fields.facebookUrl?.trim() || null,
        xUrl: fields.xUrl?.trim() || null,
        tiktokUrl: fields.tiktokUrl?.trim() || null,
        discordUrl: fields.discordUrl?.trim() || null,
        youtubeUrl: fields.youtubeUrl?.trim() || null,
        whatsappUrl: fields.whatsappUrl?.trim() || null,
        telegramUrl: fields.telegramUrl?.trim() || null,
        githubUrl: fields.githubUrl?.trim() || null,
        slug: fields.slug.trim(),
      }
      const result = await updateClubFields(club.id, trimmedFields)
      if (result.success) {
        toast.success(tc.changesSaved)
        router.refresh()
      } else {
        setError(result.error)
      }
    })
  }

  const formBlock = (
    <div className="space-y-6">
      {/* Logo */}
      <LogoUpload
        clubId={club.id}
        logoUrl={club.logoUrl}
        logoAlt={club.logoAlt ?? null}
        translations={t.club.admin.clubProfile.logo}
        actions={logoActions}
      />

      {/* Editable fields */}
      <fieldset disabled={isPending} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="club-name">{tc.name} <span className="text-destructive">*</span></Label>
          <Input id="club-name" value={fields.name} onChange={(e) => updateField('name', e.target.value)} maxLength={200} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-email">{tc.email} <span className="text-destructive">*</span></Label>
          <Input id="club-email" type="email" value={fields.email} onChange={(e) => updateField('email', e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-country">{tc.country}</Label>
          <Select value={fields.country} onValueChange={(v) => updateField('country', v)}>
            <SelectTrigger id="club-country" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-activityType">{tc.activityType}</Label>
          <Select value={fields.activityType ?? ''} onValueChange={(v) => updateField('activityType', v || null)}>
            <SelectTrigger id="club-activityType" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {activityTypes.map((at) => (
                <SelectItem key={at.slug} value={at.slug}>{at.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-location">{tc.location}</Label>
          <LocationTypeahead
            id="club-location"
            value={fields.location}
            country={fields.country}
            locale={locale}
            placeholder={t.apply.placeholders.location}
            onChange={(loc) => updateField('location', loc)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-description">{tc.description}</Label>
          <Textarea id="club-description" value={fields.description} onChange={(e) => updateField('description', e.target.value)} maxLength={5000} rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-schedule">{tc.profileFields.schedule}</Label>
          <Textarea id="club-schedule" value={fields.schedule ?? ''} onChange={(e) => updateField('schedule', e.target.value)} maxLength={2000} rows={2} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-howToJoin">{tc.profileFields.howToJoin}</Label>
          <Textarea id="club-howToJoin" value={fields.howToJoin ?? ''} onChange={(e) => updateField('howToJoin', e.target.value)} maxLength={2000} rows={2} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-contactPhone">{tc.profileFields.contactPhone}</Label>
          <PhoneInput
            id="club-contactPhone"
            value={fields.contactPhone ?? ''}
            onChange={(val) => updateField('contactPhone', val ?? '')}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-contactAddress">{tc.profileFields.contactAddress}</Label>
          <Textarea id="club-contactAddress" value={fields.contactAddress ?? ''} onChange={(e) => updateField('contactAddress', e.target.value)} maxLength={500} rows={2} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="club-externalWebsiteUrl">{tc.profileFields.externalWebsiteUrl}</Label>
          <Input id="club-externalWebsiteUrl" value={fields.externalWebsiteUrl ?? ''} onChange={(e) => updateField('externalWebsiteUrl', e.target.value)} />
        </div>

        {/* Social Media Links */}
        <SocialLinksFieldset
          label={tc.profileFields.socialLinks}
          labelAs="label"
          renderInput={(platform) => (
            <Input
              placeholder={platform.label}
              value={(fields[platform.key] as string) ?? ''}
              onChange={(e) => updateField(platform.key, e.target.value)}
            />
          )}
        />

        <div className="space-y-2">
          <Label htmlFor="club-slug">{tc.slug} <span className="text-destructive">*</span></Label>
          <Input id="club-slug" value={fields.slug} onChange={(e) => updateField('slug', e.target.value)} maxLength={60} />
        </div>
      </fieldset>

      {/* Photos */}
      <div className="space-y-3">
        <Label>{tc.photoSection}</Label>
        {photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                <Image
                  src={photo.url}
                  alt={photo.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(photo.id)}
                  disabled={isPending}
                  className="absolute right-1 top-1 flex h-11 w-11 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={tc.deletePhoto}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{tc.noPhotos}</p>
        )}
      </div>

      {/* Save button */}
      <Button onClick={handleSave} disabled={isPending || !canSave}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {tc.saveChanges}
      </Button>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Separator />

      {/* Status & moderation */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold">{tc.status}</h3>
        <div className="flex items-center gap-3">
          {club.forceOffline ? (
            <Badge variant="destructive">{tc.moderatedOffline}</Badge>
          ) : club.isPublished ? (
            <Badge variant="success">{tc.online}</Badge>
          ) : (
            <Badge variant="destructive">{tc.offline}</Badge>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {club.forceOffline ? (
            <LiftOfflineButton clubId={club.id} clubName={club.name} clubs={tc} common={t.common} />
          ) : (
            <ForceOfflineDialog clubId={club.id} clubName={club.name} clubs={tc} common={t.common} />
          )}
        </div>
      </section>

      <Separator />

      {/* Members */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold">{tc.members}</h3>
        {club.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{tc.noMembers}</p>
        ) : (
          <div className="space-y-2">
            {club.members.map((member) => {
              const displayName = member.user.firstName
                ? `${member.user.firstName} ${member.user.lastName}`
                : member.user.email
              return (
                <button
                  key={member.user.id}
                  type="button"
                  onClick={() => navigateToUser(member.user.id)}
                  className="flex items-center gap-2 w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    {member.user.firstName && (
                      <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
                    )}
                  </div>
                  <Badge variant={member.role === 'OWNER' ? 'default' : 'secondary'} className="text-xs shrink-0">
                    {member.role === 'OWNER' ? t.admin.users.owner : t.admin.users.editor}
                  </Badge>
                </button>
              )
            })}
          </div>
        )}
      </section>

      <Separator />

      {/* Promote */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium">{t.club.admin.promote.title}</h3>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={`/api/club/${club.id}/badge`} download="badge.png">
              <Download className="h-4 w-4" />
              {t.club.admin.promote.badge}
            </a>
          </Button>
          <Button asChild variant="outline" size="sm">
            <a href={`/api/club/${club.id}/qr-card`} download="qr-card.png">
              <Download className="h-4 w-4" />
              {t.club.admin.promote.qrCard}
            </a>
          </Button>
        </div>
      </section>

      <Separator />

      {/* Delete club */}
      <section className="space-y-3">
        <AlertDialog open={deleteOpen} onOpenChange={(open) => { setDeleteOpen(open); if (!open) setDeleteConfirmText('') }}>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">{tc.deleteClub}</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{tc.deleteClubConfirm.replace('{clubName}', club.name)}</AlertDialogTitle>
              <AlertDialogDescription>{tc.deleteClubDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{tc.deleteClubHint.replace('{clubName}', club.name)}</p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                autoComplete="off"
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
              <Button
                variant="destructive"
                disabled={isPending || deleteConfirmText !== club.name}
                onClick={() => {
                  startTransition(async () => {
                    const result = await operatorDeleteClub(club.id)
                    if (result.success) {
                      toast.success(tc.clubDeleted)
                      setDeleteOpen(false)
                      router.push(`/${locale}/admin/clubs`)
                    } else {
                      toast.error(result.error)
                    }
                  })
                }}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {tc.deleteClub}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </section>

    </div>
  )

  const previewBlock = (
    <ProfilePreview
      formValues={{
        name: fields.name,
        email: fields.email,
        description: fields.description || '',
        schedule: fields.schedule || '',
        howToJoin: fields.howToJoin || '',
        contactPhone: fields.contactPhone || null,
        contactAddress: fields.contactAddress || null,
        externalWebsiteUrl: fields.externalWebsiteUrl || null,
        instagramUrl: fields.instagramUrl || null,
        facebookUrl: fields.facebookUrl || null,
        xUrl: fields.xUrl || null,
        tiktokUrl: fields.tiktokUrl || null,
        discordUrl: fields.discordUrl || null,
        youtubeUrl: fields.youtubeUrl || null,
        whatsappUrl: fields.whatsappUrl || null,
        telegramUrl: fields.telegramUrl || null,
        githubUrl: fields.githubUrl || null,
      }}
      logoUrl={club.logoUrl}
      logoAlt={null}
      photos={photos}
      translations={{
        description: cs.description,
        schedule: cs.schedule,
        howToJoin: cs.howToJoin,
        contactInfo: cs.contactInfo,
        email: cs.email,
        phone: cs.phone,
        address: cs.address,
        visitWebsite: cs.visitWebsite,
        photos: cs.photos,
        goToPhoto: cs.goToPhoto,
        closeLightbox: cs.closeLightbox,
        contactCta: cs.contactCta,
        preview: tc.previewTab,
      }}
    />
  )

  return (
    <Tabs defaultValue="edit" className="flex flex-col h-full min-h-0">
      <TabsList className="mb-4">
        <TabsTrigger value="edit">
          <Pencil />
          {tc.editTab}
        </TabsTrigger>
        <TabsTrigger value="preview">
          <Eye />
          {tc.previewTab}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="edit" className="flex-1 min-h-0 overflow-y-auto">
        {formBlock}
      </TabsContent>
      <TabsContent value="preview" className="flex-1 min-h-0 overflow-y-auto">
        {previewBlock}
      </TabsContent>
    </Tabs>
  )
}
