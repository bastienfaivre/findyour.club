import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import { isValidCountry } from '@/lib/country'

type Props = {
  params: Promise<{ lang: string; country: string }>
}

export default async function CountryLandingPage({ params }: Props) {
  const { lang, country } = await params
  if (!isValidCountry(country)) notFound()
  redirect(`/${lang}/search?country=${country}`)
}
