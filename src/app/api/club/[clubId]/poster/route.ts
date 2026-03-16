import { NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { getAuthSession } from '@/server/auth'
import { prisma } from '@/server/db'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

// A4 dimensions in mm
const A4_W = 210
const A4_H = 297

// Cache favicon in memory — it never changes at runtime
let faviconCache: Buffer | null = null
async function getFavicon(): Promise<Buffer> {
  if (!faviconCache) {
    faviconCache = await readFile(join(process.cwd(), 'public', 'apple-touch-icon.png'))
  }
  return faviconCache
}

// Max logo download size (2 MB) to prevent OOM from malicious URLs
const MAX_LOGO_BYTES = 2 * 1024 * 1024

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

  // Generate QR code with high error correction (allows center logo overlay)
  const qrDataUrlDark = await QRCode.toDataURL(clubUrl, {
    width: 600,
    margin: 0,
    errorCorrectionLevel: 'H',
    color: { dark: '#fafafa', light: '#09090b' },
  })

  // Read project favicon for QR center overlay
  const faviconBytes = await getFavicon()

  // ── Fetch club logo if available ──
  let logoData: { bytes: Uint8Array; format: 'PNG' | 'JPEG' } | null = null
  if (club.logoUrl) {
    try {
      const logoRes = await fetch(club.logoUrl)
      if (logoRes.ok) {
        const contentLength = Number(logoRes.headers.get('content-length') || '0')
        if (contentLength > MAX_LOGO_BYTES) throw new Error('Logo too large')
        const buf = await logoRes.arrayBuffer()
        if (buf.byteLength > MAX_LOGO_BYTES) throw new Error('Logo too large')
        const contentType = logoRes.headers.get('content-type') || ''
        logoData = {
          bytes: new Uint8Array(buf),
          format: contentType.includes('png') ? 'PNG' : 'JPEG',
        }
      }
    } catch {
      // Skip logo if fetch fails
    }
  }

  // ── Compute content height for vertical centering ──
  const logoSize = 28
  const qrSize = 75
  const clubNameLineH = 36 * 0.4 // approximate mm per line at 36pt
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const clubNameLines: string[] = doc.splitTextToSize(club.name, 130)

  const logoBlock = logoData ? logoSize + 16 : 0
  const nameBlock = clubNameLines.length * clubNameLineH
  const brandBlock = 7 + 3 + 12 // "is on" + gap + "findyour.club"
  const qrBlock = qrSize
  const urlBlock = 5

  const gaps = 12 + 16 + 10 // name→brand, brand→qr, qr→url
  const totalH = logoBlock + nameBlock + gaps + brandBlock + qrBlock + urlBlock

  // ── Card dimensions ──
  const cardPadX = 25
  const cardW = A4_W - cardPadX * 2 // 160mm
  const cardPadTop = 28
  const cardPadBot = 24
  const cardH = totalH + cardPadTop + cardPadBot
  const cardY = (A4_H - cardH) / 2
  const cardR = 6

  // ── Page background ──
  doc.setFillColor(255, 255, 255) // white — printer-friendly
  doc.rect(0, 0, A4_W, A4_H, 'F')

  // ── Card ──
  doc.setFillColor(24, 24, 27) // #18181b (zinc-900)
  doc.roundedRect(cardPadX, cardY, cardW, cardH, cardR, cardR, 'F')

  // ── Card border ──
  doc.setDrawColor(39, 39, 42) // #27272a (zinc-800)
  doc.setLineWidth(0.4)
  doc.roundedRect(cardPadX, cardY, cardW, cardH, cardR, cardR, 'S')

  // ── Content (vertically centered inside card) ──
  let y = cardY + cardPadTop

  // Logo
  if (logoData) {
    doc.addImage(
      logoData.bytes,
      logoData.format,
      (A4_W - logoSize) / 2,
      y,
      logoSize,
      logoSize,
    )
    y += logoSize + 16
  }

  // Club name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(36)
  doc.setTextColor(250, 250, 250) // #fafafa
  doc.text(clubNameLines, A4_W / 2, y, { align: 'center' })
  y += clubNameLines.length * clubNameLineH + 12

  // "is on"
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(18)
  doc.setTextColor(113, 113, 122) // #71717a (zinc-500)
  doc.text('is on', A4_W / 2, y, { align: 'center' })
  y += 10

  // "findyour.club"
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(32)
  doc.setTextColor(250, 250, 250) // #fafafa
  doc.text('findyour.club', A4_W / 2, y, { align: 'center' })
  y += 16

  // QR code
  const qrX = (A4_W - qrSize) / 2
  doc.addImage(qrDataUrlDark, 'PNG', qrX, y, qrSize, qrSize)

  // Favicon overlay in QR center (~20% of QR size)
  const iconSize = qrSize * 0.2
  const iconPad = 2
  const iconBgSize = iconSize + iconPad * 2
  const iconBgX = qrX + (qrSize - iconBgSize) / 2
  const iconBgY = y + (qrSize - iconBgSize) / 2
  doc.setFillColor(9, 9, 11) // #09090b — match QR background
  doc.roundedRect(iconBgX, iconBgY, iconBgSize, iconBgSize, 2, 2, 'F')
  doc.addImage(
    new Uint8Array(faviconBytes),
    'PNG',
    iconBgX + iconPad,
    iconBgY + iconPad,
    iconSize,
    iconSize,
  )

  y += qrSize + 10

  // URL
  doc.setFontSize(12)
  doc.setTextColor(161, 161, 170) // #a1a1aa (zinc-400)
  doc.text(clubUrl, A4_W / 2, y, { align: 'center' })

  const pdfBuffer = doc.output('arraybuffer')

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${club.slug}-poster.pdf"`,
    },
  })
}
