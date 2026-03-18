"use client"

import { memo, useState, useEffect } from "react"
import type { CardInterpretation } from "../lib/types"
import { CARD_FLIP_DELAY_BASE, CARD_FLIP_DELAY_INTERVAL } from "@/app/lib/constants"

const ELEMENT_SYMBOLS: Record<string, string> = {
  fire: "🔥",
  water: "💧",
  air: "⚔️",
  earth: "🌿",
  spirit: "⭐",
  major_arcana: "⭐",
  wands: "🔥",
  cups: "💧",
  swords: "⚔️",
  pentacles: "🌿",
}

function getElementSymbol(card: CardInterpretation): string {
  if (card.element) return ELEMENT_SYMBOLS[card.element] ?? "✦"
  return ELEMENT_SYMBOLS[card.suit] ?? "✦"
}

interface CardItemProps {
  card: CardInterpretation
  index: number
  onSelect: (card: CardInterpretation) => void
  isSelected: boolean
}

const CardItem = memo(function CardItem({ card, index, onSelect, isSelected }: CardItemProps) {
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const timer = setTimeout(
      () => setFlipped(true),
      CARD_FLIP_DELAY_BASE + index * CARD_FLIP_DELAY_INTERVAL
    )
    return () => clearTimeout(timer)
  }, [index])

  const isUpright = card.orientation === "upright"
  const elementSymbol = getElementSymbol(card)

  return (
    <button
      type="button"
      className="flex flex-col items-center gap-3 cursor-pointer group bg-transparent border-0 p-0"
      onClick={() => onSelect(card)}
      aria-label={`Chọn lá ${card.card_name}`}
      style={{ perspective: "1000px" }}
    >
      {/* Position label */}
      {card.position_label && (
        <span className="text-xs text-silver/70 font-sans uppercase tracking-widest">
          {card.position_label}
        </span>
      )}

      {/* Card container with flip */}
      <div
        className="relative w-32 h-52 sm:w-36 sm:h-56 transition-all duration-700 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(0deg)" : "rotateY(90deg)",
        }}
      >
        {/* Card face */}
        <div
          className={`absolute inset-0 rounded-xl border-2 overflow-hidden
            transition-all duration-200 shadow-lg
            ${isSelected
              ? "border-arcane shadow-arcane/30 shadow-xl scale-105"
              : isUpright
                ? "border-upright/40 group-hover:border-upright/70"
                : "border-reversed/40 group-hover:border-reversed/70"
            }
            bg-ink`}
        >
          {/* Card back pattern (decorative CSS) */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, #7C6FCD 1px, transparent 1px)`,
                backgroundSize: "12px 12px",
              }}
            />
          </div>

          {/* Card content */}
          <div className="relative h-full flex flex-col items-center justify-between p-3">
            {/* Element symbol top */}
            <div className="text-2xl select-none">{elementSymbol}</div>

            {/* Card name */}
            <div className="text-center">
              <p className={`font-serif text-base leading-tight font-medium
                ${isUpright ? "text-upright" : "text-reversed"}`}>
                {card.card_name}
              </p>
              {card.numerology_value !== null && (
                <p className="text-silver/70 text-xs font-mono mt-1">
                  {card.numerology_value}
                </p>
              )}
            </div>

            {/* Element symbol bottom */}
            <div className="text-2xl select-none opacity-50">{elementSymbol}</div>
          </div>

          {/* Reversed indicator */}
          {!isUpright && (
            <div className="absolute top-1 left-1">
              <span className="text-reversed text-xs font-mono" style={{ display: "inline-block", transform: "rotate(180deg)" }}>▲</span>
            </div>
          )}
        </div>
      </div>

      {/* Orientation badge */}
      <div
        className={`px-3 py-1 rounded-full border text-sm font-sans font-medium
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 justify-items-center animate-fade-in">
      {cards.map((card, index) => (
        <CardItem
          key={`${card.card_id}-${index}`}
          card={card}
          index={index}
          onSelect={onSelectCard}
          isSelected={selectedCard?.position_index === card.position_index}
        />
      ))}
    </div>
  )
}
