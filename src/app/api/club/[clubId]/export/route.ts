import { NextResponse } from 'next/server'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clubId: string }> },
) {
  const { clubId } = await params
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify the caller is an OWNER of this club
  const membership = await prisma.clubMembership.findFirst({
    where: { userId: session.user.id, clubId, status: 'ACTIVE', role: 'OWNER' },
    select: { id: true },
  })
  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch all club data
  const club = await prisma.club.findUnique({
    where: { id: clubId },
    select: {
      name: true,
      slug: true,
      country: true,
      email: true,
      activityType: true,
      description: true,
      schedule: true,
      howToJoin: true,
      contactPhone: true,
      contactAddress: true,
      externalWebsiteUrl: true,
      instagramUrl: true,
      facebookUrl: true,
      xUrl: true,
      tiktokUrl: true,
      discordUrl: true,
      youtubeUrl: true,
      whatsappUrl: true,
      telegramUrl: true,
      githubUrl: true,
      isPublished: true,
      accentColor: true,
      defaultLanguage: true,
      createdAt: true,
      logoUrl: true,
      logoAlt: true,
      location: {
        select: {
          swissLocation: {
            select: {
              plz: true,
              cantonCode: true,
              translations: { select: { language: true, name: true } },
            },
          },
        },
      },
      photos: {
        select: { url: true, alt: true, position: true },
        orderBy: { position: 'asc' },
      },
      supportMessages: {
        select: { senderRole: true, body: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!club) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    club: {
      name: club.name,
      slug: club.slug,
      country: club.country,
      email: club.email,
      activityType: club.activityType,
      description: club.description,
      schedule: club.schedule,
      howToJoin: club.howToJoin,
      contactPhone: club.contactPhone,
      contactAddress: club.contactAddress,
      externalWebsiteUrl: club.externalWebsiteUrl,
      instagramUrl: club.instagramUrl,
      facebookUrl: club.facebookUrl,
      xUrl: club.xUrl,
      tiktokUrl: club.tiktokUrl,
      discordUrl: club.discordUrl,
      youtubeUrl: club.youtubeUrl,
      whatsappUrl: club.whatsappUrl,
      telegramUrl: club.telegramUrl,
      githubUrl: club.githubUrl,
      isPublished: club.isPublished,
      accentColor: club.accentColor,
      defaultLanguage: club.defaultLanguage,
      createdAt: club.createdAt.toISOString(),
      location: club.location?.swissLocation
        ? {
            plz: club.location.swissLocation.plz,
            cantonCode: club.location.swissLocation.cantonCode,
            names: Object.fromEntries(
              club.location.swissLocation.translations.map((t) => [t.language, t.name]),
            ),
          }
        : null,
    },
    logo: club.logoUrl ? { url: club.logoUrl, alt: club.logoAlt } : null,
    photos: club.photos.map((p) => ({
      url: p.url,
      alt: p.alt,
      position: p.position,
    })),
    messages: club.supportMessages.map((m) => ({
      senderRole: m.senderRole,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  }

  const json = JSON.stringify(exportData, null, 2)
  const filename = `${club.slug}-export-${new Date().toISOString().slice(0, 10)}.json`

  return new Response(json, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
