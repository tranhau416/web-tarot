"use client"

import { memo } from "react"
import type { CardInterpretation } from "../lib/types"
import { CARD_FLIP_DELAY_BASE, CARD_FLIP_DELAY_INTERVAL } from "@/app/lib/constants"

// Element icon SVG component
function ElementIcon({ element, suit }: { element: string | null; suit: string }) {
  const type = element ?? suit
  const paths: Record<string, string> = {
    fire:      "M12 3 L21 20 H3 Z",
    wands:     "M12 3 L21 20 H3 Z",
    water:     "M12 21 L3 4 H21 Z",
    cups:      "M12 21 L3 4 H21 Z",
    air:       "M12 3 L21 20 H3 Z M5 13 H19",
    swords:    "M12 3 L21 20 H3 Z M5 13 H19",
    earth:     "M12 21 L3 4 H21 Z M5 11 H19",
    pentacles: "M12 21 L3 4 H21 Z M5 11 H19",
  }
  const spiritPath = "M12 2 A10 10 0 0 1 22 12 A10 10 0 0 1 2 12 A10 10 0 0 1 12 2 M12 10 A2 2 0 0 1 14 12 A2 2 0 0 1 10 12 A2 2 0 0 1 12 10"
  const path = paths[type] ?? spiritPath

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

interface CardItemProps {
  card: CardInterpretation
  index: number
  onSelect: (card: CardInterpretation) => void
  isSelected: boolean
}

const CardItem = memo(function CardItem({ card, index, onSelect, isSelected }: CardItemProps) {
  const isUpright = card.orientation === "upright"

  return (
    <button
      type="button"
      className="flex flex-col items-center gap-3 cursor-pointer group bg-transparent border-0 p-0 opacity-0 [animation-fill-mode:forwards] animate-card-conjure"
      style={{ animationDelay: `${CARD_FLIP_DELAY_BASE + index * CARD_FLIP_DELAY_INTERVAL}ms` }}
      onClick={() => onSelect(card)}
      aria-label={`Select card ${card.card_name}`}
      aria-pressed={isSelected}
    >
      {/* Position label */}
      {card.position_label && (
        <span className="text-phase">
          {card.position_label}
        </span>
      )}

      {/* Card face */}
      <div
        className={`relative w-32 h-52 sm:w-36 sm:h-56 rounded-xl border-2 overflow-hidden
          transition-[border-color,transform,box-shadow] duration-200 shadow-lg
          group-hover:-translate-y-1
          ${isSelected
            ? "border-flame/80 scale-105 shadow-[0_0_20px_rgba(232,160,69,0.25)]"
            : isUpright
              ? "border-upright/40 group-hover:border-upright/70"
              : "border-reversed/40 group-hover:border-reversed/70"
          }`}
        style={{ background: "linear-gradient(160deg, #14141F 0%, #0D0D18 60%, #06060F 100%)" }}
      >
        {/* SVG mandala card back pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.08]" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="30" stroke="rgba(124,111,205,0.4)" strokeWidth="0.5" fill="none"/>
          <circle cx="50" cy="50" r="20" stroke="rgba(232,160,69,0.3)"  strokeWidth="0.5" fill="none"/>
          <circle cx="50" cy="50" r="10" stroke="rgba(124,111,205,0.5)" strokeWidth="0.5" fill="none"/>
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <line
              key={deg}
              x1={50 + 10 * Math.cos((deg * Math.PI) / 180)}
              y1={50 + 10 * Math.sin((deg * Math.PI) / 180)}
              x2={50 + 30 * Math.cos((deg * Math.PI) / 180)}
              y2={50 + 30 * Math.sin((deg * Math.PI) / 180)}
              stroke="rgba(124,111,205,0.3)"
              strokeWidth="0.5"
            />
          ))}
        </svg>

        {/* Card content */}
        <div className="relative h-full flex flex-col items-center justify-between p-3">
          {/* Element icon top */}
          <div className={`select-none ${isUpright ? "text-upright/70" : "text-reversed/70"}`}>
            <ElementIcon element={card.element} suit={card.suit} />
          </div>

          {/* Card name */}
          <div className="text-center">
            <p className={`font-cinzel text-sm leading-tight
              ${isUpright ? "text-upright" : "text-reversed"}`}>
              {card.card_name}
            </p>
            {card.numerology_value !== null && (
              <p className="text-silver/60 text-xs font-mono mt-1">
                {card.numerology_value}
              </p>
            )}
          </div>

          {/* Element icon bottom */}
          <div className={`select-none opacity-40 ${isUpright ? "text-upright/70" : "text-reversed/70"}`}>
            <ElementIcon element={card.element} suit={card.suit} />
          </div>
        </div>

        {/* Reversed indicator */}
        {!isUpright && (
          <div className="absolute top-1 left-1">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-reversed" aria-hidden="true">
              <path d="M12 21 L3 4 H21 Z" />
            </svg>
          </div>
        )}
      </div>

      {/* Orientation badge */}
      <div
        className={`px-3 py-1 rounded-full border font-cinzel text-xs tracking-wider
          ${isUpright
            ? "border-upright/50 text-upright bg-upright/10"
            : "border-reversed/50 text-reversed bg-reversed/10"
          }`}
      >
        {isUpright ? "Upright" : "Reversed"}
      </div>
    </button>
  )
})

interface CardRevealProps {
  cards: CardInterpretation[]
  selectedCard: CardInterpretation | null
  onSelectCard: (card: CardInterpretation) => void
}

export default function CardReveal({ cards, selectedCard, onSelectCard }: CardRevealProps) {
  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center animate-phase-fade-in"
      role="list"
      aria-label={`${cards.length} drawn card${cards.length !== 1 ? "s" : ""}`}
    >
      {cards.map((card, index) => (
        <div key={`${card.card_id}-${index}`} role="listitem">
          <CardItem
            card={card}
            index={index}
            onSelect={onSelectCard}
            isSelected={selectedCard?.position_index === card.position_index}
          />
        </div>
      ))}
    </div>
  )
}
