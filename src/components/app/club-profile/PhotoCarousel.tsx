'use client'

import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react'
import Image from 'next/image'

type Photo = {
  id: string
  url: string
  alt: string
}

type PhotoCarouselProps = {
  photos: Photo[]
  ariaLabel: string
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
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotion,
    getReducedMotionServer,
  )

  const goTo = useCallback(
    (index: number) => {
      setCurrent((index + photos.length) % photos.length)
    },
    [photos.length],
  )

  const goNext = useCallback(() => goTo(current + 1), [current, goTo])

  useEffect(() => {
    if (isPaused || prefersReducedMotion || photos.length <= 1) return
    intervalRef.current = setInterval(goNext, 4000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPaused, prefersReducedMotion, photos.length, goNext])

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 50) {
      goTo(delta > 0 ? current + 1 : current - 1)
    }
  }

  if (photos.length === 0) return null

  return (
    <div
      className="relative overflow-hidden rounded-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
    >
      <div
        className="flex"
        style={{
          transform: `translateX(-${current * 100}%)`,
          transition: prefersReducedMotion ? 'none' : 'transform 500ms ease-in-out',
        }}
      >
        {photos.map((photo) => (
          <div key={photo.id} className="relative aspect-[16/9] w-full shrink-0">
            <Image
              src={photo.url}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 720px"
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <div className="absolute bottom-0 left-1/2 flex -translate-x-1/2">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => goTo(i)}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center"
              aria-label={`Go to photo ${i + 1}`}
            >
              <span
                className={`block h-2 w-2 rounded-full transition-colors ${
                  i === current ? 'bg-white' : 'bg-white/50'
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
