import { PrismaClient } from '../src/generated/prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import argon2 from 'argon2'
import 'dotenv/config'
import { encrypt } from '../src/lib/crypto'

// Seed needs a raw PrismaClient without the clubId middleware
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
      firstName: 'Platform',
      lastName: 'Operator',
      preferredLanguage: 'en',
      role: 'OPERATOR',
      passwordHash: operatorPasswordHash,
      totpEnabled: false,
    },
  })
  console.log('✓ Operator created:', operator.email)

  // ─── Club Admin Accounts ─────────────────────────────────────────────
  const adminPasswordHash = await argon2.hash('admin123')

  const adminValais = await prisma.user.upsert({
    where: { email: 'jean.favre@ski-club-valais.ch' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'jean.favre@ski-club-valais.ch',
      name: 'Jean Favre',
      firstName: 'Jean',
      lastName: 'Favre',
      phone: '+41 27 322 55 01',
      preferredLanguage: 'fr',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  const adminLausanne = await prisma.user.upsert({
    where: { email: 'marc.bonvin@fc-lausanne-sport.ch' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'marc.bonvin@fc-lausanne-sport.ch',
      name: 'Marc Bonvin',
      firstName: 'Marc',
      lastName: 'Bonvin',
      phone: '+41 21 316 42 01',
      preferredLanguage: 'fr',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  const adminZurich = await prisma.user.upsert({
    where: { email: 'hans.mueller@bergclub-zurich.ch' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'hans.mueller@bergclub-zurich.ch',
      name: 'Hans Müller',
      firstName: 'Hans',
      lastName: 'Müller',
      phone: '+41 44 211 33 01',
      preferredLanguage: 'de',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  const adminGeneva = await prisma.user.upsert({
    where: { email: 'claire.dumont@aviron-geneve.ch' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'claire.dumont@aviron-geneve.ch',
      name: 'Claire Dumont',
      firstName: 'Claire',
      lastName: 'Dumont',
      phone: '+41 22 786 12 35',
      preferredLanguage: 'fr',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  const adminBern = await prisma.user.upsert({
    where: { email: 'lukas.gerber@turnverein-bern.ch' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'lukas.gerber@turnverein-bern.ch',
      name: 'Lukas Gerber',
      firstName: 'Lukas',
      lastName: 'Gerber',
      phone: '+41 31 302 88 01',
      preferredLanguage: 'de',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  const editorValais = await prisma.user.upsert({
    where: { email: 'sophie.martin@ski-club-valais.ch' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'sophie.martin@ski-club-valais.ch',
      name: 'Sophie Martin',
      firstName: 'Sophie',
      lastName: 'Martin',
      preferredLanguage: 'fr',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  console.log('✓ Club admin accounts created (5 owners + 1 editor)')

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

  // ─── Locations ───────────────────────────────────────────────────────
  async function createSwissLocation(
    swisstopoId: string,
    plz: string,
    cantonCode: string,
    names: { fr: string; de: string; it: string; en: string },
  ) {
    const swissLoc = await prisma.swissLocation.upsert({
      where: { swisstopoId },
      update: {},
      create: {
        swisstopoId,
        plz,
        cantonCode,
        translations: {
          createMany: {
            data: [
              { language: 'fr', name: names.fr },
              { language: 'de', name: names.de },
              { language: 'it', name: names.it },
              { language: 'en', name: names.en },
            ],
            skipDuplicates: true,
          },
        },
      },
    })
    const location = await prisma.location.upsert({
      where: { swissLocationId: swissLoc.id },
      update: {},
      create: { country: 'ch', swissLocationId: swissLoc.id },
    })
    return location
  }

  const locationSion = await createSwissLocation('6266', '1950', 'VS', {
    fr: 'Sion', de: 'Sitten', it: 'Sion', en: 'Sion',
  })
  const locationLausanne = await createSwissLocation('5586', '1000', 'VD', {
    fr: 'Lausanne', de: 'Lausanne', it: 'Losanna', en: 'Lausanne',
  })
  const locationZurich = await createSwissLocation('261', '8001', 'ZH', {
    fr: 'Zurich', de: 'Zürich', it: 'Zurigo', en: 'Zurich',
  })
  const locationGeneva = await createSwissLocation('6621', '1200', 'GE', {
    fr: 'Genève', de: 'Genf', it: 'Ginevra', en: 'Geneva',
  })
  const locationBern = await createSwissLocation('351', '3000', 'BE', {
    fr: 'Berne', de: 'Bern', it: 'Berna', en: 'Bern',
  })

  console.log('✓ Locations created (Sion, Lausanne, Zurich, Geneva, Bern)')

  // ─── Clubs (5 fully populated clubs) ─────────────────────────────────
  const clubValais = await prisma.club.upsert({
    where: { slug_country: { slug: 'ski-club-valais', country: 'ch' } },
    update: { locationId: locationSion.id, logoUrl: 'https://ui-avatars.com/api/?name=Ski+Club+Valais&background=2563eb&color=fff&size=200&bold=true', logoAlt: 'Ski Club Valais logo' },
    create: {
      name: 'Ski Club Valais',
      slug: 'ski-club-valais',
      country: 'ch',
      status: 'ACTIVE',
      activityType: 'skiing',
      locationId: locationSion.id,
      email: 'contact@ski-club-valais.ch',
      logoUrl: 'https://ui-avatars.com/api/?name=Ski+Club+Valais&background=2563eb&color=fff&size=200&bold=true',
      logoAlt: 'Ski Club Valais logo',
      description: 'Le Ski Club Valais, c\'est 70 ans de passion pour la montagne. On a trois groupes : les enfants dès 6 ans qui apprennent les bases dans la bonne humeur, les juniors qui s\'entraînent sérieusement pour les compétitions régionales, et les adultes qui sortent ensemble chaque week-end pour le plaisir. On ski en français, mais si tu parles une autre langue, viens quand même — la neige s\'en fiche.',
      schedule: 'Enfants (6–12 ans) : mercredis 14h–16h et samedis matin 9h–11h, pistes de Crans-Montana.\nJuniors (13–17 ans) : mardis et jeudis 17h–19h, plus les week-ends en compétition.\nAdultes : sorties en groupe chaque samedi à 9h — la destination change selon la météo. On s\'organise via notre groupe WhatsApp, demande-nous de t\'ajouter quand tu viens.',
      howToJoin: 'Viens à une séance d\'essai gratuite avec ton équipement, on s\'occupe du reste. Pas de skis ? Dis-le-nous à l\'avance, on peut t\'aider. La cotisation annuelle est de CHF 150 pour les adultes et CHF 80 pour les juniors. Pas encore prêt·e à sauter le pas ? Envoie-nous un message sur Instagram — tu trouveras le lien dans la section contact en bas de page.',
      contactPhone: '+41 27 322 55 00',
      contactAddress: 'Rue de Lausanne 12\n1950 Sion\nSuisse',
      externalWebsiteUrl: 'https://ski-club-valais.ch',
      instagramUrl: 'https://instagram.com/skiclubvalais',
      facebookUrl: 'https://facebook.com/skiclubvalais',
      youtubeUrl: 'https://youtube.com/@skiclubvalais',
      lastVerifiedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago — healthy
      isPublished: true,
      forceOffline: false,
      accentColor: 'blue',
      defaultLanguage: 'fr',
      storageUsedBytes: BigInt(52428800),
      storageLimitBytes: BigInt(5368709120),
    },
  })

  const clubLausanne = await prisma.club.upsert({
    where: { slug_country: { slug: 'fc-lausanne-sport', country: 'ch' } },
    update: { locationId: locationLausanne.id, logoUrl: 'https://ui-avatars.com/api/?name=FC+Lausanne+Sport&background=16a34a&color=fff&size=200&bold=true', logoAlt: 'FC Lausanne Sport logo' },
    create: {
      name: 'FC Lausanne Sport',
      slug: 'fc-lausanne-sport',
      country: 'ch',
      status: 'ACTIVE',
      activityType: 'football',
      locationId: locationLausanne.id,
      email: 'info@fc-lausanne-sport.ch',
      logoUrl: 'https://ui-avatars.com/api/?name=FC+Lausanne+Sport&background=16a34a&color=fff&size=200&bold=true',
      logoAlt: 'FC Lausanne Sport logo',
      description: 'FC Lausanne Sport, c\'est quatre équipes, quatre ambiances. Les U8–U12 découvrent le foot dans la joie les mercredis après-midi. Les U13–U16 s\'entraînent dur et jouent le championnat régional. L\'équipe adulte mixte joue pour le plaisir, pas pour la gloire. Et les vétérans (35+) prouvent que le foot, ça ne s\'arrête jamais. On est un club francophone, mais si tu ne parles pas encore français, viens quand même — le ballon, lui, comprend tout le monde.',
      schedule: 'U8–U12 : mercredis 14h–16h, terrain synthétique de la Pontaise.\nU13–U16 : mardis et jeudis 17h30–19h30, même terrain.\nAdultes : mardis et jeudis 20h–22h, plus les matchs le samedi.\nVétérans (35+) : dimanches matin 10h–12h. On a un groupe WhatsApp pour chaque équipe — demande-nous d\'être ajouté quand tu viens.',
      howToJoin: 'Pointe-toi à un entraînement, aucune inscription nécessaire. Si tu veux rester, la cotisation est de CHF 200/an pour les adultes et CHF 100/an pour les moins de 18 ans — l\'équipement est fourni la première saison. Pas encore sûr·e ? Envoie-nous un message sur Instagram, on t\'explique tout — le lien est dans la section contact en bas.',
      contactPhone: '+41 21 316 42 00',
      contactAddress: 'Chemin de la Prairie 8\n1007 Lausanne\nSuisse',
      externalWebsiteUrl: 'https://fc-lausanne-sport.ch',
      instagramUrl: 'https://instagram.com/fclausannesport',
      xUrl: 'https://x.com/fclausannesport',
      tiktokUrl: 'https://tiktok.com/@fclausannesport',
      discordUrl: 'https://discord.gg/fclausanne',
      lastVerifiedAt: new Date(Date.now() - 83 * 24 * 60 * 60 * 1000), // 83 days ago — approaching
      isPublished: true,
      forceOffline: false,
      accentColor: 'green',
      defaultLanguage: 'fr',
      storageUsedBytes: BigInt(31457280),
      storageLimitBytes: BigInt(5368709120),
    },
  })

  const clubZurich = await prisma.club.upsert({
    where: { slug_country: { slug: 'bergclub-zurich', country: 'ch' } },
    update: { locationId: locationZurich.id, logoUrl: 'https://ui-avatars.com/api/?name=Bergclub+Z%C3%BCrich&background=7c3aed&color=fff&size=200&bold=true', logoAlt: 'Bergclub Zürich logo' },
    create: {
      name: 'Bergclub Zürich',
      slug: 'bergclub-zurich',
      country: 'ch',
      status: 'ACTIVE',
      activityType: 'mountaineering',
      locationId: locationZurich.id,
      email: 'info@bergclub-zurich.ch',
      logoUrl: 'https://ui-avatars.com/api/?name=Bergclub+Z%C3%BCrich&background=7c3aed&color=fff&size=200&bold=true',
      logoAlt: 'Bergclub Zürich logo',
      description: 'Bergclub Zürich ist mehr als ein Verein — es sind drei Gruppen mit drei verschiedenen Tempos. Die Einsteiger-Gruppe macht gemütliche Tagestouren und lernt die Grundlagen des Berggehens. Die Fortgeschrittenen wagen sich an Klettersteige und leichte Hochtouren. Und die Alpinisten planen anspruchsvolle Mehrtagestouren im Sommer und Skitourengehen im Winter. Wenn du Lust auf die Berge hast, ist bei uns garantiert eine Gruppe dabei, die zu dir passt.',
      schedule: 'Einsteiger-Gruppe: jeden zweiten Sonntag, Tagestouren im Zürcher Oberland — Treffpunkt je nach Tour.\nFortgeschrittene & Alpinisten: jeden zweiten Samstag, Ziele werden kurzfristig per WhatsApp kommuniziert.\nKlettertraining für alle: montags 19–21 Uhr in der Kletterhalle Gaswerk, Zürich.\nStammtisch: erster Mittwoch im Monat im Zeughauskeller — alle sind willkommen.',
      howToJoin: 'Komm einfach zum nächsten Stammtisch oder Klettertraining — keine Voranmeldung nötig. Eine Schnuppertour ist gratis. Wenn es passt, beträgt der Jahresbeitrag CHF 120 für Erwachsene und CHF 60 für Studierende. Noch unentschlossen? Schreib uns eine Nachricht auf Instagram — den Link findest du im Kontaktbereich unten.',
      contactPhone: '+41 44 211 33 00',
      contactAddress: 'Bahnhofstrasse 45\n8001 Zürich\nSchweiz',
      externalWebsiteUrl: 'https://bergclub-zurich.ch',
      facebookUrl: 'https://facebook.com/bergclubzurich',
      youtubeUrl: 'https://youtube.com/@bergclubzurich',
      whatsappUrl: 'https://chat.whatsapp.com/bergclubzurich',
      githubUrl: 'https://github.com/bergclub-zurich',
      lastVerifiedAt: new Date(Date.now() - 95 * 24 * 60 * 60 * 1000), // 95 days ago — expired
      isPublished: true,
      forceOffline: false,
      accentColor: 'violet',
      defaultLanguage: 'de',
      storageUsedBytes: BigInt(41943040),
      storageLimitBytes: BigInt(5368709120),
    },
  })

  const clubGeneva = await prisma.club.upsert({
    where: { slug_country: { slug: 'aviron-geneve', country: 'ch' } },
    update: { locationId: locationGeneva.id, logoUrl: 'https://ui-avatars.com/api/?name=Aviron+Gen%C3%A8ve&background=f97316&color=fff&size=200&bold=true', logoAlt: 'Aviron Genève logo' },
    create: {
      name: 'Aviron Genève',
      slug: 'aviron-geneve',
      country: 'ch',
      status: 'ACTIVE',
      activityType: 'rowing',
      locationId: locationGeneva.id,
      email: 'contact@aviron-geneve.ch',
      logoUrl: 'https://ui-avatars.com/api/?name=Aviron+Gen%C3%A8ve&background=f97316&color=fff&size=200&bold=true',
      logoAlt: 'Aviron Genève logo',
      description: 'L\'Aviron Genève, c\'est 150 ans de rame sur le Léman. On a trois groupes bien distincts : les débutants qui découvrent l\'aviron avec nos moniteurs brevetés (aucune expérience requise), les loisirs qui rament pour le plaisir et la forme, et les compétiteurs qui s\'entraînent sérieusement pour les régates suisses et européennes. Notre hangar à bateaux est aux Eaux-Vives, à deux pas du lac. On s\'entraîne en français, mais on accueille volontiers les anglophones et les italophones — notre équipe est internationale.',
      schedule: 'Cours débutants : samedis 9h–12h (par groupes de 8, inscription requise).\nLoisirs : mardis et jeudis 18h–20h, plus sorties libres le samedi matin.\nCompétition : lundis, mercredis et vendredis dès 6h30 — le programme est intense mais la vue sur le Léman au lever du soleil vaut tout. Les créneaux sont confirmés via notre groupe WhatsApp la veille.',
      howToJoin: 'Commence par un cours d\'initiation — 4 séances pour CHF 80, aucune expérience nécessaire. Un test de natation (200m) est obligatoire pour des raisons de sécurité. Si tu accroches, la cotisation annuelle est de CHF 350 pour les adultes et CHF 180 pour les juniors. Des questions ? Envoie-nous un message sur Instagram — le lien est dans la section contact ci-dessous.',
      contactPhone: '+41 22 786 12 34',
      contactAddress: 'Quai Gustave-Ador 44\n1207 Genève\nSuisse',
      externalWebsiteUrl: 'https://aviron-geneve.ch',
      instagramUrl: 'https://instagram.com/avirongeneve',
      facebookUrl: 'https://facebook.com/avirongeneve',
      xUrl: 'https://x.com/avirongeneve',
      telegramUrl: 'https://t.me/avirongeneve',
      lastVerifiedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000), // 45 days ago — healthy
      isPublished: true,
      forceOffline: false,
      accentColor: 'orange',
      defaultLanguage: 'fr',
      storageUsedBytes: BigInt(15728640),
      storageLimitBytes: BigInt(5368709120),
    },
  })

  const clubBern = await prisma.club.upsert({
    where: { slug_country: { slug: 'turnverein-bern', country: 'ch' } },
    update: { locationId: locationBern.id, logoUrl: 'https://ui-avatars.com/api/?name=Turnverein+Bern&background=e11d48&color=fff&size=200&bold=true', logoAlt: 'Turnverein Bern logo' },
    create: {
      name: 'Turnverein Bern',
      slug: 'turnverein-bern',
      country: 'ch',
      status: 'ACTIVE',
      activityType: 'gymnastics',
      locationId: locationBern.id,
      email: 'info@turnverein-bern.ch',
      logoUrl: 'https://ui-avatars.com/api/?name=Turnverein+Bern&background=e11d48&color=fff&size=200&bold=true',
      logoAlt: 'Turnverein Bern logo',
      description: 'Turnverein Bern — 160 Jahre und immer noch auf den Beinen. Wir haben vier aktive Gruppen: das Kinderturnen für die Kleinen ab 6 Jahren, bei dem Spass und Bewegung im Vordergrund stehen; die Jugendgruppe (13–17) mit Wettkampftraining am Gerät; die Erwachsenengruppe für Geräteturnen und Akrobatik; und unsere Trampolin-Sektion, die für alle offen ist. Anfänger sind genauso willkommen wie Fortgeschrittene — es gibt immer eine passende Gruppe.',
      schedule: 'Kinderturnen (6–12 J.): dienstags 17–18:30 Uhr, Sporthalle Länggasse.\nJugend (13–17 J.): montags und mittwochs 18–20 Uhr, gleiche Halle.\nErwachsene Geräteturnen: montags 20–22 Uhr.\nTrampolin & Akrobatik (alle Altersgruppen): donnerstags 19–21 Uhr.\nOffenes Training: samstags 10–12 Uhr — komm einfach vorbei, kein Training wie das andere.',
      howToJoin: 'Die ersten drei Trainings sind kostenlos — komm einfach vorbei, keine Anmeldung nötig. Wenn du bleiben möchtest, beträgt der Jahresbeitrag CHF 180 für Erwachsene und CHF 90 für Kinder und Jugendliche. Keine Turnerfahrung nötig, wir fangen gerne von Null an. Noch Fragen? Schreib uns auf Instagram — den Link findest du im Kontaktbereich unten.',
      contactPhone: '+41 31 302 88 00',
      contactAddress: 'Länggassstrasse 21\n3012 Bern\nSchweiz',
      externalWebsiteUrl: 'https://turnverein-bern.ch',
      instagramUrl: 'https://instagram.com/turnvereinbern',
      tiktokUrl: 'https://tiktok.com/@turnvereinbern',
      youtubeUrl: 'https://youtube.com/@turnvereinbern',
      discordUrl: 'https://discord.gg/turnvereinbern',
      whatsappUrl: 'https://chat.whatsapp.com/turnvereinbern',
      lastVerifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago — healthy
      isPublished: true,
      forceOffline: false,
      accentColor: 'rose',
      defaultLanguage: 'de',
      storageUsedBytes: BigInt(20971520),
      storageLimitBytes: BigInt(5368709120),
    },
  })

  console.log('✓ Clubs created:', [clubValais, clubLausanne, clubZurich, clubGeneva, clubBern].map((c) => c.slug).join(', '))

  // ─── Club Memberships ─────────────────────────────────────────────────
  await prisma.clubMembership.upsert({
    where: { userId_clubId: { userId: adminValais.id, clubId: clubValais.id } },
    update: {},
    create: { userId: adminValais.id, clubId: clubValais.id, role: 'OWNER', status: 'ACTIVE', invitedBy: null, joinedAt: new Date() },
  })
  await prisma.clubMembership.upsert({
    where: { userId_clubId: { userId: editorValais.id, clubId: clubValais.id } },
    update: {},
    create: { userId: editorValais.id, clubId: clubValais.id, role: 'EDITOR', status: 'ACTIVE', invitedBy: adminValais.id, joinedAt: new Date() },
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
  await prisma.clubMembership.upsert({
    where: { userId_clubId: { userId: adminGeneva.id, clubId: clubGeneva.id } },
    update: {},
    create: { userId: adminGeneva.id, clubId: clubGeneva.id, role: 'OWNER', status: 'ACTIVE', invitedBy: null, joinedAt: new Date() },
  })
  await prisma.clubMembership.upsert({
    where: { userId_clubId: { userId: adminBern.id, clubId: clubBern.id } },
    update: {},
    create: { userId: adminBern.id, clubId: clubBern.id, role: 'OWNER', status: 'ACTIVE', invitedBy: null, joinedAt: new Date() },
  })
  console.log('✓ Club memberships created (5 owners + 1 editor)')

  // ─── Club Photos ──────────────────────────────────────────────────────
  await prisma.clubPhoto.deleteMany({
    where: { clubId: { in: [clubValais.id, clubLausanne.id, clubZurich.id, clubGeneva.id, clubBern.id] } },
  })
  await prisma.clubPhoto.createMany({
    data: [
      // Ski Club Valais (6 photos)
      { clubId: clubValais.id, url: 'https://picsum.photos/seed/ski1/800/450', alt: 'Ski alpin sur une piste ensoleillée en Valais', position: 0 },
      { clubId: clubValais.id, url: 'https://picsum.photos/seed/ski2/800/450', alt: 'Membres du club au sommet avec vue sur les Alpes', position: 1 },
      { clubId: clubValais.id, url: 'https://picsum.photos/seed/ski3/800/450', alt: 'Entraînement des juniors sur les pistes de Crans-Montana', position: 2 },
      { clubId: clubValais.id, url: 'https://picsum.photos/seed/ski4/800/450', alt: 'Remise des prix du championnat annuel', position: 3 },
      { clubId: clubValais.id, url: 'https://picsum.photos/seed/ski5/800/450', alt: 'Fondue du club dans le chalet de Thyon', position: 4 },
      { clubId: clubValais.id, url: 'https://picsum.photos/seed/ski6/800/450', alt: 'Slalom géant lors de la coupe du Valais', position: 5 },
      // FC Lausanne Sport (5 photos)
      { clubId: clubLausanne.id, url: 'https://picsum.photos/seed/foot1/800/450', alt: 'L\'équipe avant le coup d\'envoi', position: 0 },
      { clubId: clubLausanne.id, url: 'https://picsum.photos/seed/foot2/800/450', alt: 'Célébration d\'un but lors du derby', position: 1 },
      { clubId: clubLausanne.id, url: 'https://picsum.photos/seed/foot3/800/450', alt: 'Tournoi des jeunes sur le terrain synthétique', position: 2 },
      { clubId: clubLausanne.id, url: 'https://picsum.photos/seed/foot4/800/450', alt: 'L\'école de football avec les U12', position: 3 },
      { clubId: clubLausanne.id, url: 'https://picsum.photos/seed/foot5/800/450', alt: 'Photo d\'équipe de fin de saison', position: 4 },
      // Bergclub Zürich (6 photos)
      { clubId: clubZurich.id, url: 'https://picsum.photos/seed/berg1/800/450', alt: 'Panorama vom Gipfel des Säntis', position: 0 },
      { clubId: clubZurich.id, url: 'https://picsum.photos/seed/berg2/800/450', alt: 'Klettertraining in der Halle', position: 1 },
      { clubId: clubZurich.id, url: 'https://picsum.photos/seed/berg3/800/450', alt: 'Gruppenfoto nach der Hochtour', position: 2 },
      { clubId: clubZurich.id, url: 'https://picsum.photos/seed/berg4/800/450', alt: 'Klettersteig am Pilatus', position: 3 },
      { clubId: clubZurich.id, url: 'https://picsum.photos/seed/berg5/800/450', alt: 'Skitour im Berner Oberland', position: 4 },
      { clubId: clubZurich.id, url: 'https://picsum.photos/seed/berg6/800/450', alt: 'Stammtisch im Zeughauskeller', position: 5 },
      // Aviron Genève (5 photos)
      { clubId: clubGeneva.id, url: 'https://picsum.photos/seed/aviron1/800/450', alt: 'Rameurs sur le lac Léman au lever du soleil', position: 0 },
      { clubId: clubGeneva.id, url: 'https://picsum.photos/seed/aviron2/800/450', alt: 'Le huit de compétition lors de la régate du Léman', position: 1 },
      { clubId: clubGeneva.id, url: 'https://picsum.photos/seed/aviron3/800/450', alt: 'Cours d\'initiation pour débutants', position: 2 },
      { clubId: clubGeneva.id, url: 'https://picsum.photos/seed/aviron4/800/450', alt: 'Le hangar à bateaux des Eaux-Vives', position: 3 },
      { clubId: clubGeneva.id, url: 'https://picsum.photos/seed/aviron5/800/450', alt: 'Podium de la régate interclubs', position: 4 },
      // Turnverein Bern (5 photos)
      { clubId: clubBern.id, url: 'https://picsum.photos/seed/turn1/800/450', alt: 'Geräteturnen am Barren', position: 0 },
      { clubId: clubBern.id, url: 'https://picsum.photos/seed/turn2/800/450', alt: 'Kinderturnen in der Sporthalle', position: 1 },
      { clubId: clubBern.id, url: 'https://picsum.photos/seed/turn3/800/450', alt: 'Trampolinspringen beim Showabend', position: 2 },
      { clubId: clubBern.id, url: 'https://picsum.photos/seed/turn4/800/450', alt: 'Bodenturnen bei der Vereinsmeisterschaft', position: 3 },
      { clubId: clubBern.id, url: 'https://picsum.photos/seed/turn5/800/450', alt: 'Gruppenbild am Turnlager in Lenk', position: 4 },
    ],
  })
  console.log('✓ Club photos created (5-6 per club)')

  // ─── Support Messages (bidirectional conversations) ──────────────────
  await prisma.supportMessage.createMany({
    data: [
      // Ski Club Valais conversation
      {
        clubId: clubValais.id,
        senderId: operator.id,
        senderRole: 'OPERATOR',
        body: 'Bienvenue sur la plateforme ! Votre club a été approuvé. Complétez votre profil et mettez votre page en ligne quand vous êtes prêt.',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        clubId: clubValais.id,
        senderId: adminValais.id,
        senderRole: 'CLUB_ADMIN',
        body: 'Merci ! Nous avons commencé à remplir le profil. Comment ajouter un logo ?',
        createdAt: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000),
      },
      {
        clubId: clubValais.id,
        senderId: operator.id,
        senderRole: 'OPERATOR',
        body: 'Vous pouvez ajouter un logo depuis la page "Profil du club". Cliquez sur la zone logo et téléchargez une image carrée.',
        createdAt: new Date(Date.now() - 58 * 24 * 60 * 60 * 1000),
      },
      {
        clubId: clubValais.id,
        senderId: operator.id,
        senderRole: 'OPERATOR',
        body: 'Rappel : pensez à télécharger un logo pour votre club. Les pages avec logo reçoivent 3x plus de visites.',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },

      // FC Lausanne Sport conversation
      {
        clubId: clubLausanne.id,
        senderId: operator.id,
        senderRole: 'OPERATOR',
        body: 'Votre page est maintenant en ligne. N\'hésitez pas à nous contacter si vous avez besoin d\'aide.',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      },
      {
        clubId: clubLausanne.id,
        senderId: adminLausanne.id,
        senderRole: 'CLUB_ADMIN',
        body: 'Super, merci ! Tout fonctionne bien pour le moment.',
        createdAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000),
      },

      // Bergclub Zürich conversation
      {
        clubId: clubZurich.id,
        senderId: operator.id,
        senderRole: 'OPERATOR',
        body: 'Willkommen auf der Plattform! Ihr Club wurde genehmigt. Bitte vervollständigen Sie Ihr Profil.',
        createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      },
      {
        clubId: clubZurich.id,
        senderId: adminZurich.id,
        senderRole: 'CLUB_ADMIN',
        body: 'Danke! Wir haben unser Profil vervollständigt. Können Sie es kurz überprüfen?',
        createdAt: new Date(Date.now() - 39 * 24 * 60 * 60 * 1000),
      },
      {
        clubId: clubZurich.id,
        senderId: operator.id,
        senderRole: 'OPERATOR',
        body: 'Alles sieht gut aus! Ihre Seite ist jetzt online.',
        createdAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000),
      },

      // Yoga Geneva conversation
      {
        clubId: clubGeneva.id,
        senderId: operator.id,
        senderRole: 'OPERATOR',
        body: 'Bienvenue ! Votre page est prête. Ajoutez vos photos et documents pour attirer de nouveaux membres.',
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },

      // Turnverein Bern conversation
      {
        clubId: clubBern.id,
        senderId: operator.id,
        senderRole: 'OPERATOR',
        body: 'Willkommen! Ihr Turnverein ist jetzt auf der Plattform. Viel Erfolg!',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      },
      {
        clubId: clubBern.id,
        senderId: adminBern.id,
        senderRole: 'CLUB_ADMIN',
        body: 'Vielen Dank! Wie können wir die Sichtbarkeit unserer Seite verbessern?',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    ],
  })

  // ─── Conversation Read Cursors ──────────────────────────────────────
  await prisma.conversationReadCursor.createMany({
    skipDuplicates: true,
    data: [
      // Lausanne: both sides have read
      { clubId: clubLausanne.id, userId: operator.id, lastReadAt: new Date(Date.now() - 43 * 24 * 60 * 60 * 1000) },
      { clubId: clubLausanne.id, userId: adminLausanne.id, lastReadAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000) },
      // Zürich: operator has read all, admin has read all
      { clubId: clubZurich.id, userId: operator.id, lastReadAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000) },
      { clubId: clubZurich.id, userId: adminZurich.id, lastReadAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000) },
      // Bern: operator hasn't read the last club admin message
      { clubId: clubBern.id, userId: adminBern.id, lastReadAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
    ],
  })
  console.log('✓ Support messages and read cursors created')

  // ─── Helper: create full page set for a club ──────────────────────────
  const now = new Date()

  async function createClubPages(club: { id: string; slug: string }, admin: { id: string }, config: {
    homeHtml: string
    homeImageAlt: string
    homeImageCaption: string
    calendarLabel: string
    calendarSlug: string
    events: Array<{ title: string; date: Date; description: string }>
    galleryLabel: string
    galleryImages: Array<{ url: string; alt: string }>
    docsLabel: string
    docs: Array<{ displayName: string; fileName: string; fileSize: number }>
    contactLabel: string
    contactEmail: string
  }) {
    const homePage = await prisma.page.upsert({
      where: { clubId_slug: { clubId: club.id, slug: 'home' } },
      update: {},
      create: { clubId: club.id, slug: 'home', label: 'Home', isActive: true, isAnchor: true, position: 0 },
    })

    const calendarPage = await prisma.page.upsert({
      where: { clubId_slug: { clubId: club.id, slug: config.calendarSlug } },
      update: {},
      create: { clubId: club.id, slug: config.calendarSlug, label: config.calendarLabel, isActive: true, position: 1 },
    })

    const galleryPage = await prisma.page.upsert({
      where: { clubId_slug: { clubId: club.id, slug: 'gallery' } },
      update: {},
      create: { clubId: club.id, slug: 'gallery', label: config.galleryLabel, isActive: true, position: 2 },
    })

    const docsPage = await prisma.page.upsert({
      where: { clubId_slug: { clubId: club.id, slug: 'documents' } },
      update: {},
      create: { clubId: club.id, slug: 'documents', label: config.docsLabel, isActive: true, position: 3 },
    })

    const contactPage = await prisma.page.upsert({
      where: { clubId_slug: { clubId: club.id, slug: 'contact' } },
      update: {},
      create: { clubId: club.id, slug: 'contact', label: config.contactLabel, isActive: true, isAnchor: true, position: 4 },
    })

    // Home: rich_text + image
    await prisma.pageElement.upsert({
      where: { id: `${club.slug}-richtext-home` },
      update: {},
      create: {
        id: `${club.slug}-richtext-home`,
        pageId: homePage.id, clubId: club.id, position: 0, type: 'rich_text',
        data: { html: config.homeHtml },
      },
    })
    await prisma.pageElement.upsert({
      where: { id: `${club.slug}-image-home` },
      update: {},
      create: {
        id: `${club.slug}-image-home`,
        pageId: homePage.id, clubId: club.id, position: 1, type: 'image',
        data: { url: `https://picsum.photos/seed/${club.slug}-hero/800/450`, alt: config.homeImageAlt, caption: config.homeImageCaption },
      },
    })

    // Calendar + events
    const calEl = await prisma.pageElement.upsert({
      where: { id: `${club.slug}-calendar` },
      update: {},
      create: {
        id: `${club.slug}-calendar`,
        pageId: calendarPage.id, clubId: club.id, position: 0, type: 'calendar', data: {},
      },
    })
    if (config.events.length > 0) {
      await prisma.event.deleteMany({ where: { elementId: calEl.id } })
      await prisma.event.createMany({
        data: config.events.map((e) => ({
          clubId: club.id, elementId: calEl.id, title: e.title, date: e.date, description: e.description,
        })),
      })
    }

    // Gallery
    const galEl = await prisma.pageElement.upsert({
      where: { id: `${club.slug}-gallery` },
      update: {},
      create: {
        id: `${club.slug}-gallery`,
        pageId: galleryPage.id, clubId: club.id, position: 0, type: 'gallery', data: {},
      },
    })
    if (config.galleryImages.length > 0) {
      await prisma.galleryItem.deleteMany({ where: { elementId: galEl.id } })
      await prisma.galleryItem.createMany({
        data: config.galleryImages.map((img, i) => ({
          clubId: club.id, elementId: galEl.id, url: img.url, alt: img.alt, type: 'image', position: i,
        })),
      })
    }

    // Documents
    const docEl = await prisma.pageElement.upsert({
      where: { id: `${club.slug}-documents` },
      update: {},
      create: {
        id: `${club.slug}-documents`,
        pageId: docsPage.id, clubId: club.id, position: 0, type: 'documents', data: {},
      },
    })
    if (config.docs.length > 0) {
      await prisma.document.createMany({
        data: config.docs.map((doc, i) => ({
          clubId: club.id, elementId: docEl.id,
          displayName: doc.displayName, fileName: doc.fileName,
          fileType: 'application/pdf', fileSize: doc.fileSize,
          url: `https://example.com/${club.slug}/${doc.fileName}`, position: i,
        })),
      })
    }

    // Contact
    await prisma.pageElement.upsert({
      where: { id: `${club.slug}-contact` },
      update: {},
      create: {
        id: `${club.slug}-contact`,
        pageId: contactPage.id, clubId: club.id, position: 0, type: 'contact',
        data: { recipientEmail: config.contactEmail, fields: ['name', 'email', 'subject', 'message'] },
      },
    })

    // Content versions (3 per page)
    const pages = [homePage, calendarPage, galleryPage, docsPage, contactPage]
    for (const page of pages) {
      for (let v = 1; v <= 3; v++) {
        await prisma.contentVersion.create({
          data: {
            pageId: page.id, clubId: club.id, createdBy: admin.id,
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

    return pages
  }

  // ─── Ski Club Valais pages ────────────────────────────────────────────
  await createClubPages(clubValais, adminValais, {
    homeHtml: '<h2>Notre club</h2><p>Fondé en 1952, le Ski Club Valais promeut le ski alpin depuis plus de 70 ans. Rejoignez-nous pour des sessions de groupe hebdomadaires, des compétitions et des événements sociaux tout au long de la saison.</p><p>Nous accueillons tous les niveaux, du débutant curieux au compétiteur confirmé. Nos moniteurs diplômés assurent un encadrement de qualité.</p>',
    homeImageAlt: 'Membres du Ski Club Valais sur les pistes',
    homeImageCaption: 'Sortie du club à Zermatt, hiver 2025',
    calendarLabel: 'Événements', calendarSlug: 'events',
    events: [
      { title: 'Ouverture de saison — Tour à Zermatt', date: new Date(now.getTime() + 7 * 86400000), description: 'Sortie inaugurale de la saison. Tous niveaux bienvenus. Rendez-vous à la gare de Sion à 7h30.' },
      { title: 'Championnat du club — Slalom', date: new Date(now.getTime() + 30 * 86400000), description: 'Championnat annuel de slalom. Inscription obligatoire avant le 15 décembre. Catégories : juniors, adultes, vétérans.' },
      { title: 'Camp junior — Crans-Montana', date: new Date(now.getTime() + 45 * 86400000), description: 'Camp de 3 jours pour les skieurs de moins de 18 ans. Hébergement et repas inclus. Places limitées à 30.' },
      { title: 'Fondue du club', date: new Date(now.getTime() + 60 * 86400000), description: 'Soirée conviviale au restaurant de la Planta. Inscription par email, CHF 25 par personne.' },
    ],
    galleryLabel: 'Galerie',
    galleryImages: [
      { url: 'https://picsum.photos/seed/valais-gal1/800/600', alt: 'Descente en groupe sur piste bleue' },
      { url: 'https://picsum.photos/seed/valais-gal2/800/600', alt: 'Podium du championnat 2024' },
      { url: 'https://picsum.photos/seed/valais-gal3/800/600', alt: 'Les juniors en entraînement' },
    ],
    docsLabel: 'Documents',
    docs: [
      { displayName: 'Statuts du club 2025', fileName: 'statuts-2025.pdf', fileSize: 245760 },
      { displayName: 'Formulaire d\'adhésion', fileName: 'formulaire-adhesion.pdf', fileSize: 102400 },
      { displayName: 'Règlement des compétitions', fileName: 'reglement-competitions.pdf', fileSize: 184320 },
    ],
    contactLabel: 'Contact', contactEmail: 'contact@ski-club-valais.ch',
  })
  console.log('✓ Pages created for Ski Club Valais')

  // ─── FC Lausanne Sport pages ──────────────────────────────────────────
  await createClubPages(clubLausanne, adminLausanne, {
    homeHtml: '<h2>Bienvenue au FC Lausanne Sport</h2><p>Depuis 1989, notre club de football rassemble joueurs et joueuses dans la région lausannoise. Nous participons au championnat régional et organisons des tournois pour toutes les catégories d\'âge.</p><p>Notre philosophie : le plaisir du jeu, l\'esprit d\'équipe et le respect de l\'adversaire.</p>',
    homeImageAlt: 'L\'équipe du FC Lausanne Sport sur le terrain',
    homeImageCaption: 'Match de championnat, saison 2025',
    calendarLabel: 'Matchs', calendarSlug: 'matches',
    events: [
      { title: 'FC Lausanne Sport vs FC Berne', date: new Date(now.getTime() + 10 * 86400000), description: 'Match de championnat régional. Coup d\'envoi 15h00 au Stade de la Pontaise. Entrée libre.' },
      { title: 'Tournoi des jeunes U12 & U15', date: new Date(now.getTime() + 21 * 86400000), description: 'Tournoi annuel avec 12 équipes participantes. Buvette et grillades sur place.' },
      { title: 'Entraînement spécial — Gardiens', date: new Date(now.getTime() + 14 * 86400000), description: 'Session dédiée aux gardiens avec coach spécialisé. Ouvert aux U12 et plus.' },
    ],
    galleryLabel: 'Galerie',
    galleryImages: [
      { url: 'https://picsum.photos/seed/fcl-gal1/800/600', alt: 'Célébration d\'un but' },
      { url: 'https://picsum.photos/seed/fcl-gal2/800/600', alt: 'L\'école de football en action' },
    ],
    docsLabel: 'Documents',
    docs: [
      { displayName: 'Règlement intérieur 2025', fileName: 'reglement-interieur-2025.pdf', fileSize: 184320 },
      { displayName: 'Calendrier de la saison', fileName: 'calendrier-saison-2025.pdf', fileSize: 153600 },
      { displayName: 'Formulaire d\'inscription jeunes', fileName: 'inscription-jeunes.pdf', fileSize: 92160 },
    ],
    contactLabel: 'Contact', contactEmail: 'info@fc-lausanne-sport.ch',
  })
  console.log('✓ Pages created for FC Lausanne Sport')

  // ─── Bergclub Zürich pages ────────────────────────────────────────────
  await createClubPages(clubZurich, adminZurich, {
    homeHtml: '<h2>Über uns</h2><p>Der Bergclub Zürich wurde 1968 gegründet und organisiert regelmässig Bergtouren, Kletterausflüge und Wanderungen in den Schweizer Alpen und im Zürcher Oberland.</p><p>Unser Programm reicht von gemütlichen Wanderungen bis hin zu anspruchsvollen Hochtouren. Für jeden Fitnesslevel ist etwas dabei.</p>',
    homeImageAlt: 'Bergclub Zürich Mitglieder am Gipfel',
    homeImageCaption: 'Hochtour zum Titlis, Sommer 2025',
    calendarLabel: 'Touren', calendarSlug: 'touren',
    events: [
      { title: 'Herbstwanderung Uetliberg', date: new Date(now.getTime() + 5 * 86400000), description: 'Gemütliche Wanderung auf den Uetliberg mit Einkehr. Treffpunkt: Hauptbahnhof Zürich, 09:00.' },
      { title: 'Kletterweekend Flumserberg', date: new Date(now.getTime() + 20 * 86400000), description: 'Zweitägiger Kletterausflug mit Übernachtung in der SAC-Hütte. Mindestens Klettergrad 4a.' },
      { title: 'Skitour Tödi', date: new Date(now.getTime() + 40 * 86400000), description: 'Anspruchsvolle Skitour auf den Tödi (3614m). Gute Kondition und Erfahrung erforderlich. Inkl. Bergführer.' },
      { title: 'Stammtisch', date: new Date(now.getTime() + 3 * 86400000), description: 'Monatlicher Stammtisch im Restaurant Zeughauskeller. Alle Mitglieder und Interessierte willkommen.' },
    ],
    galleryLabel: 'Galerie',
    galleryImages: [
      { url: 'https://picsum.photos/seed/bc-gal1/800/600', alt: 'Klettern am Calanda' },
      { url: 'https://picsum.photos/seed/bc-gal2/800/600', alt: 'Wandergruppe auf dem Pizol' },
      { url: 'https://picsum.photos/seed/bc-gal3/800/600', alt: 'Sonnenuntergang von der SAC-Hütte' },
      { url: 'https://picsum.photos/seed/bc-gal4/800/600', alt: 'Skitour im Berner Oberland' },
    ],
    docsLabel: 'Dokumente',
    docs: [
      { displayName: 'Vereinsstatuten 2025', fileName: 'statuten-2025.pdf', fileSize: 225280 },
      { displayName: 'Tourenprogramm 2025/26', fileName: 'tourenprogramm-2025-26.pdf', fileSize: 307200 },
      { displayName: 'Beitrittsformular', fileName: 'beitrittsformular.pdf', fileSize: 81920 },
    ],
    contactLabel: 'Kontakt', contactEmail: 'info@bergclub-zurich.ch',
  })
  console.log('✓ Pages created for Bergclub Zürich')

  // ─── Aviron Genève pages ──────────────────────────────────────────────
  await createClubPages(clubGeneva, adminGeneva, {
    homeHtml: '<h2>L\'Aviron Genève</h2><p>Fondé en 1875, l\'Aviron Genève est l\'un des plus anciens clubs sportifs du canton. Situé aux Eaux-Vives, nous proposons de l\'aviron de loisir et de compétition sur le lac Léman.</p><p>Notre flotte comprend des yoles, des doubles, des quatre avec barreur et un huit de compétition. Cours pour débutants toute l\'année.</p>',
    homeImageAlt: 'Rameurs sur le lac Léman',
    homeImageCaption: 'Entraînement matinal, printemps 2025',
    calendarLabel: 'Événements', calendarSlug: 'events',
    events: [
      { title: 'Régate du Léman', date: new Date(now.getTime() + 15 * 86400000), description: 'Régate annuelle sur le lac Léman. Toutes catégories. Inscriptions ouvertes.' },
      { title: 'Cours d\'initiation — Session printemps', date: new Date(now.getTime() + 8 * 86400000), description: '4 séances le samedi matin. CHF 80. Prêt de matériel inclus. À partir de 14 ans.' },
      { title: 'Assemblée générale 2025', date: new Date(now.getTime() + 25 * 86400000), description: 'AG annuelle au clubhouse. Bilan financier, élections du comité et apéritif.' },
    ],
    galleryLabel: 'Galerie',
    galleryImages: [
      { url: 'https://picsum.photos/seed/ag-gal1/800/600', alt: 'Le huit en course' },
      { url: 'https://picsum.photos/seed/ag-gal2/800/600', alt: 'Cours débutants au port' },
    ],
    docsLabel: 'Documents',
    docs: [
      { displayName: 'Statuts du club', fileName: 'statuts-aviron-geneve.pdf', fileSize: 204800 },
      { displayName: 'Formulaire d\'inscription — Initiation', fileName: 'inscription-initiation.pdf', fileSize: 71680 },
      { displayName: 'Tarifs et cotisations 2025', fileName: 'tarifs-2025.pdf', fileSize: 61440 },
    ],
    contactLabel: 'Contact', contactEmail: 'contact@aviron-geneve.ch',
  })
  console.log('✓ Pages created for Aviron Genève')

  // ─── Turnverein Bern pages ────────────────────────────────────────────
  await createClubPages(clubBern, adminBern, {
    homeHtml: '<h2>Willkommen beim Turnverein Bern</h2><p>Seit 1860 bieten wir vielfältige Turnangebote für alle Altersgruppen. Von Geräteturnen über Trampolin bis zur Gruppengymnastik — bei uns findet jeder seine Disziplin.</p><p>Unser Verein zählt über 200 aktive Mitglieder und ist Mitglied des Schweizerischen Turnverbandes.</p>',
    homeImageAlt: 'Turner am Barren in der Sporthalle',
    homeImageCaption: 'Geräteturnen-Training, Herbst 2025',
    calendarLabel: 'Veranstaltungen', calendarSlug: 'events',
    events: [
      { title: 'Schauturnen 2025', date: new Date(now.getTime() + 12 * 86400000), description: 'Unser jährliches Schauturnen in der Sporthalle Wankdorf. Eintritt frei, Festwirtschaft vorhanden.' },
      { title: 'Turnlager Lenk', date: new Date(now.getTime() + 35 * 86400000), description: 'Einwöchiges Turnlager in Lenk im Simmental für Kinder und Jugendliche (8–16 Jahre). CHF 250 inkl. Unterkunft und Verpflegung.' },
      { title: 'Vereinsmeisterschaft Geräteturnen', date: new Date(now.getTime() + 50 * 86400000), description: 'Interne Meisterschaft an allen Geräten. Kategorien: Jugend, Aktive, Masters.' },
    ],
    galleryLabel: 'Galerie',
    galleryImages: [
      { url: 'https://picsum.photos/seed/tv-gal1/800/600', alt: 'Bodenturnen-Vorführung' },
      { url: 'https://picsum.photos/seed/tv-gal2/800/600', alt: 'Kinderturnen mit Spielgeräten' },
      { url: 'https://picsum.photos/seed/tv-gal3/800/600', alt: 'Trampolinspringen beim Schauturnen' },
    ],
    docsLabel: 'Dokumente',
    docs: [
      { displayName: 'Vereinsstatuten', fileName: 'statuten-turnverein-bern.pdf', fileSize: 194560 },
      { displayName: 'Anmeldeformular', fileName: 'anmeldeformular.pdf', fileSize: 81920 },
      { displayName: 'Jahresprogramm 2025/26', fileName: 'jahresprogramm-2025-26.pdf', fileSize: 266240 },
    ],
    contactLabel: 'Kontakt', contactEmail: 'info@turnverein-bern.ch',
  })
  console.log('✓ Pages created for Turnverein Bern')

  // ─── Bulk Clubs (for testing search & pagination) ────────────────────
  const bulkAdmin = await prisma.user.upsert({
    where: { email: 'bulk@platform-name.com' },
    update: { passwordHash: adminPasswordHash },
    create: {
      email: 'bulk@platform-name.com',
      name: 'Bulk Admin',
      firstName: 'Bulk',
      lastName: 'Admin',
      preferredLanguage: 'fr',
      role: 'CLUB_ADMIN',
      passwordHash: adminPasswordHash,
      totpEnabled: false,
    },
  })

  const bulkLocations = [
    await createSwissLocation('10001', '3920', 'VS', { fr: 'Zermatt', de: 'Zermatt', it: 'Zermatt', en: 'Zermatt' }),
    await createSwissLocation('10002', '3800', 'BE', { fr: 'Interlaken', de: 'Interlaken', it: 'Interlaken', en: 'Interlaken' }),
    await createSwissLocation('10003', '6900', 'TI', { fr: 'Lugano', de: 'Lugano', it: 'Lugano', en: 'Lugano' }),
    await createSwissLocation('10004', '7500', 'GR', { fr: 'Saint-Moritz', de: 'St. Moritz', it: 'San Maurizio', en: 'St. Moritz' }),
    await createSwissLocation('10005', '2000', 'NE', { fr: 'Neuchâtel', de: 'Neuenburg', it: 'Neuchâtel', en: 'Neuchâtel' }),
    await createSwissLocation('10006', '1700', 'FR', { fr: 'Fribourg', de: 'Freiburg', it: 'Friburgo', en: 'Fribourg' }),
    await createSwissLocation('10007', '9000', 'SG', { fr: 'Saint-Gall', de: 'St. Gallen', it: 'San Gallo', en: 'St. Gallen' }),
    await createSwissLocation('10008', '6000', 'LU', { fr: 'Lucerne', de: 'Luzern', it: 'Lucerna', en: 'Lucerne' }),
    await createSwissLocation('10009', '8200', 'SH', { fr: 'Schaffhouse', de: 'Schaffhausen', it: 'Sciaffusa', en: 'Schaffhausen' }),
    await createSwissLocation('10010', '4500', 'SO', { fr: 'Soleure', de: 'Solothurn', it: 'Soletta', en: 'Solothurn' }),
  ]

  const _bulkActivities = ['skiing', 'football', 'mountaineering', 'rowing', 'gymnastics', 'yoga', 'swimming', 'chess'] as const
  const accentColors = ['blue', 'green', 'violet', 'orange', 'rose', 'red', 'sky', 'amber'] as const

  const bulkClubDefs: Array<{ name: string; slug: string; activity: string; locIdx: number; published: boolean; forceOffline: boolean }> = [
    { name: 'Tennisclub Interlaken', slug: 'tennisclub-interlaken', activity: 'other', locIdx: 1, published: true, forceOffline: false },
    { name: 'Ruderclub Lugano', slug: 'ruderclub-lugano', activity: 'rowing', locIdx: 2, published: true, forceOffline: false },
    { name: 'FC Zermatt', slug: 'fc-zermatt', activity: 'football', locIdx: 0, published: true, forceOffline: false },
    { name: 'Schachclub Neuchâtel', slug: 'schachclub-neuchatel', activity: 'chess', locIdx: 4, published: true, forceOffline: false },
    { name: 'Yoga Fribourg', slug: 'yoga-fribourg', activity: 'yoga', locIdx: 5, published: true, forceOffline: false },
    { name: 'Schwimmverein St. Gallen', slug: 'schwimmverein-st-gallen', activity: 'swimming', locIdx: 6, published: true, forceOffline: false },
    { name: 'Bergclub St. Moritz', slug: 'bergclub-st-moritz', activity: 'mountaineering', locIdx: 3, published: true, forceOffline: false },
    { name: 'Turnverein Luzern', slug: 'turnverein-luzern', activity: 'gymnastics', locIdx: 7, published: true, forceOffline: false },
    { name: 'Ski Club Schaffhausen', slug: 'ski-club-schaffhausen', activity: 'skiing', locIdx: 8, published: true, forceOffline: false },
    { name: 'FC Solothurn United', slug: 'fc-solothurn-united', activity: 'football', locIdx: 9, published: true, forceOffline: false },
    { name: 'Aviron Neuchâtel', slug: 'aviron-neuchatel', activity: 'rowing', locIdx: 4, published: true, forceOffline: false },
    { name: 'Yoga Lugano Centro', slug: 'yoga-lugano-centro', activity: 'yoga', locIdx: 2, published: true, forceOffline: false },
    { name: 'Schachverein Interlaken', slug: 'schachverein-interlaken', activity: 'chess', locIdx: 1, published: true, forceOffline: false },
    { name: 'Alpenclub Zermatt', slug: 'alpenclub-zermatt', activity: 'mountaineering', locIdx: 0, published: true, forceOffline: false },
    { name: 'FC Fribourg City', slug: 'fc-fribourg-city', activity: 'football', locIdx: 5, published: true, forceOffline: false },
    { name: 'Schwimmclub Luzern', slug: 'schwimmclub-luzern', activity: 'swimming', locIdx: 7, published: true, forceOffline: false },
    { name: 'Turnverein Schaffhausen', slug: 'turnverein-schaffhausen', activity: 'gymnastics', locIdx: 8, published: true, forceOffline: false },
    { name: 'Ski Club Solothurn', slug: 'ski-club-solothurn', activity: 'skiing', locIdx: 9, published: true, forceOffline: false },
    { name: 'Ruderverein St. Gallen', slug: 'ruderverein-st-gallen', activity: 'rowing', locIdx: 6, published: true, forceOffline: false },
    { name: 'Yoga St. Moritz', slug: 'yoga-st-moritz', activity: 'yoga', locIdx: 3, published: true, forceOffline: false },
    { name: 'Bergfreunde Fribourg', slug: 'bergfreunde-fribourg', activity: 'mountaineering', locIdx: 5, published: true, forceOffline: false },
    { name: 'FC Lugano Amateurs', slug: 'fc-lugano-amateurs', activity: 'football', locIdx: 2, published: true, forceOffline: false },
    { name: 'Turnverein Neuchâtel', slug: 'turnverein-neuchatel', activity: 'gymnastics', locIdx: 4, published: false, forceOffline: false },
    { name: 'Schwimmverein Zermatt', slug: 'schwimmverein-zermatt', activity: 'swimming', locIdx: 0, published: false, forceOffline: false },
    { name: 'Schachclub Solothurn', slug: 'schachclub-solothurn', activity: 'chess', locIdx: 9, published: true, forceOffline: false },
    { name: 'Ski Club Interlaken', slug: 'ski-club-interlaken', activity: 'skiing', locIdx: 1, published: true, forceOffline: false },
    { name: 'Aviron Lugano', slug: 'aviron-lugano', activity: 'rowing', locIdx: 2, published: true, forceOffline: false },
    { name: 'Yoga Schaffhausen', slug: 'yoga-schaffhausen', activity: 'yoga', locIdx: 8, published: true, forceOffline: false },
    { name: 'Bergclub Solothurn', slug: 'bergclub-solothurn', activity: 'mountaineering', locIdx: 9, published: true, forceOffline: false },
    { name: 'FC Interlaken Sport', slug: 'fc-interlaken-sport', activity: 'football', locIdx: 1, published: true, forceOffline: false },
    { name: 'Turnverein St. Moritz', slug: 'turnverein-st-moritz', activity: 'gymnastics', locIdx: 3, published: true, forceOffline: false },
    { name: 'Schwimmclub Neuchâtel', slug: 'schwimmclub-neuchatel', activity: 'swimming', locIdx: 4, published: true, forceOffline: false },
    { name: 'Schachclub Fribourg', slug: 'schachclub-fribourg', activity: 'chess', locIdx: 5, published: true, forceOffline: false },
    { name: 'Ski Club Lugano', slug: 'ski-club-lugano', activity: 'skiing', locIdx: 2, published: true, forceOffline: false },
    { name: 'Ruderclub Solothurn', slug: 'ruderclub-solothurn', activity: 'rowing', locIdx: 9, published: true, forceOffline: false },
    { name: 'Yoga Interlaken', slug: 'yoga-interlaken', activity: 'yoga', locIdx: 1, published: true, forceOffline: false },
    { name: 'Bergclub Luzern', slug: 'bergclub-luzern', activity: 'mountaineering', locIdx: 7, published: true, forceOffline: false },
    { name: 'FC St. Gallen Ost', slug: 'fc-st-gallen-ost', activity: 'football', locIdx: 6, published: true, forceOffline: false },
    { name: 'Turnverein Zermatt', slug: 'turnverein-zermatt', activity: 'gymnastics', locIdx: 0, published: true, forceOffline: true },
    { name: 'Schwimmclub Schaffhausen', slug: 'schwimmclub-schaffhausen', activity: 'swimming', locIdx: 8, published: true, forceOffline: false },
    { name: 'Schachclub St. Moritz', slug: 'schachclub-st-moritz', activity: 'chess', locIdx: 3, published: false, forceOffline: false },
    { name: 'Ski Club Fribourg', slug: 'ski-club-fribourg', activity: 'skiing', locIdx: 5, published: true, forceOffline: false },
    { name: 'Ruderclub Interlaken', slug: 'ruderclub-interlaken', activity: 'rowing', locIdx: 1, published: true, forceOffline: false },
    { name: 'Bergclub Schaffhausen', slug: 'bergclub-schaffhausen', activity: 'mountaineering', locIdx: 8, published: true, forceOffline: false },
    { name: 'FC Neuchâtel Jeunesse', slug: 'fc-neuchatel-jeunesse', activity: 'football', locIdx: 4, published: true, forceOffline: false },
  ]

  // Varied lastVerifiedAt for bulk clubs: cycle through healthy, approaching, expired, and null
  const bulkVerificationAges = [
    15,   // healthy
    50,   // healthy
    82,   // approaching
    92,   // expired
    null, // never verified
    5,    // healthy (very recent)
    70,   // healthy
    85,   // approaching
    100,  // expired
    60,   // healthy
    25,   // healthy
    88,   // approaching
    95,   // expired
    null, // never verified
    40,   // healthy
    75,   // healthy
  ]

  for (const [i, def] of bulkClubDefs.entries()) {
    const loc = bulkLocations[def.locIdx]
    const ageDays = bulkVerificationAges[i % bulkVerificationAges.length]
    const lastVerifiedAt = ageDays !== null ? new Date(Date.now() - ageDays * 24 * 60 * 60 * 1000) : null
    const club = await prisma.club.upsert({
      where: { slug_country: { slug: def.slug, country: 'ch' } },
      update: { locationId: loc.id },
      create: {
        name: def.name,
        slug: def.slug,
        country: 'ch',
        status: 'ACTIVE',
        activityType: def.activity,
        locationId: loc.id,
        email: `info@${def.slug}.ch`,
        description: `${def.name} — a community sports club.`,
        isPublished: def.published,
        forceOffline: def.forceOffline,
        accentColor: accentColors[def.locIdx % accentColors.length],
        defaultLanguage: def.locIdx <= 1 || def.locIdx === 4 || def.locIdx === 5 ? 'fr' : 'de',
        storageUsedBytes: BigInt(0),
        storageLimitBytes: BigInt(5368709120),
        lastVerifiedAt,
      },
    })
    await prisma.clubMembership.upsert({
      where: { userId_clubId: { userId: bulkAdmin.id, clubId: club.id } },
      update: {},
      create: { userId: bulkAdmin.id, clubId: club.id, role: 'OWNER', status: 'ACTIVE', invitedBy: null, joinedAt: new Date() },
    })
  }
  console.log(`✓ Bulk clubs created (${bulkClubDefs.length} clubs across 10 locations)`)

  // ─── Applications (complete data) ─────────────────────────────────────
  // Create locations for applications
  const locationMontreux = await createSwissLocation('5886', '1820', 'VD', {
    fr: 'Montreux', de: 'Montreux', it: 'Montreux', en: 'Montreux',
  })
  const locationBasel = await createSwissLocation('2701', '4000', 'BS', {
    fr: 'Bâle', de: 'Basel', it: 'Basilea', en: 'Basel',
  })
  const locationLucerne = await createSwissLocation('1061', '6000', 'LU', {
    fr: 'Lucerne', de: 'Luzern', it: 'Lucerna', en: 'Lucerne',
  })

  await prisma.application.createMany({
    data: [
      {
        applicantFirstName: 'Léa',
        applicantLastName: 'Mercier',
        applicantPhone: '+41 21 963 00 01',
        applicantPreferredLanguage: 'fr',
        name: 'Yoga Studio Montreux',
        country: 'ch',
        activityType: 'yoga',
        locationId: locationMontreux.id,
        description: 'Studio de yoga proposant des cours de Hatha, Vinyasa et Yin yoga en bord du lac Léman. Fondé en 2019, nous accueillons tous les niveaux dans un cadre apaisant.',
        email: 'lea.mercier@example.com',
        clubEmail: 'namaste@yoga-montreux.ch',
        schedule: 'Lundi au vendredi : 07h00, 12h00 et 18h30\nSamedi : 09h00 et 10h30\nDimanche : cours spécial mensuel',
        contactPhone: '+41 21 963 00 00',
        contactAddress: 'Rue du Marché 15\n1820 Montreux\nSuisse',
        howToJoin: 'Premier cours d\'essai gratuit. Abonnements : CHF 130/mois, CHF 1200/an. Carte 10 cours : CHF 200.',
        externalWebsiteUrl: 'https://yoga-montreux.ch',
        desiredSlug: 'yoga-montreux',
        status: 'PENDING',
        submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        applicantFirstName: 'Andreas',
        applicantLastName: 'Weber',
        applicantPhone: '+41 61 311 22 34',
        applicantPreferredLanguage: 'de',
        name: 'Schwimmclub Basel',
        country: 'ch',
        activityType: 'swimming',
        locationId: locationBasel.id,
        description: 'Der Schwimmclub Basel trainiert Schwimmerinnen und Schwimmer aller Altersstufen im Hallenbad St. Jakob. Wir nehmen an regionalen und nationalen Wettkämpfen teil.',
        email: 'andreas.weber@example.com',
        clubEmail: 'info@schwimmclub-basel.ch',
        schedule: 'Dienstag und Donnerstag 18:00–20:00\nSamstag 08:00–10:00 (Wettkampfgruppe)\nSonntag 09:00–10:30 (Anfänger)',
        contactPhone: '+41 61 311 22 33',
        contactAddress: 'Im St. Jakob 2\n4052 Basel\nSchweiz',
        howToJoin: 'Schnuppertraining jederzeit möglich. Mitgliedsbeitrag: CHF 280/Jahr (Erwachsene), CHF 150/Jahr (Kinder).',
        externalWebsiteUrl: 'https://schwimmclub-basel.ch',
        desiredSlug: 'schwimmclub-basel',
        status: 'APPROVED',
        submittedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        applicantFirstName: 'Martin',
        applicantLastName: 'Hofer',
        applicantPreferredLanguage: 'de',
        name: 'Luzerner Schachverein',
        country: 'ch',
        activityType: 'chess',
        locationId: locationLucerne.id,
        description: 'Der Luzerner Schachverein besteht seit 1923 und ist einer der traditionsreichsten Schachvereine der Zentralschweiz. Wir spielen in der Nationalliga B und bieten Kurse für Kinder und Erwachsene.',
        email: 'martin.hofer@example.com',
        clubEmail: 'vorstand@schach-luzern.ch',
        schedule: 'Freitags 19:30–23:00: Spielabend\nMittwochs 14:00–16:00: Jugendtraining\nMonatlich: Blitzturnier (1. Samstag)',
        contactPhone: '+41 41 210 55 66',
        contactAddress: 'Pilatusstrasse 12\n6003 Luzern\nSchweiz',
        howToJoin: 'Kommen Sie an einem Freitagabend vorbei. Jahresbeitrag: CHF 100 (Erwachsene), CHF 40 (Jugendliche unter 20).',
        desiredSlug: 'schachverein-luzern',
        status: 'PENDING',
        submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
      {
        applicantFirstName: 'Max',
        applicantLastName: 'Keller',
        applicantPreferredLanguage: 'de',
        name: 'Extreme Sports Zurich',
        country: 'ch',
        otherDescription: 'Paragliding, base jumping, and wingsuit club.',
        description: 'Club de sports extrêmes centré sur les disciplines aériennes : parapente, base jump et wingsuit.',
        email: 'max.keller@example.com',
        desiredSlug: 'extreme-sports-zurich',
        status: 'REJECTED',
        rejectionReason: 'La plateforme se concentre actuellement sur les sports et activités communautaires classiques. Les sports extrêmes nécessitent des assurances et certifications spécifiques que nous ne pouvons pas vérifier.',
        submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        reviewedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
    ],
  })
  console.log('✓ Applications created (2 PENDING, 1 APPROVED, 1 REJECTED)')

  // ─── Contact Submissions ──────────────────────────────────────────────
  const contactMessages = [
    { clubId: clubValais.id, name: 'Sophie Martin', email: 'sophie.martin@example.com', subject: 'Inscription au club', body: 'Bonjour, je souhaiterais rejoindre le Ski Club Valais. Quelles sont les modalités d\'inscription et le montant de la cotisation ? Merci d\'avance.' },
    { clubId: clubValais.id, name: 'Pierre Dupont', email: 'pierre.dupont@example.com', subject: 'Sortie en groupe', body: 'Nous sommes un groupe de 8 amis et aimerions participer à une sortie de ski. Proposez-vous des tarifs de groupe ?' },
    { clubId: clubValais.id, name: 'Anna Schmidt', email: 'anna.schmidt@example.com', subject: 'Programme juniors', body: 'Ma fille de 12 ans s\'intéresse au ski. Y a-t-il un âge minimum pour le programme junior ? Quel niveau est requis ?' },
    { clubId: clubLausanne.id, name: 'Thierry Rochat', email: 'thierry.rochat@example.com', subject: 'Rejoindre l\'équipe adulte', body: 'Bonjour, j\'ai 35 ans et je joue au football depuis le collège. Est-il encore possible de rejoindre l\'équipe adulte ?' },
    { clubId: clubLausanne.id, name: 'Emilie Chappuis', email: 'emilie.chappuis@example.com', subject: 'École de football — filles', body: 'Ma fille de 9 ans aimerait jouer au football. Avez-vous une section filles dans votre école de football ?' },
    { clubId: clubZurich.id, name: 'Thomas Brunner', email: 'thomas.brunner@example.com', subject: 'Schnuppertour', body: 'Ich möchte gerne an einer Schnuppertour teilnehmen. Wann ist die nächste Tour und was muss ich mitbringen?' },
    { clubId: clubGeneva.id, name: 'Isabelle Renaud', email: 'isabelle.renaud@example.com', subject: 'Cours débutants', body: 'Bonjour, je n\'ai jamais ramé mais j\'aimerais essayer. Quand commence le prochain cours d\'initiation ?' },
    { clubId: clubBern.id, name: 'Karin Huber', email: 'karin.huber@example.com', subject: 'Kinderturnen Anmeldung', body: 'Guten Tag, ich möchte meine Tochter (7 Jahre) zum Kinderturnen anmelden. Gibt es noch freie Plätze am Dienstag?' },
  ]

  for (const msg of contactMessages) {
    const { ciphertext, iv } = encrypt(msg.body)
    await prisma.contactSubmission.create({
      data: {
        clubId: msg.clubId,
        senderName: msg.name,
        senderEmail: msg.email,
        subject: msg.subject,
        encryptedBody: ciphertext,
        iv,
        isRead: Math.random() > 0.5,
      },
    })
  }
  console.log('✓ Contact submissions created (8 encrypted)')

  // ─── Support Tickets ──────────────────────────────────────────────────
  const ticket1 = await prisma.supportTicket.create({
    data: {
      clubId: clubValais.id,
      subject: 'Problème de téléchargement de photos',
      message: 'Bonjour, je n\'arrive pas à télécharger des photos de plus de 2 Mo. Le bouton de téléchargement ne réagit pas. Pouvez-vous m\'aider ?',
      status: 'closed',
    },
  })
  await prisma.ticketReply.create({
    data: {
      ticketId: ticket1.id,
      operatorId: operator.id,
      body: 'Bonjour Jean, le problème venait d\'une limitation temporaire du serveur. C\'est maintenant résolu. Vous pouvez réessayer le téléchargement. Merci de votre patience !',
    },
  })

  await prisma.supportTicket.create({
    data: {
      clubId: clubGeneva.id,
      subject: 'Modifier l\'adresse du club',
      message: 'Bonjour, nous avons déménagé notre local. Comment puis-je mettre à jour l\'adresse affichée sur notre page ?',
      status: 'open',
    },
  })

  console.log('✓ Support tickets created (1 open, 1 closed with reply)')

  // ─── Analytics Events (90 days, all clubs) ────────────────────────────
  const crypto = await import('crypto')
  const allClubs = [
    { id: clubValais.id, pageSlugs: ['home', 'events', 'gallery', 'documents', 'contact'] },
    { id: clubLausanne.id, pageSlugs: ['home', 'matches', 'gallery', 'documents', 'contact'] },
    { id: clubZurich.id, pageSlugs: ['home', 'touren', 'gallery', 'documents', 'contact'] },
    { id: clubGeneva.id, pageSlugs: ['home', 'events', 'gallery', 'documents', 'contact'] },
    { id: clubBern.id, pageSlugs: ['home', 'events', 'gallery', 'documents', 'contact'] },
  ]

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
    const dailySalt = dayDate.toISOString().split('T')[0]

    for (const club of allClubs) {
      const eventsPerDay = Math.floor(Math.random() * 12) + 2
      for (let e = 0; e < eventsPerDay; e++) {
        const fakeIp = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
        const ipHash = crypto.createHash('sha256').update(`${fakeIp}:${dailySalt}`).digest('hex')
        const pageSlug = club.pageSlugs[Math.floor(Math.random() * club.pageSlugs.length)]

        pageEvents.push({
          clubId: club.id,
          pageSlug,
          eventType: Math.random() > 0.92 ? 'contact_form_sent' : 'page_view',
          country: 'ch',
          referrer: Math.random() > 0.6 ? null : ['google.com', 'facebook.com', 'instagram.com'][Math.floor(Math.random() * 3)],
          ipHash,
          visitedAt: new Date(dayDate.getTime() + Math.random() * 86400000),
        })
      }
    }
  }

  const batchSize = 200
  for (let i = 0; i < pageEvents.length; i += batchSize) {
    await prisma.pageEvent.createMany({ data: pageEvents.slice(i, i + batchSize) })
  }
  console.log(`✓ Analytics events created: ${pageEvents.length} events over 90 days (all clubs)`)

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
  console.log('──────────────────────────────────────')
  console.log('Operator:  admin@platform-name.com / 123456')
  console.log('Club admins (all use password: admin123):')
  console.log('  Ski Club Valais (owner): jean.favre@ski-club-valais.ch')
  console.log('  Ski Club Valais (editor): sophie.martin@ski-club-valais.ch')
  console.log('  FC Lausanne Sport: marc.bonvin@fc-lausanne-sport.ch')
  console.log('  Bergclub Zürich: hans.mueller@bergclub-zurich.ch')
  console.log('  Aviron Genève: claire.dumont@aviron-geneve.ch')
  console.log('  Turnverein Bern: lukas.gerber@turnverein-bern.ch')
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
