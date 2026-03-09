'use client'

import { useRef, useEffect, useState, useSyncExternalStore } from 'react'
import Image from 'next/image'

type Photo = {
  id: string
  url: string
  alt: string
}

type PhotoCarouselProps = {
  photos: Photo[]
  ariaLabel: string
  goToPhotoLabel: string
}

function subscribeToReducedMotion(callback: () => void) {
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
  mq.addEventListener('change', callback)
  return () => mq.removeEventListener('change', callback)
}

function getReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function getReducedMotionServer() {
  return false
}

export function PhotoCarousel({ photos, ariaLabel }: PhotoCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const offsetRef = useRef(0)
  const [isPaused, setIsPaused] = useState(false)

  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionServer,
  )

  // Duplicate the photos so the marquee loops seamlessly
  const items = photos.length > 0 ? [...photos, ...photos] : []

  useEffect(() => {
    const track = trackRef.current
    if (!track || photos.length <= 1 || prefersReducedMotion || isPaused) return

    let animationId: number

    function step() {
      offsetRef.current += 0.5
      // Reset when we've scrolled past the first set of photos
      const resetPoint = track!.scrollWidth / 2
      if (offsetRef.current >= resetPoint) {
        offsetRef.current -= resetPoint
      }
      track!.style.transform = `translateX(-${offsetRef.current}px)`
      animationId = requestAnimationFrame(step)
    }

    animationId = requestAnimationFrame(step)

    return () => cancelAnimationFrame(animationId)
  }, [isPaused, prefersReducedMotion, photos.length])

  if (photos.length === 0) return null

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div ref={trackRef} className="flex gap-3 will-change-transform">
        {items.map((photo, i) => (
          <div
            key={`${photo.id}-${i}`}
            className="relative h-40 w-64 sm:h-48 sm:w-80 shrink-0 overflow-hidden rounded-lg"
          >
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 256px, 320px"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
