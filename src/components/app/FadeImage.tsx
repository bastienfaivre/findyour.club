'use client'

import { useState, useCallback, useMemo } from 'react'
import Image, { type ImageProps } from 'next/image'
import { cn } from '@/lib/utils'

type FadeImageProps = ImageProps & {
  /** Class for the skeleton placeholder */
  skeletonClassName?: string
  /** Fallback src used when the image fails to load */
  fallbackSrc?: string
  /** Extra class applied when fallback is active */
  fallbackClassName?: string
}

export function FadeImage({ className, skeletonClassName, fallbackSrc, fallbackClassName, onLoad, src, alt, ...props }: FadeImageProps) {
  // Track which src has been loaded — when src changes, loaded resets naturally
  const srcKey = useMemo(() => (typeof src === 'string' ? src : JSON.stringify(src)), [src])
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null)
  const [errored, setErrored] = useState(false)
  const loaded = loadedSrc === srcKey

  const activeSrc = errored && fallbackSrc ? fallbackSrc : src

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      setLoadedSrc(typeof src === 'string' ? src : JSON.stringify(src))
      if (typeof onLoad === 'function') {
        ;(onLoad as (e: React.SyntheticEvent<HTMLImageElement>) => void)(e)
      }
    },
    [onLoad, src],
  )

  const handleError = useCallback(() => {
    if (fallbackSrc && !errored) setErrored(true)
  }, [fallbackSrc, errored])

  return (
    <span className="relative inline-flex items-center justify-center h-full w-full">
      {!loaded && !errored && (
        <span className={cn('absolute inset-0 bg-muted animate-pulse', skeletonClassName)} />
      )}
      <Image
        src={activeSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-300',
          className,
          !loaded && !errored && 'opacity-0',
          errored && fallbackClassName,
        )}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </span>
  )
}
