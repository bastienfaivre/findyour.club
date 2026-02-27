import { PrismaClient } from '../src/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'
import 'dotenv/config'
import { encrypt } from '../src/lib/crypto'

// Seed needs a raw PrismaClient without the clubId middleware
// (seed creates records with explicit clubId in data fields)
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Starting database seed...')

  // ─── Operator Account ────────────────────────────────────────────────
  const operatorPasswordHash = await argon2.hash('123456')
  const operator = await prisma.user.upsert({
    where: { email: 'clashware.geology074@aleeas.com' },
    update: { passwordHash: operatorPasswordHash },
    create: {
      email: 'clashware.geology074@aleeas.com',
      name: 'Platform Operator',
      role: 'OPERATOR',
      passwordHash: operatorPasswordHash,
      totpEnabled: false,
    },
  })
  console.log('✓ Operator created:', operator.email)

  // ─── Club Admin Accounts ─────────────────────────────────────────────
  const adminPasswordHash = await argon2.hash('admin123')

  const adminValais = await prisma.user.upsert({
    where: { email: 'admin@ski-club-valais.ch' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@ski-club-valais.ch',
      name: 'Ski Club Valais Admin',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  const adminLausanne = await prisma.user.upsert({
    where: { email: 'admin@football-club-lausanne.ch' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@football-club-lausanne.ch',
      name: 'Football Club Lausanne Admin',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  // ─── Clubs ────────────────────────────────────────────────────────────
  const clubValais = await prisma.club.upsert({
    where: { slug: 'ski-club-valais' },
    update: {},
    create: {
      name: 'Ski Club Valais',
      slug: 'ski-club-valais',
      country: 'ch',
      status: 'active',
      email: 'contact@ski-club-valais.ch',
      welcomeText: 'Welcome to Ski Club Valais — your home for alpine skiing in the heart of the Valais region.',
      accentColor: 'blue',
      storageUsedBytes: BigInt(0),
      storageLimitBytes: BigInt(5368709120), // 5 GB
      admins: { connect: { id: adminValais.id } },
    },
  })

  const clubLausanne = await prisma.club.upsert({
    where: { slug: 'football-club-lausanne' },
    update: {},
    create: {
      name: 'Football Club Lausanne',
      slug: 'football-club-lausanne',
      country: 'ch',
      status: 'active',
      email: 'contact@football-club-lausanne.ch',
      welcomeText: 'Welcome to Football Club Lausanne — passion, teamwork, and community on the pitch.',
      accentColor: 'green',
      storageUsedBytes: BigInt(0),
      storageLimitBytes: BigInt(5368709120),
      admins: { connect: { id: adminLausanne.id } },
    },
  })

  // Update users with their clubId
  await prisma.user.update({ where: { id: adminValais.id }, data: { clubId: clubValais.id } })
  await prisma.user.update({ where: { id: adminLausanne.id }, data: { clubId: clubLausanne.id } })

  console.log('✓ Clubs created:', clubValais.slug, clubLausanne.slug)

  // ─── Pages for Ski Club Valais ────────────────────────────────────────
  const homePage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubValais.id, slug: 'home' } },
    update: {},
    create: { clubId: clubValais.id, slug: 'home', label: 'Home', isActive: true, isAnchor: true, position: 0 },
  })

  const calendarPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubValais.id, slug: 'events' } },
    update: {},
    create: { clubId: clubValais.id, slug: 'events', label: 'Events', isActive: true, position: 1 },
  })

  const galleryPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubValais.id, slug: 'gallery' } },
    update: {},
    create: { clubId: clubValais.id, slug: 'gallery', label: 'Gallery', isActive: true, position: 2 },
  })

  const docsPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubValais.id, slug: 'documents' } },
    update: {},
    create: { clubId: clubValais.id, slug: 'documents', label: 'Documents', isActive: true, position: 3 },
  })

  const contactPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubValais.id, slug: 'contact' } },
    update: {},
    create: { clubId: clubValais.id, slug: 'contact', label: 'Contact', isActive: true, isAnchor: true, position: 4 },
  })

  // ─── Page Elements for Ski Club Valais ────────────────────────────────

  // rich_text element on home page
  await prisma.pageElement.upsert({
    where: { id: `valais-richtext-home` },
    update: {},
    create: {
      id: 'valais-richtext-home',
      pageId: homePage.id,
      clubId: clubValais.id,
      position: 0,
      type: 'rich_text',
      data: {
        html: '<h2>About Us</h2><p>Founded in 1952, Ski Club Valais has been promoting alpine skiing for over 70 years. Join us for weekly group ski sessions, competitions, and social events throughout the season.</p>',
      },
    },
  })

  // image element on home page (below rich_text)
  await prisma.pageElement.upsert({
    where: { id: 'valais-image-home' },
    update: {},
    create: {
      id: 'valais-image-home',
      pageId: homePage.id,
      clubId: clubValais.id,
      position: 1,
      type: 'image',
      data: {
        url: 'https://example.com/placeholder-hero.jpg',
        alt: 'Ski Club Valais members on a mountain slope',
        caption: 'Our club on the slopes of Zermatt',
      },
    },
  })

  // calendar element on events page
  const calendarElement = await prisma.pageElement.upsert({
    where: { id: 'valais-calendar-events' },
    update: {},
    create: {
      id: 'valais-calendar-events',
      pageId: calendarPage.id,
      clubId: clubValais.id,
      position: 0,
      type: 'calendar',
      data: {},
    },
  })

  // Calendar events
  const now = new Date()
  await prisma.event.createMany({
    data: [
      {
        clubId: clubValais.id,
        elementId: calendarElement.id,
        title: 'Opening Day Ski Tour',
        date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        description: 'Season opener at Zermatt. All skill levels welcome.',
      },
      {
        clubId: clubValais.id,
        elementId: calendarElement.id,
        title: 'Club Championship',
        date: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        description: 'Annual slalom championship. Registration required.',
      },
      {
        clubId: clubValais.id,
        elementId: calendarElement.id,
        title: 'Junior Training Camp',
        date: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        description: 'Three-day training camp for skiers under 18.',
      },
    ],
  })

  // gallery element on gallery page
  const galleryElement = await prisma.pageElement.upsert({
    where: { id: 'valais-gallery-gallery' },
    update: {},
    create: {
      id: 'valais-gallery-gallery',
      pageId: galleryPage.id,
      clubId: clubValais.id,
      position: 0,
      type: 'gallery',
      data: {},
    },
  })

  await prisma.galleryItem.createMany({
    data: [
      {
        clubId: clubValais.id,
        elementId: galleryElement.id,
        url: 'https://example.com/placeholder-ski-1.jpg',
        alt: 'Skiers on a sunny alpine slope in Zermatt',
        type: 'image',
        position: 0,
      },
      {
        clubId: clubValais.id,
        elementId: galleryElement.id,
        url: 'https://example.com/placeholder-ski-2.jpg',
        alt: 'Club members at the annual championship podium',
        type: 'image',
        position: 1,
      },
    ],
  })

  // documents element on documents page
  const documentsElement = await prisma.pageElement.upsert({
    where: { id: 'valais-documents-docs' },
    update: {},
    create: {
      id: 'valais-documents-docs',
      pageId: docsPage.id,
      clubId: clubValais.id,
      position: 0,
      type: 'documents',
      data: {},
    },
  })

  await prisma.document.createMany({
    data: [
      {
        clubId: clubValais.id,
        elementId: documentsElement.id,
        displayName: 'Club Statutes 2024',
        fileName: 'club-statutes-2024.pdf',
        fileType: 'application/pdf',
        fileSize: 245760,
        url: 'https://example.com/placeholder-statutes.pdf',
        position: 0,
      },
      {
        clubId: clubValais.id,
        elementId: documentsElement.id,
        displayName: 'Membership Form',
        fileName: 'membership-form.pdf',
        fileType: 'application/pdf',
        fileSize: 102400,
        url: 'https://example.com/placeholder-membership.pdf',
        position: 1,
      },
    ],
  })

  // contact element on contact page
  await prisma.pageElement.upsert({
    where: { id: 'valais-contact-contact' },
    update: {},
    create: {
      id: 'valais-contact-contact',
      pageId: contactPage.id,
      clubId: clubValais.id,
      position: 0,
      type: 'contact',
      data: {
        recipientEmail: 'contact@ski-club-valais.ch',
        fields: ['name', 'email', 'subject', 'message'],
      },
    },
  })

  console.log('✓ Page elements created for Ski Club Valais (all 6 element types)')

  // ─── Pages for Football Club Lausanne ─────────────────────────────────
  const lausanneHomePage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubLausanne.id, slug: 'home' } },
    update: {},
    create: { clubId: clubLausanne.id, slug: 'home', label: 'Home', isActive: true, isAnchor: true, position: 0 },
  })

  const lausanneCalendarPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubLausanne.id, slug: 'matches' } },
    update: {},
    create: { clubId: clubLausanne.id, slug: 'matches', label: 'Matches', isActive: true, position: 1 },
  })

  const lausanneGalleryPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubLausanne.id, slug: 'gallery' } },
    update: {},
    create: { clubId: clubLausanne.id, slug: 'gallery', label: 'Gallery', isActive: true, position: 2 },
  })

  const lausanneDocsPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubLausanne.id, slug: 'documents' } },
    update: {},
    create: { clubId: clubLausanne.id, slug: 'documents', label: 'Documents', isActive: true, position: 3 },
  })

  const lausanneContactPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubLausanne.id, slug: 'contact' } },
    update: {},
    create: { clubId: clubLausanne.id, slug: 'contact', label: 'Contact', isActive: true, isAnchor: true, position: 4 },
  })

  // rich_text + image on home page
  await prisma.pageElement.upsert({
    where: { id: 'lausanne-richtext-home' },
    update: {},
    create: {
      id: 'lausanne-richtext-home',
      pageId: lausanneHomePage.id,
      clubId: clubLausanne.id,
      position: 0,
      type: 'rich_text',
      data: {
        html: '<h2>Welcome to FC Lausanne</h2><p>Football Club Lausanne brings together players and supporters in the heart of Switzerland. Join us for training sessions, local matches, and community events.</p>',
      },
    },
  })

  await prisma.pageElement.upsert({
    where: { id: 'lausanne-image-home' },
    update: {},
    create: {
      id: 'lausanne-image-home',
      pageId: lausanneHomePage.id,
      clubId: clubLausanne.id,
      position: 1,
      type: 'image',
      data: {
        url: 'https://example.com/placeholder-football.jpg',
        alt: 'Football Club Lausanne players on the pitch',
        caption: 'Our team during the 2024 season',
      },
    },
  })

  // calendar element for matches
  const lausanneCalendarElement = await prisma.pageElement.upsert({
    where: { id: 'lausanne-calendar-matches' },
    update: {},
    create: {
      id: 'lausanne-calendar-matches',
      pageId: lausanneCalendarPage.id,
      clubId: clubLausanne.id,
      position: 0,
      type: 'calendar',
      data: {},
    },
  })

  await prisma.event.createMany({
    data: [
      {
        clubId: clubLausanne.id,
        elementId: lausanneCalendarElement.id,
        title: 'Home Match vs FC Berne',
        date: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        description: 'League match at Stade de la Pontaise.',
      },
      {
        clubId: clubLausanne.id,
        elementId: lausanneCalendarElement.id,
        title: 'Youth Tournament',
        date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
        description: 'Annual youth tournament for U12 and U15 teams.',
      },
    ],
  })

  // gallery element
  const lausanneGalleryElement = await prisma.pageElement.upsert({
    where: { id: 'lausanne-gallery-gallery' },
    update: {},
    create: {
      id: 'lausanne-gallery-gallery',
      pageId: lausanneGalleryPage.id,
      clubId: clubLausanne.id,
      position: 0,
      type: 'gallery',
      data: {},
    },
  })

  await prisma.galleryItem.createMany({
    data: [
      {
        clubId: clubLausanne.id,
        elementId: lausanneGalleryElement.id,
        url: 'https://example.com/placeholder-football-1.jpg',
        alt: 'Players celebrating a goal',
        type: 'image',
        position: 0,
      },
    ],
  })

  // documents element on documents page
  const lausanneDocumentsElement = await prisma.pageElement.upsert({
    where: { id: 'lausanne-documents-docs' },
    update: {},
    create: {
      id: 'lausanne-documents-docs',
      pageId: lausanneDocsPage.id,
      clubId: clubLausanne.id,
      position: 0,
      type: 'documents',
      data: {},
    },
  })

  await prisma.document.createMany({
    data: [
      {
        clubId: clubLausanne.id,
        elementId: lausanneDocumentsElement.id,
        displayName: 'Club Rules 2024',
        fileName: 'club-rules-2024.pdf',
        fileType: 'application/pdf',
        fileSize: 184320,
        url: 'https://example.com/placeholder-rules.pdf',
        position: 0,
      },
    ],
  })

  // contact element
  await prisma.pageElement.upsert({
    where: { id: 'lausanne-contact-contact' },
    update: {},
    create: {
      id: 'lausanne-contact-contact',
      pageId: lausanneContactPage.id,
      clubId: clubLausanne.id,
      position: 0,
      type: 'contact',
      data: {
        recipientEmail: 'contact@football-club-lausanne.ch',
        fields: ['name', 'email', 'subject', 'message'],
      },
    },
  })

  console.log('✓ Page elements created for Football Club Lausanne (all 6 element types)')

  // ─── Content Versions (3 per page, both clubs) ───────────────────────
  const valaisPages = [homePage, calendarPage, galleryPage, docsPage, contactPage]
  for (const page of valaisPages) {
    for (let v = 1; v <= 3; v++) {
      await prisma.contentVersion.create({
        data: {
          pageId: page.id,
          clubId: clubValais.id,
          createdBy: adminValais.id,
          snapshot: {
            version: v,
            page: { id: page.id, slug: page.slug, label: page.label },
            elements: [],
            savedAt: new Date(Date.now() - (4 - v) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      })
    }
  }

  const lausannePages = [lausanneHomePage, lausanneCalendarPage, lausanneGalleryPage, lausanneDocsPage, lausanneContactPage]
  for (const page of lausannePages) {
    for (let v = 1; v <= 3; v++) {
      await prisma.contentVersion.create({
        data: {
          pageId: page.id,
          clubId: clubLausanne.id,
          createdBy: adminLausanne.id,
          snapshot: {
            version: v,
            page: { id: page.id, slug: page.slug, label: page.label },
            elements: [],
            savedAt: new Date(Date.now() - (4 - v) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      })
    }
  }
  console.log('✓ Content versions created (3 per page, both clubs)')

  // ─── Applications (pending, approved, rejected) ───────────────────────
  await prisma.application.createMany({
    data: [
      {
        name: 'Mountaineering Club Geneva',
        activityType: 'mountaineering',
        description: 'A club dedicated to alpine mountaineering and rock climbing in the Geneva area.',
        email: 'contact@mountaineering-geneva.ch',
        status: 'pending',
      },
      {
        name: 'Tennis Club Lausanne West',
        activityType: 'tennis',
        description: 'Community tennis club for all skill levels in western Lausanne.',
        email: 'info@tennis-lausanne-west.ch',
        status: 'approved',
        reviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Extreme Sports Zurich',
        activityType: 'extreme_sports',
        description: 'Paragliding, base jumping, and wingsuit association.',
        email: 'admin@extreme-zurich.ch',
        status: 'rejected',
        rejectionReason: 'Platform currently focuses on non-extreme sports associations.',
        reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  })
  console.log('✓ Applications created (pending, approved, rejected)')

  // ─── Contact Submissions (5 encrypted) ───────────────────────────────
  const contactMessages = [
    { name: 'Sophie Martin', email: 'sophie.martin@example.com', subject: 'Membership inquiry', body: 'Hello, I would like to know more about joining your ski club. What are the membership fees and requirements?' },
    { name: 'Pierre Dupont', email: 'pierre.dupont@example.com', subject: 'Group booking', body: 'We are a group of 8 friends looking to participate in one of your guided ski tours. Do you offer group rates?' },
    { name: 'Anna Schmidt', email: 'anna.schmidt@example.com', subject: 'Junior training', body: 'My 12-year-old daughter is interested in joining your junior skiing program. What is the age minimum and skill level required?' },
    { name: 'Marc Weber', email: 'marc.weber@example.com', subject: 'Equipment rental', body: 'Do you have equipment rental available for members? We are traveling from Zurich and cannot bring our own skis.' },
    { name: 'Celine Blanc', email: 'celine.blanc@example.com', subject: 'Competition registration', body: 'I saw that you have an annual championship coming up. How can I register to participate?' },
  ]

  for (const msg of contactMessages) {
    const { ciphertext, iv } = encrypt(msg.body)
    await prisma.contactSubmission.create({
      data: {
        clubId: clubValais.id,
        senderName: msg.name,
        senderEmail: msg.email,
        subject: msg.subject,
        encryptedBody: ciphertext,
        iv,
        isRead: Math.random() > 0.5,
      },
    })
  }
  console.log('✓ Contact submissions created (5 encrypted)')

  // ─── Analytics Events (90 days) ────────────────────────────────────────
  const crypto = await import('crypto')
  const pageEvents: Array<{
    clubId: string
    pageSlug: string
    eventType: 'page_view' | 'contact_form_sent'
    country: string
    referrer: string | null
    ipHash: string
    visitedAt: Date
  }> = []

  for (let day = 89; day >= 0; day--) {
    const dayDate = new Date(now.getTime() - day * 24 * 60 * 60 * 1000)
    const dailySalt = dayDate.toISOString().split('T')[0] // YYYY-MM-DD as daily salt
    const eventsPerDay = Math.floor(Math.random() * 15) + 3 // 3–17 events per day

    for (let e = 0; e < eventsPerDay; e++) {
      const fakeIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      const ipHash = crypto
        .createHash('sha256')
        .update(`${fakeIp}:${dailySalt}`)
        .digest('hex')

      const pageSlugs = ['home', 'events', 'gallery', 'documents', 'contact']
      const pageSlug = pageSlugs[Math.floor(Math.random() * pageSlugs.length)]

      pageEvents.push({
        clubId: clubValais.id,
        pageSlug,
        eventType: Math.random() > 0.9 ? 'contact_form_sent' : 'page_view',
        country: 'ch',
        referrer: Math.random() > 0.7 ? null : 'google.com',
        ipHash,
        visitedAt: new Date(dayDate.getTime() + Math.random() * 86400000),
      })
    }
  }

  // Insert in batches to avoid timeout
  const batchSize = 100
  for (let i = 0; i < pageEvents.length; i += batchSize) {
    await prisma.pageEvent.createMany({ data: pageEvents.slice(i, i + batchSize) })
  }
  console.log(`✓ Analytics events created: ${pageEvents.length} events over 90 days`)

  // ─── Feature Flags ────────────────────────────────────────────────────
  await prisma.featureFlag.upsert({
    where: { key: 'registrations_enabled' },
    update: {},
    create: { key: 'registrations_enabled', value: true },
  })
  await prisma.featureFlag.upsert({
    where: { key: 'maintenance_mode' },
    update: {},
    create: { key: 'maintenance_mode', value: false },
  })
  await prisma.featureFlag.upsert({
    where: { key: 'max_pages_per_club' },
    update: {},
    create: { key: 'max_pages_per_club', value: 5 },
  })
  console.log('✓ Feature flags seeded')

  console.log('\n🎉 Seed complete!')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
