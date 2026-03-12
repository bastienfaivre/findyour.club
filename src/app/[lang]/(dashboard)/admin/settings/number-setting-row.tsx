'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { updateSetting } from './actions'

interface NumberSettingRowProps {
  settingKey: string
  label: string
  description: string
  defaultValue: number
  savedLabel: string
  suffix?: string
  min?: number
  max?: number
}

export function NumberSettingRow({ settingKey, label, description, defaultValue, savedLabel, suffix, min = 1, max = 99999 }: NumberSettingRowProps) {
  const [value, setValue] = useState(defaultValue)
  const [isPending, startTransition] = useTransition()
  const hasChanged = value !== defaultValue

  function handleSave() {
    startTransition(async () => {
      const result = await updateSetting(settingKey, value)
      if (result.success) {
        toast.success(savedLabel)
      } else {
        toast.error(result.error ?? 'Error')
      }
    })
  }

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => setValue(Math.max(min, parseInt(e.target.value) || min))}
          className="w-20 text-right"
          disabled={isPending}
        />
        {suffix && <span className="text-xs text-muted-foreground whitespace-nowrap">{suffix}</span>}
        {hasChanged && (
          <Button size="icon" variant="ghost" onClick={handleSave} disabled={isPending} className="h-8 w-8">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}
