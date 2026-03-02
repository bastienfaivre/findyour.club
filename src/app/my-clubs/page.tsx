import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { MyClubsList } from '@/components/app/my-clubs/MyClubsList'

export default async function MyClubsPage() {
  const session = await getAuthSession()
  if (!session?.user) redirect('/auth/login')
  if (session.user.totpEnabled && !session.user.totpVerified) redirect('/auth/totp')

  const headersList = await headers()
  const host = headersList.get('host') ?? ''

  const memberships = await prisma.clubMembership.findMany({
    where: { userId: session.user.id, status: 'ACTIVE' },
    include: {
      club: {
        select: { slug: true, country: true, name: true, logoUrl: true, logoAlt: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })

  if (memberships.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-muted-foreground text-sm">
          You are not a member of any club — contact the platform operator.
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">My Clubs</h1>
        <MyClubsList memberships={memberships} host={host} />
      </div>
    </main>
  )
}
