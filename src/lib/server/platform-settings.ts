import { prisma } from '@/server/db'

// ── Setting keys and their default values ──

const BOOLEAN_DEFAULTS = {
  'email.application_rejected': false,
  'email.operator_message': false,
  'email.force_offline': false,
  'registrations_enabled': true,
} as const

const NUMBER_DEFAULTS = {
  'rate.applications_per_hour': 3,
  'rate.login_attempts_per_hour': 5,
  'rate.support_messages_per_hour': 1,
  'rate.invitations_per_hour': 1,
  'limit.max_editors_per_club': 1,
  'limit.max_photos_per_club': 10,
  'limit.max_image_size_mb': 5,
  'limit.max_description_length': 5000,
  'limit.max_schedule_length': 2000,
  'limit.max_how_to_join_length': 2000,
  'limit.image_transactions_per_day': 30,
} as const

const STRING_DEFAULTS = {
  'maintenance_banner': '',
} as const

export type BooleanSettingKey = keyof typeof BOOLEAN_DEFAULTS
export type NumberSettingKey = keyof typeof NUMBER_DEFAULTS
export type StringSettingKey = keyof typeof STRING_DEFAULTS
export type SettingKey = BooleanSettingKey | NumberSettingKey | StringSettingKey

// ── Read helpers ──

export async function getBooleanSetting(key: BooleanSettingKey): Promise<boolean> {
  const flag = await prisma.featureFlag.findUnique({ where: { key } })
  if (!flag) return BOOLEAN_DEFAULTS[key]
  return flag.value === true
}

export async function getNumberSetting(key: NumberSettingKey): Promise<number> {
  const flag = await prisma.featureFlag.findUnique({ where: { key } })
  if (!flag) return NUMBER_DEFAULTS[key]
  return typeof flag.value === 'number' ? flag.value : NUMBER_DEFAULTS[key]
}

export async function getStringSetting(key: StringSettingKey): Promise<string> {
  const flag = await prisma.featureFlag.findUnique({ where: { key } })
  if (!flag) return STRING_DEFAULTS[key]
  return typeof flag.value === 'string' ? flag.value : STRING_DEFAULTS[key]
}

// ── Bulk read for settings page ──

export async function getAllSettings(): Promise<{
  booleans: Record<BooleanSettingKey, boolean>
  numbers: Record<NumberSettingKey, number>
  strings: Record<StringSettingKey, string>
}> {
  const allKeys = [
    ...Object.keys(BOOLEAN_DEFAULTS),
    ...Object.keys(NUMBER_DEFAULTS),
    ...Object.keys(STRING_DEFAULTS),
  ]
  const flags = await prisma.featureFlag.findMany({
    where: { key: { in: allKeys } },
  })
  const flagMap = new Map(flags.map((f) => [f.key, f.value]))

  const booleans = { ...BOOLEAN_DEFAULTS } as Record<BooleanSettingKey, boolean>
  for (const key of Object.keys(BOOLEAN_DEFAULTS) as BooleanSettingKey[]) {
    const val = flagMap.get(key)
    if (val !== undefined) booleans[key] = val === true
  }

  const numbers = { ...NUMBER_DEFAULTS } as Record<NumberSettingKey, number>
  for (const key of Object.keys(NUMBER_DEFAULTS) as NumberSettingKey[]) {
    const val = flagMap.get(key)
    if (typeof val === 'number') numbers[key] = val
  }

  const strings = { ...STRING_DEFAULTS } as Record<StringSettingKey, string>
  for (const key of Object.keys(STRING_DEFAULTS) as StringSettingKey[]) {
    const val = flagMap.get(key)
    if (typeof val === 'string') strings[key] = val
  }

  return { booleans, numbers, strings }
}

// ── Write helpers ──

export async function setSetting(key: SettingKey, value: boolean | number | string): Promise<void> {
  await prisma.featureFlag.upsert({
    where: { key },
    update: { value: value as never },
    create: { key, value: value as never },
  })
}

// ── Validation ──

const ALL_KEYS = new Set<string>([
  ...Object.keys(BOOLEAN_DEFAULTS),
  ...Object.keys(NUMBER_DEFAULTS),
  ...Object.keys(STRING_DEFAULTS),
])

export function isValidSettingKey(key: string): key is SettingKey {
  return ALL_KEYS.has(key)
}

export function isBooleanKey(key: string): key is BooleanSettingKey {
  return key in BOOLEAN_DEFAULTS
}

export function isNumberKey(key: string): key is NumberSettingKey {
  return key in NUMBER_DEFAULTS
}

export function isStringKey(key: string): key is StringSettingKey {
  return key in STRING_DEFAULTS
}
