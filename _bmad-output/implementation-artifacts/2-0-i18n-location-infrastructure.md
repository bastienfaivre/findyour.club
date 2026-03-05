# Story 2.0: i18n Location Infrastructure

Status: done

## Story

As a platform engineer,
I want a multilingual location data model backed by the swisstopo geocoding API,
so that Swiss cities and cantons are stored as unique normalized entities with names in all four supported languages (fr/de/it/en), enabling the apply form typeahead, directory filtering, and correct SEO `lang` attributes.

## Context

This is a prerequisite story for 2-1 (Club Application Form), 2-3 (Application Approval), and 3-2 (Country Directory with Filtering). It must be completed before any of those stories begin.

The current `SwissLocation` model has a single `name: String` field (no translations) and a `canton: String` field (no normalization). This story replaces that with a fully multilingual, canton-normalized structure. The existing `/api/locations/route.ts` stub (Nominatim-based) is replaced with a swisstopo-backed route.

**Supported languages:** `en`, `fr`, `de`, `it` — stored as ISO 639-1 strings.

**URL architecture:** `/{lang}/{country}/{club-slug}` — language and country are independent path segments. The `{lang}` segment captures the visitor's preferred language (any BCP 47 subtag); `{country}` is the geographic context fixed by the club's location.

**Language resolution (layered fallback):**
- **Platform UI:** `resolveUILang(lang)` → maps to one of `[fr, de, it, en]`; any unsupported language (e.g. `pt`) falls back to `en`
- **Geographic data** (swisstopo canton/location names): same `resolveUILang` fallback → `en`
- **Club content:** served in `club.defaultLanguage` (e.g. `fr`) when the visitor's language has no authored translation

Example: visitor at `/pt/ch/ski-club-valais` → UI in English, canton names in English, club content in French (`club.defaultLanguage`).

**swisstopo SearchServer API** (confirmed language-aware, no auth required):
```
GET https://api3.geo.admin.ch/rest/services/api/SearchServer
  ?searchText={query}
  &type=locations
  &lang={en|fr|de|it}
  &sr=4326
  &returnGeometry=false
```
Returns features where `attrs.origin === 'gg25'` are Swiss municipalities. Label format: `<b>Genf (GE)</b>` — canton code always present in parentheses. Feature `id` is the stable swisstopo identifier (e.g., `"2117"` for Geneva).

## Acceptance Criteria

1. **Given** the Prisma schema, **Then** the following models exist:
   - `SwissCanton` with `code String @id` (e.g., `"GE"`)
   - `SwissCantonTranslation` with composite PK `(cantonCode, language)` and a `name` field
   - `SwissLocation` updated: `swisstopoId String @unique`, `plz String`, `cantonCode String` FK to `SwissCanton`; the old `name: String` and `canton: String` fields are removed; `@@unique([plz, name])` is removed
   - `SwissLocationTranslation` with composite PK `(swissLocationId, language)` and a `name` field
   - `Club` has a new `defaultLanguage String @default("fr")` field

2. **Given** the database is seeded, **Then** all 26 Swiss cantons exist in `swiss_cantons` with translations in all 4 languages (`en`, `fr`, `de`, `it`) in `swiss_canton_translations`.

3. **Given** `GET /api/locations?country=ch&q=gen&lang=de`, **Then** the route queries the swisstopo SearchServer with `lang=de`, filters for `origin === 'gg25'` results, and returns an array of `{ swisstopoId, plz, name, cantonCode }` objects. The `name` is the language-specific label from the API (e.g., `"Genf"` for `lang=de`).

4. **Given** `GET /api/locations?country=ch&q=gen&lang=fr`, **Then** the same query returns `"Genève"` as the name for Geneva — confirming the `lang` parameter controls the returned label language.

5. **Given** `upsertSwissLocation({ swisstopoId, plz, cantonCode, nameFr })` is called for a city not yet in the DB, **Then**:
   - The function queries the swisstopo SearchServer once per supported language (`en/fr/de/it`) with the French name as `searchText`, finds the result matching `swisstopoId`, and extracts the language-specific `name` (stripped of HTML tags and canton suffix)
   - A `SwissLocation` row is created along with 4 `SwissLocationTranslation` rows (one per language)
   - The corresponding `Location` bridge record is created linking `country: "ch"` to the new `SwissLocation`
   - The function returns `{ locationId }` (the `Location` record id, suitable for assignment to `Club.locationId` or `Application.locationId`)

6. **Given** `upsertSwissLocation` is called for a city that already exists (`swisstopoId` already in DB), **Then** no new rows are created; the existing `Location.id` is returned (idempotent).

7. **Given** the seed clubs (`ski-club-valais`, `football-club-lausanne`), **Then** both have `defaultLanguage: "fr"` set in the database after seeding.

8. **Given** a platform visitor clicks a language button (FR | DE | IT | EN), **When** the `LanguageSwitcher` calls `router.push(/{newLang}/...)`, **Then** the URL changes to the new language prefix (e.g. `/fr/ch/...` → `/de/ch/...`); middleware sets the `platform_lang` cookie; the platform layout re-renders with all UI strings in the selected language; the `<html lang>` attribute updates to match.

9. **Given** the `[lang]` URL segment is set to any value, **When** any Server Component in the `[lang]/(platform)` route group renders, **Then** it calls `resolveUILang(params.lang)` to resolve the display language and renders translated strings from the typed `Translations` object — no hardcoded English strings in platform-agnostic UI. Unsupported languages (e.g. `pt`) render in English via `resolveUILang` fallback.

## Tasks / Subtasks

- [x] Task 1: Prisma schema changes (AC: #1)
  - [x] 1.1 Add `SwissCanton` model: `code String @id`, `translations SwissCantonTranslation[]`, `locations SwissLocation[]`, `@@map("swiss_cantons")`
  - [x] 1.2 Add `SwissCantonTranslation` model: `cantonCode String`, `language String`, `name String`, `canton SwissCanton @relation(...)`, `@@id([cantonCode, language])`, `@@map("swiss_canton_translations")`
  - [x] 1.3 Update `SwissLocation`: remove `name String`, remove `canton String`, remove `@@unique([plz, name])`, remove `@@index([canton])`; add `swisstopoId String @unique @map("swisstopo_id")`, add `cantonCode String @map("canton_code")`, add `canton SwissCanton @relation(fields: [cantonCode], references: [code])`, add `translations SwissLocationTranslation[]`; keep `id`, `plz`, `location Location?`
  - [x] 1.4 Add `SwissLocationTranslation` model: `swissLocationId String @map("swiss_location_id")`, `language String`, `name String`, `swissLocation SwissLocation @relation(...)`, `@@id([swissLocationId, language])`, `@@map("swiss_location_translations")`
  - [x] 1.5 Add `defaultLanguage String @default("fr") @map("default_language")` to `Club` model
  - [x] 1.6 Updated init migration SQL directly; reset dev DB with `prisma migrate reset --force` and `prisma generate`

- [x] Task 2: Seed canton data and update existing test clubs (AC: #2, #7)
  - [x] 2.1 In `prisma/seed.ts`, add a canton seed block before the clubs section using `prisma.swissCanton.upsert` for all 26 cantons. Each canton upsert also creates its 4 `SwissCantonTranslation` rows via nested `createMany`
  - [x] 2.2 See Dev Notes for the complete canton translation table
  - [x] 2.3 Add `defaultLanguage: 'fr'` to both `clubValais` and `clubLausanne` upsert `create` blocks

- [x] Task 3: Update `/api/locations/route.ts` to use swisstopo (AC: #3, #4)
  - [x] 3.1 Replace the Nominatim base URL and fetch logic with swisstopo SearchServer calls
  - [x] 3.2 Add `lang` query param (default `'en'` if omitted); pass to swisstopo `lang` param
  - [x] 3.3 Filter API results to `origin === 'gg25'` (municipalities only); skip cantons/transport
  - [x] 3.4 Parse `attrs.label` to extract city name (strip `<b>`, `</b>`, and ` (XX)` canton suffix) and canton code (extract from the parenthesized suffix)
  - [x] 3.5 Update `SwissLocationResult` type to `{ swisstopoId: string; plz: string; name: string; cantonCode: string }`
  - [x] 3.6 Update in-memory cache key to include `lang` (e.g., `${country}:${lang}:${q}`)
  - [x] 3.7 Validate `lang` param — accept only `en|fr|de|it`; default to `en`

- [x] Task 4: Create `upsertSwissLocation` server utility (AC: #5, #6)
  - [x] 4.1 Create `src/lib/server/location.ts`
  - [x] 4.2 Export type: `UpsertSwissLocationInput = { swisstopoId: string; plz: string; cantonCode: string; nameFr: string }`
  - [x] 4.3 Export `upsertSwissLocation(input: UpsertSwissLocationInput): Promise<{ locationId: string }>`
  - [x] 4.4 Check if `SwissLocation` with `swisstopoId` already exists — if yes, find its `Location` record and return `{ locationId }`
  - [x] 4.5 If not found: query swisstopo SearchServer once per language (`['fr','de','it','en']`), for each: `searchText=nameFr&lang={lang}`, find the result where `id === swisstopoId`, extract the stripped name
  - [x] 4.6 If a language-specific name cannot be resolved from the API (network error or no match), fall back to using `nameFr` for that language slot (graceful degradation, not a hard failure)
  - [x] 4.7 In a `prisma.$transaction`: create `SwissLocation` + 4 `SwissLocationTranslation` rows + the `Location` bridge record (`country: "ch"`, `swissLocationId: newSwissLocation.id`)
  - [x] 4.8 Return `{ locationId: location.id }`

- [x] Task 5: Tests (AC: #5, #6)
  - [x] 5.1 Create `src/__tests__/location.test.ts`
  - [x] 5.2 Test: `upsertSwissLocation` — new city → creates `SwissLocation` + 4 translations + `Location`; returns correct `locationId`
  - [x] 5.3 Test: `upsertSwissLocation` — existing `swisstopoId` → no new rows created; returns existing `locationId`
  - [x] 5.4 Test: `upsertSwissLocation` — API returns no match for a language → falls back to `nameFr` for that slot (tested both no-match and network-error cases)
  - [x] 5.5 Run `pnpm test` — 193 tests pass across 25 files, no regressions

- [x] Task 6: i18n core module (AC: #8, #9)
  - [x] 6.1 ~~Create~~ `src/lib/i18n/index.ts` **already exists** — exports `SupportedLanguage`, `SUPPORTED_LANGUAGES`, `PLATFORM_FALLBACK_LANG = 'en'`, `isSupportedLanguage()`, `resolveUILang()`. Verify the file matches the spec; no changes needed if it does.
  - [x] 6.2 ~~Create~~ `src/lib/i18n/get-language.ts` **already exists** — exports `getLanguage(): Promise<SupportedLanguage>` reading the `platform_lang` cookie. Verify the file matches the spec; no changes needed if it does.
  - [x] 6.3 Update `src/proxy.ts`: replace the stub `proxy()` function body — reads the first path segment; if it's a supported language, sets `platform_lang` cookie (path `/`, 1-year max-age, SameSite=Lax) and passes through; if path is `/` or no lang segment found, detect preferred language from `Accept-Language` header (parse first BCP 47 lang tag → `resolveUILang`) and redirect to `/{lang}{pathname}`. Update `config.matcher` to also skip `api`, `admin`, `auth`, `my-clubs`

- [x] Task 7: Platform translation files (AC: #8, #9)
  - [x] 7.1 Create `src/lib/i18n/translations.ts`: export `Translations` type. Final shape includes: `nav`, `common` (+ `confirm`), `language`, `auth` (with `fields` and `form` sub-namespaces covering all auth page and form strings — field labels, button labels, strength indicators, TOTP/passkey UI, confirm dialogs), `myClubs`, `admin`, `club` (with `membership` sub-namespace covering all MembershipPanel strings)
  - [x] 7.2 Implement 4 translation objects in the same file (`fr`, `de`, `it`, `en`), each satisfying `Translations` — all platform UI strings translated; no hardcoded English in any platform-facing component
  - [x] 7.3 Export `getTranslations(lang: SupportedLanguage): Translations` — simple object lookup (no async, no dynamic import)
  - [x] 7.4 All client components (`LoginForm`, `PasskeyButton`, `TotpForm`, `TotpSetupForm`, `SetupPasswordForm`, `ChangePasswordForm`, `ManageTotpSection`, `ManagePasskeysSection`, `MembershipPanel`) accept a typed `t` prop passed from their parent Server Component page; translations flow server → client at render time

- [x] Task 8: `LanguageSwitcher` client component (AC: #8)
  - [x] 8.1 Create `src/components/app/LanguageSwitcher.tsx` — `'use client'`; accept props: `currentLang: string` (the raw `params.lang` value). Use `usePathname()` from `next/navigation` internally to read the current URL path.
  - [x] 8.2 Render 4 inline buttons (`FR`, `DE`, `IT`, `EN`); active button (where button lang === `resolveUILang(currentLang)`) styled distinctly (e.g. `font-bold underline`); all other buttons `font-normal opacity-70`
  - [x] 8.3 On click: derive the new path by splitting `usePathname()` result on `'/'`, replacing segment index 1 with `newLang`, and rejoining — e.g. `['', 'fr', 'ch', 'ski-club'].with(1, 'de').join('/')` → `'/de/ch/ski-club'`; call `router.push(newPath)` via `useRouter()`; show `isPending` visual feedback using `useTransition`
  - [x] 8.4 No `currentPath` prop, no Server Action, no `setLanguage` import — path derivation is internal; proxy.ts handles the cookie side-effect automatically on the next request

- [x] Task 9: Route restructure, platform layout, root `<html lang>`, and URL helpers (AC: #8, #9)
  - [x] 9.1 Move `src/app/(platform)/page.tsx` to `src/app/[lang]/(platform)/page.tsx` — **delete** `src/app/(platform)/page.tsx` after copying
  - [x] 9.2 Create `src/app/[lang]/(platform)/layout.tsx` — Server Component; `params: { lang: string }`; resolve `uiLang = resolveUILang(params.lang)`; call `getTranslations(uiLang)` for the layout strings; render a minimal sticky header with the `LanguageSwitcher` (pass only `currentLang={params.lang}`) and `{children}` below
  - [x] 9.3 Update `src/app/[lang]/(platform)/page.tsx` — `params: { lang: string }`; resolve `uiLang = resolveUILang(params.lang)`; call `getTranslations(uiLang)`, replace any hardcoded English strings with `t.*` keys
  - [x] 9.4 Update `src/app/layout.tsx` — make the function `async`; import `getLanguage` from `@/lib/i18n/get-language`; replace `lang="en"` on `<html>` with `lang={await getLanguage()}`
  - [x] 9.5 Update `src/lib/url.ts` — add `lang: string` as second parameter to `buildClubAdminUrl(host, lang, country, slug)` and include it in the returned path: `${protocol}://${host}/${lang}/${country}/${slug}`; update `src/__tests__/url.test.ts` accordingly
  - [x] 9.6 Update `src/app/my-clubs/page.tsx` (or its layout) — call `getLanguage()` (reads `platform_lang` cookie) to get the current UI lang; pass it to `MyClubsList` as a `lang` prop; update `MyClubsList` to forward `lang` to `buildClubAdminUrl`

- [x] Task 10: Safety checks (AC: all)
  - [x] 10.1 Run `pnpm test` — all existing tests pass, no regressions
  - [x] 10.2 Run `pnpm tsc --noEmit` — zero TypeScript errors
  - [x] 10.3 Run `pnpm lint` — clean exit
  - [x] 10.4 Run `pnpm audit` — no vulnerabilities
  - [x] 10.5 Run `pnpm build` — production build succeeds

## Dev Notes

### Prisma Schema — Final Shape

**New models to add after `model SwissLocation`:**

```prisma
model SwissCanton {
  code         String                   @id
  translations SwissCantonTranslation[]
  locations    SwissLocation[]

  @@map("swiss_cantons")
}

model SwissCantonTranslation {
  cantonCode String @map("canton_code")
  language   String // "en" | "fr" | "de" | "it"
  name       String

  canton SwissCanton @relation(fields: [cantonCode], references: [code], onDelete: Cascade)

  @@id([cantonCode, language])
  @@map("swiss_canton_translations")
}

model SwissLocationTranslation {
  swissLocationId String @map("swiss_location_id")
  language        String // "en" | "fr" | "de" | "it"
  name            String

  swissLocation SwissLocation @relation(fields: [swissLocationId], references: [id], onDelete: Cascade)

  @@id([swissLocationId, language])
  @@map("swiss_location_translations")
}
```

**Updated `SwissLocation`:**

```prisma
model SwissLocation {
  id          String @id @default(cuid())
  swisstopoId String @unique @map("swisstopo_id")
  plz         String // primary postal code (display only)
  cantonCode  String @map("canton_code")

  canton       SwissCanton              @relation(fields: [cantonCode], references: [code])
  translations SwissLocationTranslation[]
  location     Location?

  @@map("swiss_locations")
}
```

**`Club` model addition** (add after `templateVersion`):

```prisma
defaultLanguage String @default("fr") @map("default_language") // "en" | "fr" | "de" | "it"
```

---

### Canton Translation Reference (for seed)

All 26 cantons with translations for `de`, `fr`, `it`, `en`:

| code | de | fr | it | en |
|------|----|----|----|----|
| AG | Aargau | Argovie | Argovia | Aargau |
| AI | Appenzell Innerrhoden | Appenzell Rhodes-Intérieures | Appenzello Interno | Appenzell Inner Rhodes |
| AR | Appenzell Ausserrhoden | Appenzell Rhodes-Extérieures | Appenzello Esterno | Appenzell Outer Rhodes |
| BE | Bern | Berne | Berna | Bern |
| BL | Basel-Landschaft | Bâle-Campagne | Basilea Campagna | Basel-Country |
| BS | Basel-Stadt | Bâle-Ville | Basilea Città | Basel-City |
| FR | Freiburg | Fribourg | Friburgo | Fribourg |
| GE | Genf | Genève | Ginevra | Geneva |
| GL | Glarus | Glaris | Glarona | Glarus |
| GR | Graubünden | Grisons | Grigioni | Graubünden |
| JU | Jura | Jura | Giura | Jura |
| LU | Luzern | Lucerne | Lucerna | Lucerne |
| NE | Neuenburg | Neuchâtel | Neuchâtel | Neuchâtel |
| NW | Nidwalden | Nidwald | Nidvaldo | Nidwalden |
| OW | Obwalden | Obwald | Obvaldo | Obwalden |
| SG | St. Gallen | Saint-Gall | San Gallo | St. Gallen |
| SH | Schaffhausen | Schaffhouse | Sciaffusa | Schaffhausen |
| SO | Solothurn | Soleure | Soletta | Solothurn |
| SZ | Schwyz | Schwytz | Svitto | Schwyz |
| TG | Thurgau | Thurgovie | Turgovia | Thurgau |
| TI | Tessin | Tessin | Ticino | Ticino |
| UR | Uri | Uri | Uri | Uri |
| VD | Waadt | Vaud | Vaud | Vaud |
| VS | Wallis | Valais | Vallese | Valais |
| ZG | Zug | Zoug | Zugo | Zug |
| ZH | Zürich | Zurich | Zurigo | Zurich |

**Seed pattern example:**
```typescript
await prisma.swissCanton.upsert({
  where: { code: 'GE' },
  update: {},
  create: {
    code: 'GE',
    translations: {
      createMany: {
        data: [
          { language: 'de', name: 'Genf' },
          { language: 'fr', name: 'Genève' },
          { language: 'it', name: 'Ginevra' },
          { language: 'en', name: 'Geneva' },
        ],
        skipDuplicates: true,
      },
    },
  },
})
```

Run the same pattern for all 26 cantons. Wrap all upserts in a single `for` loop over a static data array for brevity.

---

### `/api/locations/route.ts` — Updated Shape

The route switches from Nominatim to swisstopo SearchServer. Key changes:

**New `SwissLocationResult` type:**
```typescript
export type SwissLocationResult = {
  swisstopoId: string // swisstopo feature id (e.g. "2117")
  plz: string        // postal code
  name: string       // localized city name for the requested lang
  cantonCode: string // 2-letter canton code, e.g. "GE"
}
```

**Updated query params:** add `lang` (default `'en'`).

**swisstopo fetch:**
```typescript
const SWISSTOPO_SEARCH_API = 'https://api3.geo.admin.ch/rest/services/api/SearchServer'

async function fetchSwissLocations(q: string, lang: string): Promise<SwissLocationResult[]> {
  const url = new URL(SWISSTOPO_SEARCH_API)
  url.searchParams.set('searchText', q)
  url.searchParams.set('type', 'locations')
  url.searchParams.set('lang', lang)
  url.searchParams.set('sr', '4326')
  url.searchParams.set('returnGeometry', 'false')
  url.searchParams.set('limit', '10')

  const res = await fetch(url.toString(), { next: { revalidate: 0 } })
  if (!res.ok) throw new Error(`swisstopo responded with ${res.status}`)

  const data = await res.json() as { results: SwisstopoFeature[] }

  return data.results
    .filter(r => r.attrs.origin === 'gg25') // municipalities only
    .map(r => {
      const label = r.attrs.label.replace(/<[^>]+>/g, '') // strip HTML tags
      const cantonMatch = label.match(/\(([A-Z]{2})\)$/)
      const cantonCode = cantonMatch?.[1] ?? ''
      const name = label.replace(/\s*\([A-Z]{2}\)$/, '').trim()
      const plz = r.attrs.detail?.match(/\d{4}/)?.[0] ?? ''
      return { swisstopoId: String(r.id), plz, name, cantonCode }
    })
    .filter(r => r.cantonCode !== '') // discard malformed results
}

type SwisstopoFeature = {
  id: number | string
  attrs: {
    origin: string
    label: string
    detail?: string
  }
}
```

**Cache key:** `${country}:${lang}:${q.toLowerCase()}`

---

### `src/lib/server/location.ts` — `upsertSwissLocation`

```typescript
import { prisma } from '@/server/db'

const SWISSTOPO_SEARCH_API = 'https://api3.geo.admin.ch/rest/services/api/SearchServer'

export type UpsertSwissLocationInput = {
  swisstopoId: string
  plz: string
  cantonCode: string
  nameFr: string // French name used as canonical search reference
}

export async function upsertSwissLocation(
  input: UpsertSwissLocationInput,
): Promise<{ locationId: string }> {
  // Idempotency check
  const existing = await prisma.swissLocation.findUnique({
    where: { swisstopoId: input.swisstopoId },
    select: { location: { select: { id: true } } },
  })
  if (existing?.location) {
    return { locationId: existing.location.id }
  }

  // Resolve all 4 language names from swisstopo
  const languages = ['fr', 'de', 'it', 'en'] as const
  const translations: { language: string; name: string }[] = []

  for (const lang of languages) {
    try {
      const name = await resolveNameForLanguage(input.swisstopoId, input.nameFr, lang)
      translations.push({ language: lang, name })
    } catch {
      // Graceful fallback: use French name if API fails for this language
      translations.push({ language: lang, name: input.nameFr })
    }
  }

  // Create all records in a single transaction
  const location = await prisma.$transaction(async (tx) => {
    const swissLoc = await tx.swissLocation.create({
      data: {
        swisstopoId: input.swisstopoId,
        plz: input.plz,
        cantonCode: input.cantonCode,
        translations: { createMany: { data: translations } },
      },
    })
    return tx.location.create({
      data: { country: 'ch', swissLocationId: swissLoc.id },
    })
  })

  return { locationId: location.id }
}

async function resolveNameForLanguage(
  swisstopoId: string,
  nameFr: string,
  lang: string,
): Promise<string> {
  const url = new URL(SWISSTOPO_SEARCH_API)
  url.searchParams.set('searchText', nameFr)
  url.searchParams.set('type', 'locations')
  url.searchParams.set('lang', lang)
  url.searchParams.set('sr', '4326')
  url.searchParams.set('returnGeometry', 'false')
  url.searchParams.set('limit', '20')

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`swisstopo ${lang} lookup failed: ${res.status}`)

  const data = await res.json() as { results: Array<{ id: number | string; attrs: { label: string; origin: string } }> }
  const match = data.results.find(r => String(r.id) === swisstopoId)
  if (!match) throw new Error(`swisstopoId ${swisstopoId} not found in ${lang} results`)

  // Strip HTML and canton suffix: "<b>Genf (GE)</b>" → "Genf"
  return match.attrs.label
    .replace(/<[^>]+>/g, '')
    .replace(/\s*\([A-Z]{2}\)$/, '')
    .trim()
}
```

---

### Translation Reference (for `translations.ts`)

```typescript
// src/lib/i18n/translations.ts (shape reference — implement all 4 objects)
const fr: Translations = {
  nav:      { home: 'Accueil', apply: 'Candidature', myClubs: 'Mes clubs', login: 'Connexion', logout: 'Déconnexion' },
  common:   { loading: 'Chargement…', error: 'Erreur', save: 'Enregistrer', cancel: 'Annuler', submit: 'Envoyer' },
  language: { label: 'Langue', fr: 'Français', de: 'Allemand', it: 'Italien', en: 'Anglais' },
}
const de: Translations = {
  nav:      { home: 'Startseite', apply: 'Bewerbung', myClubs: 'Meine Vereine', login: 'Anmelden', logout: 'Abmelden' },
  common:   { loading: 'Laden…', error: 'Fehler', save: 'Speichern', cancel: 'Abbrechen', submit: 'Absenden' },
  language: { label: 'Sprache', fr: 'Französisch', de: 'Deutsch', it: 'Italienisch', en: 'Englisch' },
}
const it: Translations = {
  nav:      { home: 'Home', apply: 'Candidatura', myClubs: 'I miei club', login: 'Accedi', logout: 'Esci' },
  common:   { loading: 'Caricamento…', error: 'Errore', save: 'Salva', cancel: 'Annulla', submit: 'Invia' },
  language: { label: 'Lingua', fr: 'Francese', de: 'Tedesco', it: 'Italiano', en: 'Inglese' },
}
const en: Translations = {
  nav:      { home: 'Home', apply: 'Apply', myClubs: 'My Clubs', login: 'Login', logout: 'Logout' },
  common:   { loading: 'Loading…', error: 'Error', save: 'Save', cancel: 'Cancel', submit: 'Submit' },
  language: { label: 'Language', fr: 'French', de: 'German', it: 'Italian', en: 'English' },
}
```

### `src/lib/url.ts` — Updated `buildClubAdminUrl`

Add `lang` as the second parameter:

```typescript
export function buildClubAdminUrl(host: string, lang: string, country: string, slug: string): string {
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  return `${protocol}://${host}/${lang}/${country}/${slug}`
}
```

Update `src/__tests__/url.test.ts` to pass `lang` in all 5 test cases (use `'fr'` as the test lang value).

Update `src/components/app/my-clubs/MyClubsList.tsx`: add a `lang: string` prop to the component and forward it to `buildClubAdminUrl(host, lang, m.club.country, m.club.slug)`.

Update `src/app/my-clubs/page.tsx`: import `getLanguage` from `@/lib/i18n/get-language`; pass `lang={await getLanguage()}` to `MyClubsList`.

---

### `src/proxy.ts` — Updated Shape

Replaces the existing stub `proxy()` function. The file already exists with the correct export name and `config.matcher` — only the function body and matcher need updating.

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isSupportedLanguage, resolveUILang } from '@/lib/i18n'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = segments[0]

  if (firstSegment && isSupportedLanguage(firstSegment)) {
    // Valid lang in URL → set cookie and pass through
    const response = NextResponse.next()
    response.cookies.set('platform_lang', firstSegment, {
      path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax',
    })
    return response
  }

  // No lang (or unsupported first segment) → detect and redirect
  const acceptLang = request.headers.get('accept-language') ?? ''
  const preferred = acceptLang.split(',')[0]?.trim().split(/[-;]/)[0].toLowerCase() ?? ''
  const lang = resolveUILang(preferred)
  const url = request.nextUrl.clone()
  url.pathname = `/${lang}${pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: ['/((?!api|admin|auth|my-clubs|_next|favicon\\.ico|robots\\.txt|sitemap\\.xml).*)'],
}
```

**⚠️ Edge Runtime note:** `resolveUILang` is imported from `@/lib/i18n` — `src/proxy.ts` runs in the Edge Runtime; it must not import Node.js-only modules. The `src/lib/i18n/index.ts` module is pure TypeScript with no Node.js dependencies, so it is safe to import here.

---

### Notes on Future Work

- **`ActivityType` i18n**: The `ActivityType` model has a single `name: String`. Directory filtering will eventually need multilingual activity type names. This is out of scope here — address it in Epic 3 (story 3-2) when the directory UI is built.
- **`Country` model**: If a second country is added, a `Country` model with translation rows (mirroring the `SwissCanton` pattern) should be introduced. For MVP with Switzerland only, `country: String` on `Location` and `Club` is sufficient.
- **Apply form wiring**: Story 2-1 consumes `GET /api/locations` for its city typeahead. The form should submit `swisstopoId`, `plz`, `cantonCode`, and the French city name (`nameFr`) as part of the application payload. Story 2-3 calls `upsertSwissLocation` during approval.

### Current State of `/api/locations/route.ts`

The file already exists as a Nominatim-based stub (`src/app/api/locations/route.ts`). **It must be replaced** — the Nominatim endpoint lacks the `swisstopoId` needed for idempotent location storage, doesn't support the `lang` parameter, and returns an old `{ plz, name, canton }` shape (no `swisstopoId`, no `cantonCode`).

The story's Task 3 is therefore: **replace the implementation** of the existing file (keep the file, update everything inside it).

### Prisma Middleware Exclusion — Critical Check

`src/server/db.ts` has multi-tenant middleware that rejects any club-scoped Prisma query that lacks a `clubId` filter. The models added in this story — `SwissCanton`, `SwissCantonTranslation`, `SwissLocation`, `SwissLocationTranslation`, `Location` — are **platform-level models** with no `clubId`. Verify the middleware exclusion list includes all of them before running the first query, or the middleware will throw.

[Source: src/server/db.ts — exclusion list]

### Testing Notes

**Test file:** `src/__tests__/location.test.ts`

**Mock setup (follows story 1.9 `$transaction` pattern):**
```typescript
vi.mock('@/server/db', () => ({
  prisma: {
    swissLocation: { findUnique: vi.fn(), create: vi.fn() },
    location: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}))
```

**⚠️ Interactive `$transaction` mock** — `upsertSwissLocation` uses a callback-based transaction. Mock it as:
```typescript
vi.mocked(prisma.$transaction).mockImplementation(async (fn) => fn(prisma as never))
```
This routes `tx.swissLocation.create` and `tx.location.create` through the same mocked `prisma` instance.

**`beforeEach` default setup:**
```typescript
const SWISS_LOCATION = { id: 'swiss-loc-1', location: null }
const LOCATION = { id: 'location-1' }

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(prisma.swissLocation.findUnique).mockResolvedValue(null) // default: new city
  vi.mocked(prisma.swissLocation.create).mockResolvedValue({ id: 'swiss-loc-1' } as never)
  vi.mocked(prisma.location.create).mockResolvedValue(LOCATION as never)
  vi.mocked(prisma.$transaction).mockImplementation(async (fn) => fn(prisma as never))
})
```

**Also mock `fetch`** for the swisstopo calls inside `resolveNameForLanguage`:
```typescript
global.fetch = vi.fn()
// In each test, mock the 4 language calls:
vi.mocked(fetch).mockResolvedValue({
  ok: true,
  json: async () => ({ results: [{ id: 123, attrs: { origin: 'gg25', label: '<b>Genf (GE)</b>' } }] }),
} as Response)
```

**Test baseline:** 189 tests across 24 files. Add ~4 new tests → ~193 tests without regressions.

[Source: src/__tests__/revoke-access.test.ts — $transaction mock pattern]

### Accumulated Learnings from Stories 1.1-1.9

1. **Prisma import path**: always `from '@/generated/prisma/client'` for types; `from '@/server/db'` for the `prisma` instance
2. **pnpm commands**: always `bash -c 'NVM_DIR="/Users/bastienfaivre/.nvm" && source "$NVM_DIR/nvm.sh" && pnpm ...'`
3. **seed.ts**: uses raw PrismaClient with pg adapter (no clubId middleware) — follow the existing constructor pattern in `prisma/seed.ts`
4. **No `prisma generate` needed separately** — `migrate dev` runs it automatically
5. **`await params`** — `params` is a Promise in Next.js 16 App Router; always `const { country } = await params` in route files
6. **No `redirect()` in typed Server Actions** — return typed results, let client handle navigation
7. **`prisma.$transaction` (interactive callback form)** — use for any operation creating multiple linked records; mock with `async (fn) => fn(prisma)` in tests [Source: story 1.9 pass 2 review]
8. **Route Handlers use `Response.json()`** not `NextResponse.json()` in Next.js 16 (either works, but `Response.json()` is the platform standard)
9. **Public Route Handlers (no auth guard)** — `GET /api/locations` is a public endpoint; no auth check needed
10. **`next: { revalidate: 0 }` on `fetch` inside Route Handlers** — explicitly opts out of Next.js route cache for live API calls

### Git Intelligence (Recent Commits)

```
2b124e9 feat: epic 1 retrospective + epic 2 planning  ← this story created here (Status: backlog)
ac99294 fix: updated packages
9f280aa feat: story 1.9  — revokeAccess action, MembershipPanel revoke UI, 187 tests
c106031 feat: story 1.8  — transferOwnership action, MembershipPanel confirm inline, 176 tests
08a219d feat: story 1.7  — inviteEditor, accept route, MembershipPanel, 166 tests
```

Story 2.0 is the first story in Epic 2 — no prior Epic 2 story patterns to follow. The primary patterns are the Route Handler pattern (from `api/locations/route.ts` stub) and the `upsertSwissLocation` server utility (new file following `src/lib/server/club-queries.ts` pattern).

### Files to Create/Modify

**Modified:**
```
prisma/schema.prisma
prisma/seed.ts
src/app/api/locations/route.ts
src/app/layout.tsx                              # async, lang from cookie
src/proxy.ts                                    # lang detection + platform_lang cookie
```

**Created:**
```
src/lib/server/location.ts
src/lib/server/swisstopo-constants.ts
src/__tests__/location.test.ts
src/lib/i18n/index.ts                           # SupportedLanguage, resolveUILang
src/lib/i18n/get-language.ts                    # getLanguage() cookie reader
src/lib/i18n/translations.ts                    # Translations type + 4 objects
src/app/[lang]/(platform)/layout.tsx           # LanguageSwitcher header
src/app/[lang]/(platform)/page.tsx             # translated stub (moved from (platform)/)
src/components/app/LanguageSwitcher.tsx        # router.push lang navigation
```

## Dev Agent Record

### Agent Model Used

claude-sonnet-4-6

### Debug Log References

- Init migration updated in-place (no incremental migration); dev DB reset with `prisma migrate reset --force` + `prisma generate` + `prisma db seed`.

### Completion Notes List

- Updated `prisma/migrations/init/migration.sql` directly: added `swiss_cantons`, `swiss_canton_translations`, `swiss_location_translations` tables; updated `swiss_locations` (replaced `name`/`canton` with `swisstopo_id`/`canton_code`); added `default_language` to `clubs`.
- Added `SwissCanton`, `SwissCantonTranslation`, `SwissLocationTranslation` models to schema; updated `SwissLocation`; added `defaultLanguage` to `Club`.
- Seeded all 26 Swiss cantons with 4-language translations; set `defaultLanguage: 'fr'` on both test clubs.
- Replaced Nominatim-based `/api/locations/route.ts` with swisstopo SearchServer implementation supporting `lang` param, `gg25`-only filtering, and updated cache key.
- Created `src/lib/server/location.ts` with `upsertSwissLocation` — idempotent, transaction-safe, 4-language resolution with graceful fallback to `nameFr`.
- Code review fixed: orphaned SwissLocation idempotency bug (H1), TypeScript errors (H3), missing route handler tests for AC#3 and AC#4 (H2), unused constant (M1), `origin=gg25` filter in `resolveNameForLanguage` (M2), global.fetch cleanup (M3), shared API constant (L1), bounded cache (L2).
- 12 tests in `src/__tests__/location.test.ts`; 201 total tests pass (0 regressions). `pnpm tsc --noEmit`, `pnpm lint`, `pnpm audit`, `pnpm build` all clean.

### File List

- `prisma/schema.prisma` (modified)
- `prisma/migrations/init/migration.sql` (modified)
- `prisma/seed.ts` (modified)
- `src/app/api/locations/route.ts` (modified)
- `src/lib/server/location.ts` (created)
- `src/lib/server/swisstopo-constants.ts` (created)
- `src/__tests__/location.test.ts` (created)
- `src/proxy.ts` (modified)
- `src/lib/i18n/translations.ts` (created)
- `src/components/app/LanguageSwitcher.tsx` (created)
- `src/app/[lang]/(platform)/layout.tsx` (created)
- `src/app/[lang]/(platform)/page.tsx` (created)
- `src/app/[lang]/(country)/[country]/[club]/layout.tsx` (created — moved from `(country)/[country]/[club]/layout.tsx`)
- `src/app/[lang]/(country)/[country]/[club]/page.tsx` (created — moved from `(country)/[country]/[club]/page.tsx`)
- `src/app/[lang]/(country)/[country]/[club]/settings/page.tsx` (created — moved from `(country)/[country]/[club]/settings/page.tsx`)
- `src/app/[lang]/(country)/[country]/[club]/settings/actions.ts` (created — moved from `(country)/[country]/[club]/settings/actions.ts`)
- `src/app/(platform)/page.tsx` (deleted)
- `src/app/(country)/[country]/[club]/layout.tsx` (deleted)
- `src/app/(country)/[country]/[club]/page.tsx` (deleted)
- `src/app/(country)/[country]/[club]/settings/page.tsx` (deleted)
- `src/app/(country)/[country]/[club]/settings/actions.ts` (deleted)
- `src/app/layout.tsx` (modified)
- `src/lib/url.ts` (modified)
- `src/lib/i18n/index.ts` (verified — no changes needed)
- `src/lib/i18n/get-language.ts` (verified — no changes needed)
- `src/components/app/my-clubs/MyClubsList.tsx` (modified)
- `src/components/app/settings/MembershipPanel.tsx` (modified — import path updated)
- `src/app/my-clubs/page.tsx` (deleted — moved to `[lang]/my-clubs/page.tsx`)
- `src/app/[lang]/my-clubs/page.tsx` (created — with lang params + lang-prefixed redirects)
- `src/app/auth/` (deleted — all auth pages/routes moved under `[lang]/auth/`)
- `src/app/[lang]/auth/login/page.tsx` (created)
- `src/app/[lang]/auth/login/actions.ts` (created — moved)
- `src/app/[lang]/auth/setup/page.tsx` (created)
- `src/app/[lang]/auth/setup/actions.ts` (created — moved)
- `src/app/[lang]/auth/totp/page.tsx` (created)
- `src/app/[lang]/auth/totp/actions.ts` (created — moved)
- `src/app/[lang]/auth/totp-setup/page.tsx` (created)
- `src/app/[lang]/auth/totp-setup/actions.ts` (created — moved)
- `src/app/[lang]/auth/account/page.tsx` (created)
- `src/app/[lang]/auth/account/actions.ts` (created — moved)
- `src/app/[lang]/auth/error/page.tsx` (created)
- `src/app/[lang]/auth/invite/accept/route.ts` (created — moved)
- `src/app/[lang]/auth/logout/route.ts` (created — moved)
- `src/app/[lang]/auth/magic-link/route.ts` (created — moved)
- `src/app/[lang]/auth/magic-link/actions.ts` (created — moved)
- `src/app/[lang]/auth/passkey/actions.ts` (created — moved)
- `src/app/admin/` (deleted — moved under `[lang]/admin/`)
- `src/app/[lang]/admin/(protected)/layout.tsx` (created — with lang params + lang-prefixed redirects)
- `src/app/[lang]/admin/(protected)/page.tsx` (created — moved)
- `src/app/dev/` (deleted)
- `src/components/app/auth/DevAuthPanel.tsx` (modified — removed magic link section, added lang-aware links)
- `src/components/app/auth/LoginForm.tsx` (modified — accepts `t` prop for field labels and button strings)
- `src/components/app/auth/PasskeyButton.tsx` (modified — accepts `t` prop)
- `src/components/app/auth/TotpForm.tsx` (modified — accepts `t` prop)
- `src/components/app/auth/TotpSetupForm.tsx` (modified — accepts `t` prop)
- `src/components/app/auth/SetupPasswordForm.tsx` (modified — accepts `t` prop; strength labels translated)
- `src/components/app/auth/ChangePasswordForm.tsx` (modified — accepts `t` prop)
- `src/components/app/auth/ManageTotpSection.tsx` (modified — accepts `t` prop)
- `src/components/app/auth/ManagePasskeysSection.tsx` (modified — accepts `t` prop)
- `src/components/app/settings/MembershipPanel.tsx` (modified — accepts `t` prop, all strings translated)
- `src/__tests__/url.test.ts` (modified)
- `src/__tests__/my-clubs.test.ts` (modified — new path + params + updated redirect assertions)
- `src/__tests__/admin-layout.test.ts` (modified — new path + params + updated redirect assertions)
- `src/__tests__/club-layout-guard.test.ts` (modified — updated redirect assertions to lang-prefixed)
- `src/__tests__/invite-editor.test.ts` (modified — import path updated)
- `src/__tests__/revoke-access.test.ts` (modified — import path updated)
- `src/__tests__/transfer-ownership.test.ts` (modified — import path updated)
- `src/__tests__/setup-password.test.ts` (modified — import path updated)
- `src/__tests__/totp-challenge.test.ts` (modified — import path updated)
- `src/__tests__/totp-setup.test.ts` (modified — import path updated)
- `src/__tests__/invite-accept.test.ts` (modified — import path updated)
- `src/__tests__/logout.test.ts` (modified — import path updated)
- `src/__tests__/magic-link-route.test.ts` (modified — import paths updated)
- `src/__tests__/proxy.test.ts` (modified — added cookie test helper + cookie-based redirect test)
- `src/__tests__/totp-banner.test.ts` (modified — updated to pass new lang + t props)
- `src/__tests__/login.test.ts` (created)
- `src/__tests__/account.test.ts` (created)
- `src/__tests__/passkey-actions.test.ts` (created)
- `src/__tests__/magic-link.test.ts` (created)
- `src/components/app/auth/TotpEnrollmentBanner.tsx` (modified — accepts lang + t props; href lang-prefixed; all strings translated)

## Change Log

- 2026-03-05: Story created by PM (John) following Epic 1 retrospective. Prerequisite for stories 2-1, 2-3, and 3-2.
- 2026-03-05: Implemented by claude-sonnet-4-6. All ACs satisfied, 193 tests passing.
- 2026-03-05: Code review by claude-sonnet-4-6. Fixed 2 High, 3 Medium, 2 Low issues. 201 tests passing.
- 2026-03-05: Story updated with Tasks 6-10 (i18n core module, translations, LanguageSwitcher, route restructure). Implemented by claude-sonnet-4-6. 201 tests passing, tsc clean, lint clean, build succeeds. Story marked done.
- 2026-03-05: Second code review by claude-sonnet-4-6. Fixed 2 High (proxy breaks club routes; missing dev matcher exclusion), 3 Medium (incomplete File List; missing proxy tests; internal links missing lang prefix), 2 Low (cookie secure flag; brand name). 212 tests passing, tsc clean, lint clean, build succeeds.
- 2026-03-05: Extended by user request. Moved all non-API pages (`auth/`, `my-clubs/`, `admin/`) under `[lang]/` so all pages are language-sensible. Removed proxy matcher exclusions for auth/admin/my-clubs (all pages now go through lang redirect). Added cookie-based lang resolution to proxy. Updated all page-level redirects to use `/${lang}/...`. Server action redirects remain lang-less (proxy+cookie handles them). Deleted `src/app/dev/` route. Updated DevAuthPanel to remove magic-link section and use lang-prefixed links. Updated all affected test files.
- 2026-03-05: Extended by user request. Expanded `Translations` type with `auth.fields`, `auth.form`, and `club.membership` sub-namespaces; added `common.confirm`. Translated all auth page strings (field labels, button states, strength indicators, TOTP/passkey UI, confirm dialogs) and MembershipPanel strings in all 4 languages. Updated all client components to accept a typed `t` prop; server pages pass translated strings at render time. No hardcoded English strings remain in any platform-facing component. 213 tests passing, tsc clean.
- 2026-03-05: Adversarial code review fixes — 3 High, 4 Medium, 2 Low. Added `lang` prop to ManageTotpSection, LoginForm, ManagePasskeysSection (lang-prefixed client navigation; locale-aware date formatting). Added `lang` + `t` props to TotpEnrollmentBanner (translated banner text; lang-prefixed link; added `auth.banner` namespace and passkey error strings to Translations). Updated club layout to pass translations to banner. Replaced duplicate MembershipPanelT interface with type alias. Removed stale eslint-disable comment from DevAuthPanel. Added 5 missing test files to File List.
