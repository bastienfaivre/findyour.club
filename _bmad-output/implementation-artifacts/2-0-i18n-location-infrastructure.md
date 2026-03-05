# Story 2.0: i18n Location Infrastructure

Status: backlog

## Story

As a platform engineer,
I want a multilingual location data model backed by the swisstopo geocoding API,
so that Swiss cities and cantons are stored as unique normalized entities with names in all four supported languages (fr/de/it/en), enabling the apply form typeahead, directory filtering, and correct SEO `lang` attributes.

## Context

This is a prerequisite story for 2-1 (Club Application Form), 2-3 (Application Approval), and 3-2 (Country Directory with Filtering). It must be completed before any of those stories begin.

The current `SwissLocation` model has a single `name: String` field (no translations) and a `canton: String` field (no normalization). This story replaces that with a fully multilingual, canton-normalized structure. The existing `/api/locations/route.ts` stub (Nominatim-based) is replaced with a swisstopo-backed route.

**Supported languages:** `en`, `fr`, `de`, `it` — stored as ISO 639-1 strings.

**Language resolution at display time:**
1. Visitor's resolved UI language (browser preference / explicit selection) — if in supported set → use it
2. If visitor's language is not supported (e.g., Portuguese) → fall back to `en` (platform default)
3. If `en` translation is missing → use `Club.defaultLanguage` translation
4. (Should not occur: all 4 translations are stored for every location at creation time)

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

## Tasks / Subtasks

- [ ] Task 1: Prisma schema changes (AC: #1)
  - [ ] 1.1 Add `SwissCanton` model: `code String @id`, `translations SwissCantonTranslation[]`, `locations SwissLocation[]`, `@@map("swiss_cantons")`
  - [ ] 1.2 Add `SwissCantonTranslation` model: `cantonCode String`, `language String`, `name String`, `canton SwissCanton @relation(...)`, `@@id([cantonCode, language])`, `@@map("swiss_canton_translations")`
  - [ ] 1.3 Update `SwissLocation`: remove `name String`, remove `canton String`, remove `@@unique([plz, name])`, remove `@@index([canton])`; add `swisstopoId String @unique @map("swisstopo_id")`, add `cantonCode String @map("canton_code")`, add `canton SwissCanton @relation(fields: [cantonCode], references: [code])`, add `translations SwissLocationTranslation[]`; keep `id`, `plz`, `location Location?`
  - [ ] 1.4 Add `SwissLocationTranslation` model: `swissLocationId String @map("swiss_location_id")`, `language String`, `name String`, `swissLocation SwissLocation @relation(...)`, `@@id([swissLocationId, language])`, `@@map("swiss_location_translations")`
  - [ ] 1.5 Add `defaultLanguage String @default("fr") @map("default_language")` to `Club` model
  - [ ] 1.6 Run `pnpm prisma migrate dev --name i18n-location-infrastructure` and verify migration applies cleanly

- [ ] Task 2: Seed canton data and update existing test clubs (AC: #2, #7)
  - [ ] 2.1 In `prisma/seed.ts`, add a canton seed block before the clubs section using `prisma.swissCanton.upsert` for all 26 cantons. Each canton upsert also creates its 4 `SwissCantonTranslation` rows via nested `create` (use `createMany` or individual upserts — your choice for seed idempotency)
  - [ ] 2.2 See Dev Notes for the complete canton translation table
  - [ ] 2.3 Add `defaultLanguage: 'fr'` to both `clubValais` and `clubLausanne` upsert `create` blocks

- [ ] Task 3: Update `/api/locations/route.ts` to use swisstopo (AC: #3, #4)
  - [ ] 3.1 Replace the Nominatim base URL and fetch logic with swisstopo SearchServer calls
  - [ ] 3.2 Add `lang` query param (default `'en'` if omitted); pass to swisstopo `lang` param
  - [ ] 3.3 Filter API results to `origin === 'gg25'` (municipalities only); skip cantons/transport
  - [ ] 3.4 Parse `attrs.label` to extract city name (strip `<b>`, `</b>`, and ` (XX)` canton suffix) and canton code (extract from the parenthesized suffix)
  - [ ] 3.5 Update `SwissLocationResult` type to `{ swisstopoId: string; plz: string; name: string; cantonCode: string }`
  - [ ] 3.6 Update in-memory cache key to include `lang` (e.g., `${country}:${lang}:${q}`)
  - [ ] 3.7 Validate `lang` param — accept only `en|fr|de|it`; default to `en`

- [ ] Task 4: Create `upsertSwissLocation` server utility (AC: #5, #6)
  - [ ] 4.1 Create `src/lib/server/location.ts`
  - [ ] 4.2 Export type: `UpsertSwissLocationInput = { swisstopoId: string; plz: string; cantonCode: string; nameFr: string }`
  - [ ] 4.3 Export `upsertSwissLocation(input: UpsertSwissLocationInput): Promise<{ locationId: string }>`
  - [ ] 4.4 Check if `SwissLocation` with `swisstopoId` already exists — if yes, find its `Location` record and return `{ locationId }`
  - [ ] 4.5 If not found: query swisstopo SearchServer once per language (`['fr','de','it','en']`), for each: `searchText=nameFr&lang={lang}`, find the result where `id === swisstopoId`, extract the stripped name
  - [ ] 4.6 If a language-specific name cannot be resolved from the API (network error or no match), fall back to using `nameFr` for that language slot (graceful degradation, not a hard failure)
  - [ ] 4.7 In a `prisma.$transaction`: create `SwissLocation` + 4 `SwissLocationTranslation` rows + the `Location` bridge record (`country: "ch"`, `swissLocationId: newSwissLocation.id`)
  - [ ] 4.8 Return `{ locationId: location.id }`

- [ ] Task 5: Tests (AC: #5, #6)
  - [ ] 5.1 Create `src/__tests__/location.test.ts`
  - [ ] 5.2 Test: `upsertSwissLocation` — new city → creates `SwissLocation` + 4 translations + `Location`; returns correct `locationId`
  - [ ] 5.3 Test: `upsertSwissLocation` — existing `swisstopoId` → no new rows created; returns existing `locationId`
  - [ ] 5.4 Test: `upsertSwissLocation` — API returns no match for a language → falls back to `nameFr` for that slot
  - [ ] 5.5 Run `pnpm test` — all existing tests pass, no regressions

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

### Notes on Future Work

- **`ActivityType` i18n**: The `ActivityType` model has a single `name: String`. Directory filtering will eventually need multilingual activity type names. This is out of scope here — address it in Epic 3 (story 3-2) when the directory UI is built.
- **`Country` model**: If a second country is added, a `Country` model with translation rows (mirroring the `SwissCanton` pattern) should be introduced. For MVP with Switzerland only, `country: String` on `Location` and `Club` is sufficient.
- **Apply form wiring**: Story 2-1 consumes `GET /api/locations` for its city typeahead. The form should submit `swisstopoId`, `plz`, `cantonCode`, and the French city name (`nameFr`) as part of the application payload. Story 2-3 calls `upsertSwissLocation` during approval.

### Accumulated Learnings from Stories 1.1-1.9

1. **Prisma import path**: always `from '@/generated/prisma/client'` for types; `from '@/server/db'` for the `prisma` instance
2. **`pnpm prisma migrate dev`**: uses `bash -c 'NVM_DIR="/Users/bastienfaivre/.nvm" && source "$NVM_DIR/nvm.sh" && pnpm ...'`
3. **seed.ts uses raw PrismaClient** with pg adapter — no clubId middleware. Follow the existing constructor pattern.
4. **No `prisma generate` needed separately** — `migrate dev` runs it automatically

### Files to Create/Modify

**Modified:**
```
prisma/schema.prisma
prisma/seed.ts
src/app/api/locations/route.ts
```

**Created:**
```
src/lib/server/location.ts
src/__tests__/location.test.ts
```

**Sprint status update (after story complete):**
```
_bmad-output/implementation-artifacts/sprint-status.yaml  # 2-0: ready-for-dev
```

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2026-03-05: Story created by PM (John) following Epic 1 retrospective. Prerequisite for stories 2-1, 2-3, and 3-2.
