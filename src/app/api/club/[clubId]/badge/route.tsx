import { NextResponse } from 'next/server'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { generateBadgeImage } from '@/lib/og-image'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clubId: string }> },
) {
  const { clubId } = await params
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Allow club members (OWNER or EDITOR) and platform operators
  const isOperator = session.user.role === 'OPERATOR'
  if (!isOperator) {
    const membership = await prisma.clubMembership.findFirst({
      where: { userId: session.user.id, clubId, status: 'ACTIVE' },
      select: { id: true },
    })
    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: { name: true },
  })
  if (!club) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return generateBadgeImage({ clubName: club.name })
}
