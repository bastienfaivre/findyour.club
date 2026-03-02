// Club public site placeholder — full implementation in Epic 3 (Public Platform Site & Discovery)
import { notFound } from 'next/navigation'
import { isValidCountry } from '@/lib/country'

export default async function ClubPage({
  params,
}: {
  params: Promise<{ country: string; club: string }>
}) {
  const { country, club } = await params

  if (!isValidCountry(country)) notFound()

  return (
    <div>
      <h1>Club: {club}</h1>
      <p>Country: {country}</p>
      <p>TODO: Implement in Epic 3</p>
    </div>
  )
}
