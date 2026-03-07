import { notFound } from 'next/navigation'
import { isValidCountry } from '@/lib/country'

export default async function CountryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string; country: string }>
}) {
  const { country } = await params

  if (!isValidCountry(country)) notFound()

  return <>{children}</>
}
