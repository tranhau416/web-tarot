"use client"

import Image from "next/image"
import { memo, useState, useEffect, type CSSProperties } from "react"
import type { CardInterpretation } from "../lib/types"
import {
  CARD_BACK_IMAGE,
  CARD_FLIP_DELAY_BASE,
  CARD_FLIP_DELAY_INTERVAL,
} from "@/app/lib/constants"

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

const FACE_STYLE: CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
}

function getElementSymbol(card: CardInterpretation): string {
  if (card.element) return ELEMENT_SYMBOLS[card.element] ?? "✦"
  return ELEMENT_SYMBOLS[card.suit] ?? "✦"
}

/** Mặt bài vẽ bằng CSS — dùng khi lá không có ảnh hoặc ảnh lỗi. */
function DrawnFace({ card }: { card: CardInterpretation }) {
  const isUpright = card.orientation === "upright"
  const elementSymbol = getElementSymbol(card)
  return (
    <>
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, #7C6FCD 1px, transparent 1px)`,
            backgroundSize: "12px 12px",
          }}
        />
      </div>
      <div className="relative h-full flex flex-col items-center justify-between p-3">
        <div className="text-2xl select-none">{elementSymbol}</div>
        <div className="text-center">
          <p className={`font-serif text-base leading-tight font-medium ${isUpright ? "text-upright" : "text-reversed"}`}>
            {card.card_name}
          </p>
          {card.numerology_value !== null && (
            <p className="text-silver/70 text-xs font-mono mt-1">{card.numerology_value}</p>
          )}
        </div>
        <div className="text-2xl select-none opacity-50">{elementSymbol}</div>
      </div>
      {!isUpright && (
        <div className="absolute top-1 left-1">
          <span className="text-reversed text-xs font-mono" style={{ display: "inline-block", transform: "rotate(180deg)" }}>▲</span>
        </div>
      )}
    </>
  )
}

interface CardItemProps {
  card: CardInterpretation
  index: number
  onSelect: (card: CardInterpretation) => void
  isSelected: boolean
}

const CardItem = memo(function CardItem({ card, index, onSelect, isSelected }: CardItemProps) {
  const [flipped, setFlipped] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    const timer = setTimeout(
      () => setFlipped(true),
      CARD_FLIP_DELAY_BASE + index * CARD_FLIP_DELAY_INTERVAL
    )
    return () => clearTimeout(timer)
  }, [index])

  const isUpright = card.orientation === "upright"
  const showImage = Boolean(card.image_url) && !imageFailed

  return (
    <button
      type="button"
      className="flex flex-col items-center gap-2 cursor-pointer group bg-transparent border-0 p-0"
      onClick={() => onSelect(card)}
      aria-label={`Chọn lá ${card.card_name}`}
      aria-pressed={isSelected}
    >
      {/* Position label */}
      {card.position_label && (
        <span className="text-xs text-silver/70 font-sans uppercase tracking-widest">
          {card.position_label}
        </span>
      )}

      {/* Card with 3D flip: back → face */}
      <div
        className={`relative w-28 sm:w-32 aspect-[3/5] transition-transform duration-200 ${isSelected ? "scale-105" : "group-hover:-translate-y-1"}`}
        style={{ perspective: "1000px" }}
      >
        <div
          className="absolute inset-0 transition-transform duration-700 ease-in-out"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Back */}
          <div
            className="absolute inset-0 rounded-xl overflow-hidden border-2 border-mist shadow-lg bg-ink"
            style={FACE_STYLE}
          >
            <Image src={CARD_BACK_IMAGE} alt="" fill unoptimized sizes="128px" className="object-cover" />
          </div>

          {/* Face */}
          <div
            className={`absolute inset-0 rounded-xl overflow-hidden border-2 shadow-lg bg-ink transition-colors duration-200
              ${isSelected
                ? "border-arcane shadow-arcane/40 shadow-xl"
                : isUpright
                  ? "border-upright/40 group-hover:border-upright/70"
                  : "border-reversed/40 group-hover:border-reversed/70"
              }`}
            style={{ ...FACE_STYLE, transform: "rotateY(180deg)" }}
          >
            {showImage ? (
              <Image
                src={card.image_url!}
                alt={`${card.card_name}${isUpright ? "" : " (ngược)"}`}
                fill
                unoptimized
                sizes="128px"
                className={`object-cover ${isUpright ? "" : "rotate-180"}`}
                onError={() => setImageFailed(true)}
              />
            ) : (
              <DrawnFace card={card} />
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="text-center max-w-[9rem] leading-tight">
        <p className={`font-serif text-sm font-medium ${isUpright ? "text-upright" : "text-reversed"}`}>
          {card.card_name}
        </p>
        {card.name_vi && <p className="text-silver text-xs font-sans mt-0.5">{card.name_vi}</p>}
      </div>

      {/* Orientation badge */}
      <div
        className={`px-3 py-0.5 rounded-full border text-xs font-sans font-medium
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
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-8 sm:gap-x-8 animate-fade-in">
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
