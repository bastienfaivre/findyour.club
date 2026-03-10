import type { ComponentType, SVGProps } from 'react'
import { Youtube } from 'lucide-react'
import {
  InstagramIcon,
  FacebookIcon,
  XIcon,
  TikTokIcon,
  DiscordIcon,
  WhatsAppIcon,
  TelegramIcon,
  GitHubIcon,
} from '@/components/icons/social-icons'

export interface SocialPlatform {
  key: SocialFieldKey
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  placeholder: string
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
  { key: 'instagramUrl', label: 'Instagram', icon: InstagramIcon, placeholder: 'https://instagram.com/...' },
  { key: 'facebookUrl', label: 'Facebook', icon: FacebookIcon, placeholder: 'https://facebook.com/...' },
  { key: 'xUrl', label: 'X', icon: XIcon, placeholder: 'https://x.com/...' },
  { key: 'tiktokUrl', label: 'TikTok', icon: TikTokIcon, placeholder: 'https://tiktok.com/@...' },
  { key: 'discordUrl', label: 'Discord', icon: DiscordIcon, placeholder: 'https://discord.gg/...' },
  { key: 'youtubeUrl', label: 'YouTube', icon: Youtube as ComponentType<SVGProps<SVGSVGElement>>, placeholder: 'https://youtube.com/...' },
  { key: 'whatsappUrl', label: 'WhatsApp', icon: WhatsAppIcon, placeholder: 'https://chat.whatsapp.com/...' },
  { key: 'telegramUrl', label: 'Telegram', icon: TelegramIcon, placeholder: 'https://t.me/...' },
  { key: 'githubUrl', label: 'GitHub', icon: GitHubIcon, placeholder: 'https://github.com/...' },
]
