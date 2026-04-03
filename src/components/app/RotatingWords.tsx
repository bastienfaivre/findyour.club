'use client'

import { useEffect, useState, useCallback, useRef, useSyncExternalStore } from 'react'

interface RotatingWordsProps {
  prefix: string
  words: string[]
  interval?: number
}

type Phase = 'visible' | 'exit' | 'entering'

const COLORS = [
  'hsl(221, 83%, 53%)',  // blue
  'hsl(262, 83%, 58%)',  // violet
  'hsl(330, 81%, 60%)',  // pink
  'hsl(16, 90%, 55%)',   // orange
  'hsl(142, 71%, 45%)',  // green
  'hsl(190, 90%, 50%)',  // cyan
  'hsl(47, 96%, 53%)',   // amber
  'hsl(350, 89%, 60%)',  // rose
]

function pickColor(excludeIndex: number) {
  let next: number
  do {
    next = Math.floor(Math.random() * COLORS.length)
  } while (next === excludeIndex && COLORS.length > 1)
  return next
}

export function RotatingWords({ prefix, words, interval = 2500 }: RotatingWordsProps) {
  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('visible')
  const [wordWidths, setWordWidths] = useState<number[]>([])
  const [colorIndex, setColorIndex] = useState(0)
  const [isWrapped] = useState(true)
  const prefersReducedMotion = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
      mq.addEventListener('change', cb)
      return () => mq.removeEventListener('change', cb)
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  )
  const measureRef = useRef<HTMLSpanElement>(null)
  const prefixRef = useRef<HTMLSpanElement>(null)
  const rotatingRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLSpanElement>(null)

  // Measure each word's width on mount
  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    const widths = Array.from(el.children).map((child) => (child as HTMLElement).offsetWidth)
    setWordWidths(widths)
  }, [])


  const next = useCallback(() => {
    setPhase('exit')

    setTimeout(() => {
      setIndex((prev) => (prev + 1) % words.length)
      setColorIndex((prev) => pickColor(prev))
      setPhase('entering')

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('visible')
        })
      })
    }, 350)
  }, [words.length])

  useEffect(() => {
    if (prefersReducedMotion) return
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [next, interval, prefersReducedMotion])

  const animStyle: React.CSSProperties = prefersReducedMotion
    ? { transform: 'translateY(0)', opacity: 1 }
    : phase === 'exit'
      ? { transform: 'translateY(100%)', opacity: 0 }
      : phase === 'entering'
        ? { transform: 'translateY(-100%)', opacity: 0, transition: 'none' }
        : { transform: 'translateY(0)', opacity: 1 }

  return (
    <span ref={containerRef} className={isWrapped ? 'inline-flex flex-col items-center' : 'grid grid-cols-2 gap-x-[0.25em] w-full items-baseline'}>
      {/* Hidden measurer — renders all words offscreen to find the widest */}
      <span
        ref={measureRef}
        aria-hidden="true"
        className="pointer-events-none invisible absolute flex flex-col"
      >
        {words.map((w) => (
          <span key={w} className="whitespace-nowrap">{w}</span>
        ))}
      </span>

      <span ref={prefixRef} className={!isWrapped ? 'justify-self-end' : undefined}>{prefix}</span>
      <span
        ref={rotatingRef}
        className={`relative overflow-hidden transition-[width] duration-350 ease-in-out${isWrapped ? ' inline-flex align-bottom' : ' flex'}`}
        style={{
          ...(wordWidths.length ? { width: isWrapped ? wordWidths[index] : Math.max(...wordWidths) } : {}),
          ...(isWrapped ? { justifyContent: 'center' } : {}),
        }}
      >
        <span
          className="inline-block transition-all duration-350 ease-in-out whitespace-nowrap"
          style={{ ...animStyle, color: COLORS[colorIndex] }}
        >
          {words[index]}
        </span>
      </span>
    </span>
  )
}
