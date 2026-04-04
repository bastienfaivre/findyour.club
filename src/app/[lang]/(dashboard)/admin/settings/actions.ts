'use server'

import { revalidatePath } from 'next/cache'
import { requireOperator } from '@/lib/server/auth-guards'
import {
  setSetting,
  isValidSettingKey,
  isBooleanKey,
  isNumberKey,
  isStringKey,
} from '@/lib/server/platform-settings'

export async function updateSetting(
  key: string,
  value: boolean | number | string,
): Promise<{ success: boolean; error?: string; code?: string }> {
  const guard = await requireOperator()
  if ('error' in guard) return guard.error
  const { session } = guard
  if (session.user.totpEnabled && !session.user.totpVerified) {
    return { success: false, error: 'TOTP verification required.', code: 'TOTP_REQUIRED' }
  }

  if (!isValidSettingKey(key)) {
    return { success: false, error: 'Invalid setting key.' }
  }

  // Type validation
  if (isBooleanKey(key) && typeof value !== 'boolean') {
    return { success: false, error: 'Expected boolean value.' }
  }
  if (isNumberKey(key) && (typeof value !== 'number' || value < 0)) {
    return { success: false, error: 'Expected a non-negative number.' }
  }
  if (isStringKey(key) && typeof value !== 'string') {
    return { success: false, error: 'Expected string value.' }
  }

  await setSetting(key, value)
  revalidatePath('/[lang]/admin/settings', 'page')
  return { success: true }
}
