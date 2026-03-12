'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'
import { updateSetting } from './actions'

interface EmailToggleRowProps {
  settingKey: string
  label: string
  description: string
  defaultChecked: boolean
  savedLabel: string
}

export function EmailToggleRow({ settingKey, label, description, defaultChecked, savedLabel }: EmailToggleRowProps) {
  const [isPending, startTransition] = useTransition()

  function handleChange(checked: boolean) {
    startTransition(async () => {
      const result = await updateSetting(settingKey, checked)
      if (result.success) {
        toast.success(savedLabel)
      } else {
        toast.error(result.error ?? 'Error')
      }
    })
  }

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch
        defaultChecked={defaultChecked}
        onCheckedChange={handleChange}
        disabled={isPending}
      />
    </div>
  )
}
