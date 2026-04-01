import type { ComponentType, SVGProps } from 'react'
import {
  InstagramIcon,
  FacebookIcon,
  XIcon,
  TikTokIcon,
  DiscordIcon,
  YouTubeIcon,
  WhatsAppIcon,
  TelegramIcon,
  GitHubIcon,
} from '@/components/icons/social-icons'

export interface SocialPlatform {
  key: SocialFieldKey
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  placeholder: string
  /** Regex to extract a username/handle from the URL. Group 1 must be the handle. */
  handlePattern?: RegExp
}

export const SOCIAL_FIELD_KEYS = [
  'instagramUrl',
  'facebookUrl',
  'xUrl',
  'tiktokUrl',
  'discordUrl',
  'youtubeUrl',
  'whatsappUrl',
  'telegramUrl',
  'githubUrl',
] as const

export type SocialFieldKey = (typeof SOCIAL_FIELD_KEYS)[number]

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { key: 'instagramUrl', label: 'Instagram', icon: InstagramIcon, placeholder: 'https://instagram.com/...', handlePattern: /instagram\.com\/([^/?#]+)/i },
  { key: 'facebookUrl', label: 'Facebook', icon: FacebookIcon, placeholder: 'https://facebook.com/...' },
  { key: 'xUrl', label: 'X', icon: XIcon, placeholder: 'https://x.com/...', handlePattern: /(?:x|twitter)\.com\/([^/?#]+)/i },
  { key: 'tiktokUrl', label: 'TikTok', icon: TikTokIcon, placeholder: 'https://tiktok.com/@...', handlePattern: /tiktok\.com\/@?([^/?#]+)/i },
  { key: 'discordUrl', label: 'Discord', icon: DiscordIcon, placeholder: 'https://discord.gg/...' },
  { key: 'youtubeUrl', label: 'YouTube', icon: YouTubeIcon, placeholder: 'https://youtube.com/...', handlePattern: /youtube\.com\/@([^/?#]+)/i },
  { key: 'whatsappUrl', label: 'WhatsApp', icon: WhatsAppIcon, placeholder: 'https://chat.whatsapp.com/...' },
  { key: 'telegramUrl', label: 'Telegram', icon: TelegramIcon, placeholder: 'https://t.me/...', handlePattern: /t\.me\/([^/?#]+)/i },
  { key: 'githubUrl', label: 'GitHub', icon: GitHubIcon, placeholder: 'https://github.com/...', handlePattern: /github\.com\/([^/?#]+)/i },
]

/**
 * Extract a display handle from a social URL using the platform's pattern.
 * Returns `@handle` or null if no match.
 */
export function extractHandle(platform: SocialPlatform, url: string): string | null {
  if (!platform.handlePattern) return null
  const match = url.match(platform.handlePattern)
  if (!match?.[1]) return null
  const handle = match[1].replace(/^@/, '')
  return `@${handle}`
}
