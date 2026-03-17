/* eslint-disable @next/next/no-img-element */

interface CountryFlagProps {
  code: string
  className?: string
}

export function CountryFlag({ code, className = 'inline-block h-[1em] w-auto align-[-0.1em]' }: CountryFlagProps) {
  const lower = code.toLowerCase()
  return (
    <img
      src={`/flags/${lower}.svg`}
      alt={code.toUpperCase()}
      className={className}
      loading="lazy"
    />
  )
}

export function CantonFlag({ code, className = 'inline-block h-[1em] w-auto align-[-0.1em]' }: CountryFlagProps) {
  const lower = code.toLowerCase()
  return (
    <img
      src={`/flags/canton/${lower}.svg`}
      alt={code.toUpperCase()}
      className={className}
      loading="lazy"
    />
  )
}
