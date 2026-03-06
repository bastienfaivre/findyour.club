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
    where: { email: 'admin@platform-name.com' },
    update: { passwordHash: operatorPasswordHash },
    create: {
      email: 'admin@platform-name.com',
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

  const adminZurich = await prisma.user.upsert({
    where: { email: 'admin@bergclub-zurich.ch' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'admin@bergclub-zurich.ch',
      name: 'Bergclub Zürich Admin',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  // ─── Swiss Cantons ───────────────────────────────────────────────────
  const cantons: Array<{ code: string; de: string; fr: string; it: string; en: string }> = [
    { code: 'AG', de: 'Aargau', fr: 'Argovie', it: 'Argovia', en: 'Aargau' },
    { code: 'AI', de: 'Appenzell Innerrhoden', fr: 'Appenzell Rhodes-Intérieures', it: 'Appenzello Interno', en: 'Appenzell Inner Rhodes' },
    { code: 'AR', de: 'Appenzell Ausserrhoden', fr: 'Appenzell Rhodes-Extérieures', it: 'Appenzello Esterno', en: 'Appenzell Outer Rhodes' },
    { code: 'BE', de: 'Bern', fr: 'Berne', it: 'Berna', en: 'Bern' },
    { code: 'BL', de: 'Basel-Landschaft', fr: 'Bâle-Campagne', it: 'Basilea Campagna', en: 'Basel-Country' },
    { code: 'BS', de: 'Basel-Stadt', fr: 'Bâle-Ville', it: 'Basilea Città', en: 'Basel-City' },
    { code: 'FR', de: 'Freiburg', fr: 'Fribourg', it: 'Friburgo', en: 'Fribourg' },
    { code: 'GE', de: 'Genf', fr: 'Genève', it: 'Ginevra', en: 'Geneva' },
    { code: 'GL', de: 'Glarus', fr: 'Glaris', it: 'Glarona', en: 'Glarus' },
    { code: 'GR', de: 'Graubünden', fr: 'Grisons', it: 'Grigioni', en: 'Graubünden' },
    { code: 'JU', de: 'Jura', fr: 'Jura', it: 'Giura', en: 'Jura' },
    { code: 'LU', de: 'Luzern', fr: 'Lucerne', it: 'Lucerna', en: 'Lucerne' },
    { code: 'NE', de: 'Neuenburg', fr: 'Neuchâtel', it: 'Neuchâtel', en: 'Neuchâtel' },
    { code: 'NW', de: 'Nidwalden', fr: 'Nidwald', it: 'Nidvaldo', en: 'Nidwalden' },
    { code: 'OW', de: 'Obwalden', fr: 'Obwald', it: 'Obvaldo', en: 'Obwalden' },
    { code: 'SG', de: 'St. Gallen', fr: 'Saint-Gall', it: 'San Gallo', en: 'St. Gallen' },
    { code: 'SH', de: 'Schaffhausen', fr: 'Schaffhouse', it: 'Sciaffusa', en: 'Schaffhausen' },
    { code: 'SO', de: 'Solothurn', fr: 'Soleure', it: 'Soletta', en: 'Solothurn' },
    { code: 'SZ', de: 'Schwyz', fr: 'Schwytz', it: 'Svitto', en: 'Schwyz' },
    { code: 'TG', de: 'Thurgau', fr: 'Thurgovie', it: 'Turgovia', en: 'Thurgau' },
    { code: 'TI', de: 'Tessin', fr: 'Tessin', it: 'Ticino', en: 'Ticino' },
    { code: 'UR', de: 'Uri', fr: 'Uri', it: 'Uri', en: 'Uri' },
    { code: 'VD', de: 'Waadt', fr: 'Vaud', it: 'Vaud', en: 'Vaud' },
    { code: 'VS', de: 'Wallis', fr: 'Valais', it: 'Vallese', en: 'Valais' },
    { code: 'ZG', de: 'Zug', fr: 'Zoug', it: 'Zugo', en: 'Zug' },
    { code: 'ZH', de: 'Zürich', fr: 'Zurich', it: 'Zurigo', en: 'Zurich' },
  ]

  for (const canton of cantons) {
    await prisma.swissCanton.upsert({
      where: { code: canton.code },
      update: {},
      create: {
        code: canton.code,
        translations: {
          createMany: {
            data: [
              { language: 'de', name: canton.de },
              { language: 'fr', name: canton.fr },
              { language: 'it', name: canton.it },
              { language: 'en', name: canton.en },
            ],
            skipDuplicates: true,
          },
        },
      },
    })
  }
  console.log('✓ Swiss cantons seeded (26 cantons, 4 languages each)')

  // ─── Activity Types ───────────────────────────────────────────────────
  const activitySkiing = await prisma.activityType.upsert({
    where: { slug: 'skiing' },
    update: {},
    create: { name: 'Skiing', slug: 'skiing', createdBy: operator.id },
  })

  const activityFootball = await prisma.activityType.upsert({
    where: { slug: 'football' },
    update: {},
    create: { name: 'Football', slug: 'football', createdBy: operator.id },
  })

  const activityMountaineering = await prisma.activityType.upsert({
    where: { slug: 'mountaineering' },
    update: {},
    create: { name: 'Mountaineering', slug: 'mountaineering', createdBy: operator.id },
  })

  const activityTennis = await prisma.activityType.upsert({
    where: { slug: 'tennis' },
    update: {},
    create: { name: 'Tennis', slug: 'tennis', createdBy: operator.id },
  })

  await prisma.activityType.upsert({
    where: { slug: 'hiking' },
    update: {},
    create: { name: 'Hiking', slug: 'hiking', createdBy: operator.id },
  })

  await prisma.activityType.upsert({
    where: { slug: 'cycling' },
    update: {},
    create: { name: 'Cycling', slug: 'cycling', createdBy: operator.id },
  })

  await prisma.activityType.upsert({
    where: { slug: 'swimming' },
    update: {},
    create: { name: 'Swimming', slug: 'swimming', createdBy: operator.id },
  })

  await prisma.activityType.upsert({
    where: { slug: 'volleyball' },
    update: {},
    create: { name: 'Volleyball', slug: 'volleyball', createdBy: operator.id },
  })

  await prisma.activityType.upsert({
    where: { slug: 'basketball' },
    update: {},
    create: { name: 'Basketball', slug: 'basketball', createdBy: operator.id },
  })

  await prisma.activityType.upsert({
    where: { slug: 'ice-hockey' },
    update: {},
    create: { name: 'Ice Hockey', slug: 'ice-hockey', createdBy: operator.id },
  })

  await prisma.activityType.upsert({
    where: { slug: 'climbing' },
    update: {},
    create: { name: 'Climbing', slug: 'climbing', createdBy: operator.id },
  })

  await prisma.activityType.upsert({
    where: { slug: 'yoga' },
    update: {},
    create: { name: 'Yoga', slug: 'yoga', createdBy: operator.id },
  })

  await prisma.activityType.upsert({
    where: { slug: 'running' },
    update: {},
    create: { name: 'Running', slug: 'running', createdBy: operator.id },
  })

  await prisma.activityType.upsert({
    where: { slug: 'badminton' },
    update: {},
    create: { name: 'Badminton', slug: 'badminton', createdBy: operator.id },
  })

  console.log('✓ Activity types created')

  // ─── Locations (SwissLocation → Location) ─────────────────────────────
  // Sion (VS) for Ski Club Valais
  const sionSwissLoc = await prisma.swissLocation.upsert({
    where: { swisstopoId: '6266' },
    update: {},
    create: {
      swisstopoId: '6266',
      plz: '1950',
      cantonCode: 'VS',
      translations: {
        createMany: {
          data: [
            { language: 'fr', name: 'Sion' },
            { language: 'de', name: 'Sitten' },
            { language: 'it', name: 'Sion' },
            { language: 'en', name: 'Sion' },
          ],
          skipDuplicates: true,
        },
      },
    },
  })
  const locationSion = await prisma.location.upsert({
    where: { swissLocationId: sionSwissLoc.id },
    update: {},
    create: { country: 'ch', swissLocationId: sionSwissLoc.id },
  })

  // Lausanne (VD) for Football Club Lausanne
  const lausanneSwissLoc = await prisma.swissLocation.upsert({
    where: { swisstopoId: '5586' },
    update: {},
    create: {
      swisstopoId: '5586',
      plz: '1000',
      cantonCode: 'VD',
      translations: {
        createMany: {
          data: [
            { language: 'fr', name: 'Lausanne' },
            { language: 'de', name: 'Lausanne' },
            { language: 'it', name: 'Losanna' },
            { language: 'en', name: 'Lausanne' },
          ],
          skipDuplicates: true,
        },
      },
    },
  })
  const locationLausanne = await prisma.location.upsert({
    where: { swissLocationId: lausanneSwissLoc.id },
    update: {},
    create: { country: 'ch', swissLocationId: lausanneSwissLoc.id },
  })

  // Zürich (ZH) for Bergclub Zürich
  const zurichSwissLoc = await prisma.swissLocation.upsert({
    where: { swisstopoId: '261' },
    update: {},
    create: {
      swisstopoId: '261',
      plz: '8001',
      cantonCode: 'ZH',
      translations: {
        createMany: {
          data: [
            { language: 'fr', name: 'Zurich' },
            { language: 'de', name: 'Zürich' },
            { language: 'it', name: 'Zurigo' },
            { language: 'en', name: 'Zurich' },
          ],
          skipDuplicates: true,
        },
      },
    },
  })
  const locationZurich = await prisma.location.upsert({
    where: { swissLocationId: zurichSwissLoc.id },
    update: {},
    create: { country: 'ch', swissLocationId: zurichSwissLoc.id },
  })

  console.log('✓ Locations created (Sion/VS, Lausanne/VD, Zürich/ZH)')

  // ─── Clubs ────────────────────────────────────────────────────────────
  const clubValais = await prisma.club.upsert({
    where: { slug_country: { slug: 'ski-club-valais', country: 'ch' } },
    update: { locationId: locationSion.id },
    create: {
      name: 'Ski Club Valais',
      slug: 'ski-club-valais',
      country: 'ch',
      status: 'ACTIVE',
      activityTypeId: activitySkiing.id,
      locationId: locationSion.id,
      email: 'contact@ski-club-valais.ch',
      welcomeText: 'Welcome to Ski Club Valais — your home for alpine skiing in the heart of the Valais region.',
      accentColor: 'blue',
      defaultLanguage: 'fr',
      storageUsedBytes: BigInt(0),
      storageLimitBytes: BigInt(5368709120), // 5 GB
    },
  })

  const clubLausanne = await prisma.club.upsert({
    where: { slug_country: { slug: 'football-club-lausanne', country: 'ch' } },
    update: { locationId: locationLausanne.id },
    create: {
      name: 'Football Club Lausanne',
      slug: 'football-club-lausanne',
      country: 'ch',
      status: 'ACTIVE',
      activityTypeId: activityFootball.id,
      locationId: locationLausanne.id,
      email: 'contact@football-club-lausanne.ch',
      welcomeText: 'Welcome to Football Club Lausanne — passion, teamwork, and community on the pitch.',
      accentColor: 'green',
      defaultLanguage: 'fr',
      storageUsedBytes: BigInt(0),
      storageLimitBytes: BigInt(5368709120),
    },
  })

  const clubZurich = await prisma.club.upsert({
    where: { slug_country: { slug: 'bergclub-zurich', country: 'ch' } },
    update: { locationId: locationZurich.id },
    create: {
      name: 'Bergclub Zürich',
      slug: 'bergclub-zurich',
      country: 'ch',
      status: 'ACTIVE',
      activityTypeId: activityMountaineering.id,
      locationId: locationZurich.id,
      email: 'contact@bergclub-zurich.ch',
      welcomeText: 'Willkommen beim Bergclub Zürich — Bergsteigen, Klettern und Wandern in und um Zürich.',
      accentColor: 'violet',
      defaultLanguage: 'de',
      storageUsedBytes: BigInt(0),
      storageLimitBytes: BigInt(5368709120),
    },
  })

  // Link each club admin as OWNER via ClubMembership (ADR-001: no clubId on User)
  await prisma.clubMembership.upsert({
    where: { userId_clubId: { userId: adminValais.id, clubId: clubValais.id } },
    update: {},
    create: { userId: adminValais.id, clubId: clubValais.id, role: 'OWNER', status: 'ACTIVE', invitedBy: null, joinedAt: new Date() },
  })
  await prisma.clubMembership.upsert({
    where: { userId_clubId: { userId: adminLausanne.id, clubId: clubLausanne.id } },
    update: {},
    create: { userId: adminLausanne.id, clubId: clubLausanne.id, role: 'OWNER', status: 'ACTIVE', invitedBy: null, joinedAt: new Date() },
  })
  await prisma.clubMembership.upsert({
    where: { userId_clubId: { userId: adminZurich.id, clubId: clubZurich.id } },
    update: {},
    create: { userId: adminZurich.id, clubId: clubZurich.id, role: 'OWNER', status: 'ACTIVE', invitedBy: null, joinedAt: new Date() },
  })

  console.log('✓ Clubs created:', clubValais.slug, clubLausanne.slug, clubZurich.slug)

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

  // ─── Pages for Bergclub Zürich ──────────────────────────────────────
  const zurichHomePage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubZurich.id, slug: 'home' } },
    update: {},
    create: { clubId: clubZurich.id, slug: 'home', label: 'Home', isActive: true, isAnchor: true, position: 0 },
  })

  await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubZurich.id, slug: 'touren' } },
    update: {},
    create: { clubId: clubZurich.id, slug: 'touren', label: 'Touren', isActive: true, position: 1 },
  })

  await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubZurich.id, slug: 'gallery' } },
    update: {},
    create: { clubId: clubZurich.id, slug: 'gallery', label: 'Galerie', isActive: true, position: 2 },
  })

  const zurichContactPage = await prisma.page.upsert({
    where: { clubId_slug: { clubId: clubZurich.id, slug: 'contact' } },
    update: {},
    create: { clubId: clubZurich.id, slug: 'contact', label: 'Kontakt', isActive: true, isAnchor: true, position: 3 },
  })

  await prisma.pageElement.upsert({
    where: { id: 'zurich-richtext-home' },
    update: {},
    create: {
      id: 'zurich-richtext-home',
      pageId: zurichHomePage.id,
      clubId: clubZurich.id,
      position: 0,
      type: 'rich_text',
      data: {
        html: '<h2>Über uns</h2><p>Der Bergclub Zürich wurde 1968 gegründet und organisiert Bergtouren, Kletterausflüge und Wanderungen in den Schweizer Alpen und im Zürcher Oberland.</p>',
      },
    },
  })

  await prisma.pageElement.upsert({
    where: { id: 'zurich-contact-contact' },
    update: {},
    create: {
      id: 'zurich-contact-contact',
      pageId: zurichContactPage.id,
      clubId: clubZurich.id,
      position: 0,
      type: 'contact',
      data: {
        recipientEmail: 'contact@bergclub-zurich.ch',
        fields: ['name', 'email', 'subject', 'message'],
      },
    },
  })

  console.log('✓ Pages and elements created for Bergclub Zürich')

  // ─── Content Versions (3 per page, all clubs) ──────────────────────
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

  const zurichPages = [zurichHomePage, zurichContactPage]
  for (const page of zurichPages) {
    for (let v = 1; v <= 3; v++) {
      await prisma.contentVersion.create({
        data: {
          pageId: page.id,
          clubId: clubZurich.id,
          createdBy: adminZurich.id,
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
  console.log('✓ Content versions created (3 per page, all clubs)')

  // ─── Applications (PENDING, APPROVED, REJECTED) ───────────────────────
  await prisma.application.createMany({
    data: [
      {
        name: 'Mountaineering Club Geneva',
        country: 'ch',
        activityTypeId: activityMountaineering.id,
        description: 'A club dedicated to alpine mountaineering and rock climbing in the Geneva area.',
        email: 'contact@mountaineering-geneva.ch',
        status: 'PENDING',
      },
      {
        name: 'Tennis Club Lausanne West',
        country: 'ch',
        activityTypeId: activityTennis.id,
        description: 'Community tennis club for all skill levels in western Lausanne.',
        email: 'info@tennis-lausanne-west.ch',
        status: 'APPROVED',
        reviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        name: 'Extreme Sports Zurich',
        country: 'ch',
        otherDescription: 'Paragliding, base jumping, and wingsuit association.',
        description: 'Extreme sports association focused on aerial disciplines.',
        email: 'admin@extreme-zurich.ch',
        status: 'REJECTED',
        rejectionReason: 'Platform currently focuses on non-extreme sports associations.',
        reviewedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    ],
  })
  console.log('✓ Applications created (PENDING, APPROVED, REJECTED)')

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
