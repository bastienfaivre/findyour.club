import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ContactInfoProps = {
  email: string
  phone?: string | null
  address?: string | null
  websiteUrl?: string | null
  websiteLabel: string
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
  translations,
}: ContactInfoProps) {
  return (
    <div className="space-y-3">
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

      {websiteUrl && (
        <div className="mt-4">
          <Button variant="outline" asChild>
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              {websiteLabel}
            </a>
          </Button>
        </div>
      )}
    </div>
  )
}
