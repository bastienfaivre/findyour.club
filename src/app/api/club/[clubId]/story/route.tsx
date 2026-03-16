import { NextResponse } from 'next/server'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'
import { generateStoryImage } from '@/lib/og-image'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clubId: string }> },
) {
  const { clubId } = await params
  const lang = new URL(request.url).searchParams.get('lang') || 'en'
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
    select: { name: true, slug: true, country: true, logoUrl: true },
  })
  if (!club) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const clubUrl = `${BASE_URL}/${lang}/${club.country}/${club.slug}`

  return generateStoryImage({
    clubName: club.name,
    clubLogoUrl: club.logoUrl,
    clubUrl,
  })
}
