import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ClubAvatarProps {
  name: string
  logoUrl?: string | null
  logoAlt?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-24 text-4xl',
} as const

export function ClubAvatar({ name, logoUrl, logoAlt, size = 'md', className }: ClubAvatarProps) {
  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      {logoUrl && (
        <AvatarImage src={logoUrl} alt={logoAlt ?? name} />
      )}
      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  )
}
