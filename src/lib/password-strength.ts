export interface PasswordStrengthLabels {
  strengthTooShort: string
  strengthWeak: string
  strengthFair: string
  strengthStrong: string
}

export interface PasswordStrengthResult {
  label: string
  color: string
  progressColor: string
  value: number
}

export function getPasswordStrength(password: string, t: PasswordStrengthLabels): PasswordStrengthResult {
  if (password.length === 0) return { label: '', color: '', progressColor: '', value: 0 }
  if (password.length < 8) return { label: t.strengthTooShort, color: 'text-red-600', progressColor: '[&_[data-slot=progress-indicator]]:bg-red-500', value: 25 }
  const checks = [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z\d]/]
  const passed = checks.filter(r => r.test(password)).length
  if (password.length < 12 || passed < 3) return { label: t.strengthWeak, color: 'text-orange-500', progressColor: '[&_[data-slot=progress-indicator]]:bg-orange-500', value: 50 }
  if (passed < 4) return { label: t.strengthFair, color: 'text-yellow-600', progressColor: '[&_[data-slot=progress-indicator]]:bg-yellow-500', value: 75 }
  return { label: t.strengthStrong, color: 'text-green-600', progressColor: '[&_[data-slot=progress-indicator]]:bg-green-500', value: 100 }
}
