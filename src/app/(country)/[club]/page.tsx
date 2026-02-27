// Club public site placeholder — full implementation in Epic 3 (Public Platform Site & Discovery)
import { headers } from 'next/headers'
import { getCountryFromHost } from '@/lib/country'
import { notFound } from 'next/navigation'

export default async function ClubPage({
  params,
}: {
  params: Promise<{ club: string }>
}) {
  const { club } = await params
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const country = getCountryFromHost(host)

  if (!country) notFound()

  return (
    <div>
      <h1>Club: {club}</h1>
      <p>Country: {country}</p>
      <p>TODO: Implement in Epic 3</p>
    </div>
  )
}
