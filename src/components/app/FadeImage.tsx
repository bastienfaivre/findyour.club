'use client'

import { useState, useCallback, useMemo } from 'react'
import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

type FadeImageProps = ImageProps & {
  /** Class for the skeleton placeholder */
  skeletonClassName?: string
}

export function FadeImage({ className, skeletonClassName, onLoad, onError, src, alt, ...props }: FadeImageProps) {
  // Track which src has been loaded — when src changes, loaded resets naturally
  const srcKey = useMemo(() => (typeof src === 'string' ? src : JSON.stringify(src)), [src])
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const loaded = loadedSrc === srcKey

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setLoadedSrc(typeof src === 'string' ? src : JSON.stringify(src))
      if (typeof onLoad === 'function') {
        ;(onLoad as (e: React.SyntheticEvent<HTMLImageElement>) => void)(e)
      }
    },
    [onLoad, src],
  )

  return (
    <span className="relative inline-flex items-center justify-center h-full w-full">
      {!loaded && (
        <span className={cn('absolute inset-0 bg-muted animate-pulse', skeletonClassName)} />
      )}
      <Image
        src={src}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          className,
          !loaded && 'opacity-0',
        )}
        onLoad={handleLoad}
        onError={onError}
        {...props}
      />
    </span>
  )
}
