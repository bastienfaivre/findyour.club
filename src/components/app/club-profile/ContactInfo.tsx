import { Mail, Phone, MapPin, Globe } from 'lucide-react'
import { SOCIAL_PLATFORMS, type SocialFieldKey } from '@/lib/social-platforms'

type SocialLinks = Partial<Record<SocialFieldKey, string | null>>

type ContactInfoProps = {
  email?: string | null
  phone?: string | null
  address?: string | null
  websiteUrl?: string | null
  websiteLabel: string
  socialLinks?: SocialLinks
  translations: {
    email: string
    phone: string
    address: string
  }
}

export function ContactInfo({
  email,
  phone,
  address,
  websiteUrl,
  websiteLabel,
  socialLinks,
  translations,
}: ContactInfoProps) {
  const activeSocials = socialLinks
    ? SOCIAL_PLATFORMS.filter((p) => {
        const url = socialLinks[p.key]
        return url && /^https?:\/\//i.test(url)
      })
    : []

  return (
    <div className="space-y-3">
      {email && (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">{translations.email}</span>
          <a
            href={`mailto:${email}`}
            className="text-sm underline underline-offset-4 hover:text-primary"
          >
            {email}
          </a>
        </div>
      )}

      {phone && (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">{translations.phone}</span>
          <a
            href={`tel:${phone}`}
            className="text-sm underline underline-offset-4 hover:text-primary"
          >
            {phone}
          </a>
        </div>
      )}

      {address && (
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">{translations.address}</span>
          <p className="text-sm whitespace-pre-line">{address}</p>
        </div>
      )}

      {websiteUrl && /^https?:\/\//i.test(websiteUrl) && (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">{websiteLabel}</span>
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm underline underline-offset-4 hover:text-primary truncate"
          >
            {websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </a>
        </div>
      )}

      {activeSocials.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-2">
          {activeSocials.map((platform) => {
            const Icon = platform.icon
            return (
              <a
                key={platform.key}
                href={socialLinks![platform.key]!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={platform.label}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
