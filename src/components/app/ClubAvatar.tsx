'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { getActivityTypeIcon } from '@/lib/activity-types'
import { FadeImage } from '@/components/app/FadeImage'

interface ClubAvatarProps {
  name: string
  activityType: string | null
  logoUrl?: string | null
  logoAlt?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-24',
  xl: 'size-36',
} as const

const sizePx = { sm: 32, md: 40, lg: 96, xl: 144 } as const

const iconSizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-24',
  xl: 'size-36',
} as const

export function ClubAvatar({ name, activityType, logoUrl, logoAlt, size = 'md', className }: ClubAvatarProps) {
  const px = sizePx[size]
  const isSvg = logoUrl?.endsWith('.svg')
  const [imgErrored, setImgErrored] = useState(false)

  const showIcon = !logoUrl || imgErrored
  const Icon = getActivityTypeIcon(activityType)

  if (showIcon) {
    return (
      <div className={cn('shrink-0 relative flex items-center justify-center', sizeClasses[size], className)}>
        <Icon className={cn(iconSizeClasses[size], 'text-foreground')} strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className={cn('shrink-0 relative flex items-center justify-center', sizeClasses[size], className)}>
      <FadeImage
        src={logoUrl}
        alt={logoAlt ?? name}
        width={px}
        height={px}
        className="max-h-full max-w-full object-contain"
        skeletonClassName="rounded-lg"
        sizes={`${px}px`}
        onError={() => setImgErrored(true)}
        {...(isSvg && { unoptimized: true })}
      />
    </div>
  )
}
