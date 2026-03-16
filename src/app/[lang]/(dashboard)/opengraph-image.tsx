import { generateStaticOgImage, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og-image'

export const size = OG_SIZE
export const contentType = OG_CONTENT_TYPE

export default async function Image() {
  return generateStaticOgImage({
    title: 'findyour.club',
    subtitle: 'Find any club near you — who they are, when they meet, how to join. Free and verified.',
  })
}
