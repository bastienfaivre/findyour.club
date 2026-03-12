'use server'

import { revalidatePath } from 'next/cache'
import { getAuthSession } from '@/server/auth'
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
): Promise<{ success: boolean; error?: string }> {
  const session = await getAuthSession()
  if (!session?.user || session.user.role !== 'OPERATOR') {
    return { success: false, error: 'Unauthorized.' }
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
