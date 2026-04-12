import { cn } from '@/lib/utils'
import { FadeImage } from '@/components/app/FadeImage'

interface ClubAvatarProps {
  name: string
  logoUrl?: string | null
  logoAlt?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-24 text-4xl',
  xl: 'size-36 text-6xl',
} as const

const sizePx = { sm: 32, md: 40, lg: 96, xl: 144 } as const

const PLACEHOLDER = '/apple-touch-icon.png'

export function ClubAvatar({ name, logoUrl, logoAlt, size = 'md', className }: ClubAvatarProps) {
  const px = sizePx[size]
  const isSvg = logoUrl?.endsWith('.svg')

  return (
    <div className={cn('shrink-0 relative flex items-center justify-center', sizeClasses[size], className)}>
      <FadeImage
        src={logoUrl || PLACEHOLDER}
        alt={logoAlt ?? name}
        width={px}
        height={px}
        className={cn(
          'max-h-full max-w-full object-contain',
          !logoUrl && 'opacity-40',
        )}
        fallbackSrc={PLACEHOLDER}
        fallbackClassName="opacity-40"
        skeletonClassName="rounded-lg"
        sizes={`${px}px`}
        {...(isSvg && { unoptimized: true })}
      />
    </div>
  )
}
