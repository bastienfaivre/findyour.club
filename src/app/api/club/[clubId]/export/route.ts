import { NextResponse } from 'next/server'
import { zipSync, strToU8 } from 'fflate'
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

  // Atomic membership check + data fetch to prevent TOCTOU race condition
  const club = await prisma.club.findFirst({
    where: {
      id: clubId,
      memberships: { some: { userId: session.user.id, status: 'ACTIVE', role: 'OWNER' } },
    },
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
        where: { senderRole: { not: 'OPERATOR' } },
        select: { senderRole: true, body: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
  if (!club) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Download images in parallel
  const imageDownloads: { url: string; baseName: string }[] = []

  if (club.logoUrl) {
    imageDownloads.push({ url: club.logoUrl, baseName: 'logo' })
  }

  // Photos disabled temporarily
  // for (const photo of club.photos) {
  //   imageDownloads.push({ url: photo.url, baseName: `photos/${photo.position}` })
  // }

  const imageResults = await Promise.allSettled(
    imageDownloads.map(async ({ url, baseName }) => {
      const res = await fetch(url, { signal: AbortSignal.timeout(10_000) })
      if (!res.ok) return null
      const contentType = res.headers.get('Content-Type') ?? ''
      const ext = mimeToExt(contentType) ?? extFromUrl(url)
      const buffer = await res.arrayBuffer()
      return { filename: `${baseName}${ext}`, data: new Uint8Array(buffer) }
    }),
  )

  // Build ZIP contents
  const files: Record<string, Uint8Array> = {}

  // Collect resolved filenames from downloads
  const resolvedFiles = new Map<string, string>() // baseName -> actual filename
  for (const result of imageResults) {
    if (result.status === 'fulfilled' && result.value) {
      files[result.value.filename] = result.value.data
      // Extract baseName from filename (e.g. "logo" from "logo.png", "photos/0" from "photos/0.jpg")
      const baseName = result.value.filename.replace(/\.[^.]+$/, '')
      resolvedFiles.set(baseName, result.value.filename)
    }
  }

  // Build JSON export data (with local file references instead of URLs)
  const exportData = {
    version: '2.0',
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
            cantonCode: club.location.swissLocation.cantonCode,
            names: Object.fromEntries(
              club.location.swissLocation.translations.map((t) => [t.language, t.name]),
            ),
          }
        : null,
    },
    logo: club.logoUrl
      ? { file: resolvedFiles.get('logo') ?? null, alt: club.logoAlt }
      : null,
    photos: [], // photos disabled temporarily
    messages: club.supportMessages.map((m) => ({
      senderRole: m.senderRole,
      body: m.body,
      createdAt: m.createdAt.toISOString(),
    })),
  }

  files['data.json'] = strToU8(JSON.stringify(exportData, null, 2))

  // Create ZIP archive
  const zip = zipSync(files)
  const filename = `${club.slug}-export-${new Date().toISOString().slice(0, 10)}.zip`

  return new Response(zip.buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

function mimeToExt(contentType: string): string | null {
  const mime = contentType.split(';')[0].trim().toLowerCase()
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
  }
  return map[mime] ?? null
}

function extFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const match = pathname.match(/\.(jpe?g|png|webp|gif|svg)$/i)
    return match ? `.${match[1].toLowerCase()}` : '.png'
  } catch {
    return '.png'
  }
}
