'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { updateSetting } from './actions'

interface TextSettingRowProps {
  settingKey: string
  label: string
  description: string
  defaultValue: string
  savedLabel: string
  placeholder?: string
}

export function TextSettingRow({ settingKey, label, description, defaultValue, savedLabel, placeholder }: TextSettingRowProps) {
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
    <div className="space-y-2 px-4 py-3">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          disabled={isPending}
          className="flex-1"
        />
        {hasChanged && (
          <Button size="icon" variant="ghost" onClick={handleSave} disabled={isPending} className="h-9 w-9 shrink-0">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          </Button>
        )}
      </div>
    </div>
  )
}
