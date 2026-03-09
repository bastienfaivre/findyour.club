'use client'

import { useEffect, useState, useCallback, useRef } from 'react'

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
  const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined)
  const [colorIndex, setColorIndex] = useState(0)
  const measureRef = useRef<HTMLSpanElement>(null)

  // Measure the widest word once on mount to lock the container width
  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    let widest = 0
    for (const child of Array.from(el.children)) {
      widest = Math.max(widest, (child as HTMLElement).offsetWidth)
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time measurement on mount, no cascading risk
    setMaxWidth(widest)
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
    const timer = setInterval(next, interval)
    return () => clearInterval(timer)
  }, [next, interval])

  const animStyle: React.CSSProperties =
    phase === 'exit'
      ? { transform: 'translateY(100%)', opacity: 0 }
      : phase === 'entering'
        ? { transform: 'translateY(-100%)', opacity: 0, transition: 'none' }
        : { transform: 'translateY(0)', opacity: 1 }

  return (
    <span>
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

      {prefix}{' '}
      <span
        className="relative inline-flex overflow-hidden align-bottom"
        style={maxWidth ? { width: maxWidth } : undefined}
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
