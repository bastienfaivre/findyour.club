// Root homepage — dispatches to platform or country based on subdomain.
// Full implementation in Epic 3 (Public Platform Site & Discovery).
import { headers } from 'next/headers'
import { getCountryFromHost } from '@/lib/country'

export default async function HomePage() {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  const country = getCountryFromHost(host)

  if (country) {
    return (
      <div>
        <h1>Country: {country}</h1>
        <p>TODO: Implement in Epic 3</p>
      </div>
    )
  }

  return (
    <div>
      <h1>Platform Directory</h1>
      <p>TODO: Implement in Epic 3</p>
    </div>
  )
}
