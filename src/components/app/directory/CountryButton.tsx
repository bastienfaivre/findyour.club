import Link from 'next/link'

function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 65))
    .join('')
}

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
  const flag = countryCodeToFlag(country)

  const className =
    'flex items-center gap-2 rounded-[10px] border px-4 py-[10px] text-card-foreground transition-all' +
    (comingSoon
      ? ' opacity-45 cursor-default'
      : ' hover:border-muted-foreground hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring')

  if (comingSoon) {
    return (
      <span className={className}>
        <span aria-hidden="true" className="text-xl leading-none">
          {flag}
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
      href={`/${lang}/${country}`}
      aria-label={ariaLabel}
      className={className}
    >
      <span aria-hidden="true" className="text-xl leading-none">
        {flag}
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
