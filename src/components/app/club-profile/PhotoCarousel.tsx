'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { VisuallyHidden } from 'radix-ui'

type Photo = {
  id: string
  url: string
  alt: string
}

type PhotoCarouselProps = {
  photos: Photo[]
  ariaLabel: string
  goToPhotoLabel: string
  closeLabel: string
}

export function PhotoCarousel({ photos, ariaLabel, goToPhotoLabel, closeLabel }: PhotoCarouselProps) {
  const [current, setCurrent] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const count = photos.length

  const prevIndex = (current - 1 + count) % count
  const nextIndex = (current + 1) % count

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + count) % count)
  }, [count])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % count)
  }, [count])

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxOpen, prev, next])

  if (count === 0) return null

  return (
    <>
      {/* Carousel */}
      <div
        className="relative overflow-hidden"
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
      >
        <div className="relative flex items-center justify-center h-48 sm:h-64">
          {/* Previous image peek */}
          {count > 1 && (
            <button
              type="button"
              onClick={prev}
              className="absolute left-0 z-0 h-32 sm:h-44 opacity-40 cursor-pointer transition-opacity hover:opacity-60"
              aria-label={goToPhotoLabel.replace('{n}', String(prevIndex + 1))}
            >
              <Image
                src={photos[prevIndex].url}
                alt={photos[prevIndex].alt}
                width={300}
                height={200}
                className="h-full w-auto object-contain"
                sizes="200px"
              />
            </button>
          )}

          {/* Main image */}
          <button
            type="button"
            className="relative z-10 flex items-center justify-center h-full cursor-pointer"
            onClick={() => setLightboxOpen(true)}
            aria-label={goToPhotoLabel.replace('{n}', String(current + 1))}
          >
            <Image
              src={photos[current].url}
              alt={photos[current].alt}
              width={800}
              height={400}
              className="h-full w-auto object-contain"
              sizes="(max-width: 640px) 100vw, 800px"
              priority
            />
          </button>

          {/* Next image peek */}
          {count > 1 && (
            <button
              type="button"
              onClick={next}
              className="absolute right-0 z-0 h-32 sm:h-44 opacity-40 cursor-pointer transition-opacity hover:opacity-60"
              aria-label={goToPhotoLabel.replace('{n}', String(nextIndex + 1))}
            >
              <Image
                src={photos[nextIndex].url}
                alt={photos[nextIndex].alt}
                width={300}
                height={200}
                className="h-full w-auto object-contain"
                sizes="200px"
              />
            </button>
          )}

          {/* Prev/Next arrows */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-1 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition-opacity hover:bg-background"
                aria-label={goToPhotoLabel.replace('{n}', String(prevIndex + 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-1 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-background/80 text-foreground shadow backdrop-blur-sm transition-opacity hover:bg-background"
                aria-label={goToPhotoLabel.replace('{n}', String(nextIndex + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Dot indicators */}
        {count > 1 && (
          <div className="absolute bottom-0 left-1/2 z-20 -translate-x-1/2 flex gap-1">
            {photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setCurrent(i)}
                className="flex items-center justify-center h-11 w-11"
                aria-label={goToPhotoLabel.replace('{n}', String(i + 1))}
                aria-current={i === current ? 'true' : undefined}
              >
                <span className={`block h-2 w-2 rounded-full transition-colors ${i === current ? 'bg-foreground' : 'bg-foreground/30'}`} />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[95vw] sm:max-w-[90vw] max-h-[90vh] p-0 border-none bg-black/95 overflow-hidden flex items-center justify-center"
        >
          <VisuallyHidden.Root>
            <DialogTitle>{ariaLabel}</DialogTitle>
          </VisuallyHidden.Root>

          {/* Close button */}
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label={closeLabel}
          >
            <X className="h-4 w-4" />
          </button>

          {/* Lightbox images */}
          <div className="relative flex items-center justify-center w-full h-[80vh]">
            {/* Previous image peek */}
            {count > 1 && (
              <button
                type="button"
                onClick={prev}
                className="absolute left-4 z-0 h-[50vh] opacity-30 cursor-pointer transition-opacity hover:opacity-50"
                aria-label={goToPhotoLabel.replace('{n}', String(prevIndex + 1))}
              >
                <Image
                  src={photos[prevIndex].url}
                  alt={photos[prevIndex].alt}
                  width={600}
                  height={400}
                  className="h-full w-auto object-contain"
                  sizes="30vw"
                />
              </button>
            )}

            {/* Main image */}
            <Image
              src={photos[current].url}
              alt={photos[current].alt}
              width={1600}
              height={900}
              className="relative z-10 max-h-full max-w-[70%] object-contain"
              sizes="70vw"
              priority
            />

            {/* Next image peek */}
            {count > 1 && (
              <button
                type="button"
                onClick={next}
                className="absolute right-4 z-0 h-[50vh] opacity-30 cursor-pointer transition-opacity hover:opacity-50"
                aria-label={goToPhotoLabel.replace('{n}', String(nextIndex + 1))}
              >
                <Image
                  src={photos[nextIndex].url}
                  alt={photos[nextIndex].alt}
                  width={600}
                  height={400}
                  className="h-full w-auto object-contain"
                  sizes="30vw"
                />
              </button>
            )}
          </div>

          {/* Prev/Next arrows in lightbox */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-3 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label={goToPhotoLabel.replace('{n}', String(prevIndex + 1))}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 z-20 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label={goToPhotoLabel.replace('{n}', String(nextIndex + 1))}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Counter */}
          {count > 1 && (
            <span className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-sm text-white/70">
              {current + 1} / {count}
            </span>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
