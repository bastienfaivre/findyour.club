'use client'

import { useState } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

type YouTubeEmbedProps = {
  videoId: string
  title?: string
}

export function YouTubeEmbed({ videoId, title = 'Video' }: YouTubeEmbedProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg">
      {!loaded && <Skeleton className="absolute inset-0 h-full w-full" />}
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        onLoad={() => setLoaded(true)}
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  )
}
