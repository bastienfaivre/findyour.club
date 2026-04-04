'use client'

import {
  Volleyball, Music, Crown, Wine, Palette, Bike,
  Spade, Camera, Trophy, BookOpen, Waves, Mountain,
  PersonStanding, Dices, Guitar, Coffee, Star, Footprints,
  Compass, Telescope, UtensilsCrossed, Drama, Leaf, Users,
} from 'lucide-react'

const ICONS = [
  Volleyball, Music, Crown, Wine, Palette, Bike,
  Spade, Camera, Trophy, BookOpen, Waves, Mountain,
  PersonStanding, Dices, Guitar, Coffee, Star, Footprints,
  Compass, Telescope, UtensilsCrossed, Drama, Leaf, Users,
]

const CELL = 56
const COLS = 6
const ROWS = 4
const HALF = CELL / 2

export function BackgroundPattern() {
  const totalCols = Math.ceil(3840 / CELL)
  const totalRows = Math.ceil(2160 / CELL) + 1 // +1 to cover the shift

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-[0.07] text-foreground dark:opacity-[0.09]"
    >
      <div className="flex">
        {Array.from({ length: totalCols }, (_, col) => (
          <div
            key={col}
            className="shrink-0"
            style={{
              width: CELL,
              transform: col % 2 === 1 ? `translateY(${HALF}px)` : undefined,
            }}
          >
            {Array.from({ length: totalRows }, (_, row) => {
              const Icon = ICONS[(row % ROWS) * COLS + (col % COLS)]
              return (
                <div
                  key={row}
                  className="flex items-center justify-center"
                  style={{ width: CELL, height: CELL }}
                >
                  <Icon size={24} strokeWidth={1.5} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
