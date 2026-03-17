import Link from 'next/link'
import { CountryFlag } from '@/components/ui/country-flag'

type CountryButtonProps = {
  country: string
  countryName: string
  clubCountLabel: string
  ariaLabel: string
  lang: string
  comingSoon?: boolean
}

export function CountryButton({
  country,
  countryName,
  clubCountLabel,
  ariaLabel,
  lang,
  comingSoon,
}: CountryButtonProps) {
  const className =
    'flex items-center gap-3 rounded-[10px] border px-4 py-[10px] text-left text-card-foreground transition-all' +
    (comingSoon
      ? ' opacity-45 cursor-default'
      : ' hover:border-muted-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring')

  if (comingSoon) {
    return (
      <span className={className}>
        <span aria-hidden="true" className="flex w-7 shrink-0 items-center justify-center">
          <CountryFlag code={country} className="h-7 w-auto" />
        </span>
        <div className="flex flex-col gap-px">
          <span className="text-[13px] font-semibold">{countryName}</span>
          <span className="text-[11px] text-muted-foreground">
            {clubCountLabel}
          </span>
        </div>
      </span>
    )
  }

  return (
    <Link
      href={`/${lang}/search?country=${country}`}
      aria-label={ariaLabel}
      className={className}
    >
      <span aria-hidden="true" className="flex w-7 shrink-0 items-center justify-center">
        <CountryFlag code={country} className="h-7 w-auto" />
      </span>
      <div className="flex flex-col gap-px">
        <span className="text-[13px] font-semibold">{countryName}</span>
        <span className="text-[11px] text-muted-foreground">
          {clubCountLabel}
        </span>
      </div>
    </Link>
  )
}
