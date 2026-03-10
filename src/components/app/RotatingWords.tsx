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
  const [wordWidths, setWordWidths] = useState<number[]>([])
  const [colorIndex, setColorIndex] = useState(0)
  const [isWrapped, setIsWrapped] = useState(false)
  const measureRef = useRef<HTMLSpanElement>(null)
  const prefixRef = useRef<HTMLSpanElement>(null)
  const rotatingRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLSpanElement>(null)

  // Measure each word's width on mount
  useEffect(() => {
    const el = measureRef.current
    if (!el) return
    const widths = Array.from(el.children).map((child) => (child as HTMLElement).offsetWidth)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time measurement on mount, no cascading risk
    setWordWidths(widths)
  }, [])

  // Detect whether prefix + widest word would overflow a single line
  useEffect(() => {
    const container = containerRef.current
    const prefixEl = prefixRef.current
    if (!container || !prefixEl || !wordWidths.length) return

    function checkWrap() {
      const parent = container!.parentElement
      if (!parent) return
      const availableWidth = parent.clientWidth
      const prefixWidth = prefixEl!.offsetWidth
      const maxWordWidth = Math.max(...wordWidths)
      // Approximate space character width using font size * 0.3
      const fontSize = parseFloat(getComputedStyle(prefixEl!).fontSize)
      const spaceWidth = fontSize * 0.3
      const wouldOverflow = prefixWidth + spaceWidth + maxWordWidth > availableWidth
      setIsWrapped(window.innerWidth < 640 || wouldOverflow)
    }

    checkWrap()
    const observer = new ResizeObserver(checkWrap)
    observer.observe(container)
    return () => observer.disconnect()
  }, [wordWidths])

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
    <span ref={containerRef} className={isWrapped ? 'inline-flex flex-col items-center' : 'inline'}>
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

      <span ref={prefixRef}>{prefix}</span>{' '}
      <span
        ref={rotatingRef}
        className="relative inline-flex overflow-hidden align-bottom transition-[width] duration-350 ease-in-out"
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
