import { getBooleanSetting, type BooleanSettingKey } from './platform-settings'

export type EmailSettingKey = Extract<BooleanSettingKey, `email.${string}`>

export async function isEmailEnabled(key: EmailSettingKey): Promise<boolean> {
  return getBooleanSetting(key)
}
