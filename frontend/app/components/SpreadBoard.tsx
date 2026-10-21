"use client"

import Image from "next/image"
import { memo, useEffect, useState, type CSSProperties } from "react"
import {
  CARD_BACK_IMAGE,
  CARD_FLIP_DELAY_BASE,
  CARD_FLIP_DELAY_INTERVAL,
  SPREADS_BY_TYPE,
} from "@/app/lib/constants"
import { SPREAD_LAYOUTS, slotStyle } from "@/app/lib/spreadLayouts"
import { STRINGS } from "@/app/lib/strings"
import type { CardInterpretation, SpreadType } from "@/app/lib/types"

const FACE_STYLE: CSSProperties = {
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
}

export function cardTitle(card: CardInterpretation): string {
  return card.name_vi || card.card_name
}

export function positionLabel(card: CardInterpretation, spreadType: SpreadType): string {
  return card.position_label_vi || SPREADS_BY_TYPE[spreadType].positions[card.position_index] || ""
}

/** Mặt bài vẽ bằng CSS — dùng khi lá không có ảnh hoặc ảnh lỗi. */
function DrawnFace({ card }: { card: CardInterpretation }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 bg-veil text-center">
      <span aria-hidden="true" className="text-gold text-lg">✦</span>
      <span className="font-serif text-pearl text-xs leading-tight">{cardTitle(card)}</span>
    </div>
  )
}

interface CardSlotProps {
  index: number
  card: CardInterpretation | null
  label: string
  crossing: boolean
  style: CSSProperties
  isSelected: boolean
  onSelect: (index: number) => void
}

const CardSlot = memo(function CardSlot({ index, card, label, crossing, style, isSelected, onSelect }: CardSlotProps) {
  const [flipped, setFlipped] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    if (!card) return
    const timer = setTimeout(() => setFlipped(true), CARD_FLIP_DELAY_BASE + index * CARD_FLIP_DELAY_INTERVAL)
    return () => clearTimeout(timer)
  }, [card, index])

  const reversed = card?.orientation === "reversed"
  const inner = (
    <span
      className="absolute inset-0 block transition-transform duration-700 ease-in-out"
      style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none" }}
    >
      <span
        className={`absolute inset-0 block rounded-md sm:rounded-lg overflow-hidden border border-mist bg-ink shadow-[0_8px_24px_rgba(0,0,0,0.5)]
          ${card ? "" : "animate-shimmer"}`}
        style={{ ...FACE_STYLE, animationDelay: `${index * 120}ms` }}
      >
        <Image src={CARD_BACK_IMAGE} alt="" fill unoptimized sizes="160px" className="object-cover" />
      </span>
      {card && (
        <span
          className={`absolute inset-0 block rounded-md sm:rounded-lg overflow-hidden border bg-ink shadow-[0_8px_24px_rgba(0,0,0,0.5)]
            ${isSelected ? "border-glow" : reversed ? "border-reversed/50" : "border-upright/50"}`}
          style={{ ...FACE_STYLE, transform: "rotateY(180deg)" }}
        >
          {card.image_url && !imageFailed ? (
            <Image
              src={card.image_url}
              alt=""
              fill
              unoptimized
              sizes="160px"
              className={`object-cover ${reversed ? "rotate-180" : ""}`}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <DrawnFace card={card} />
          )}
        </span>
      )}
    </span>
  )
  const badge = (
    <span
      aria-hidden="true"
      className="absolute -top-1.5 -left-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full
        border border-mist bg-void text-[11px] font-mono text-pearl"
      style={crossing ? { transform: "rotate(-90deg)" } : undefined}
    >
      {index + 1}
    </span>
  )

  const position: CSSProperties = {
    ...style,
    transform: crossing ? "rotate(90deg)" : undefined,
    zIndex: crossing ? 2 : 1,
  }

  if (!card) {
    return (
      <span aria-hidden="true" className="absolute block" style={{ ...position, perspective: "900px" }}>
        {inner}
        {badge}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      aria-label={`${index + 1}. ${label}: ${cardTitle(card)}, ${reversed ? STRINGS.REVERSED : STRINGS.UPRIGHT}`}
      aria-haspopup="dialog"
      className={`absolute block rounded-lg transition-transform duration-200 hover:-translate-y-1
        ${isSelected ? "ring-2 ring-glow ring-offset-2 ring-offset-void" : ""}`}
      style={{ ...position, perspective: "900px" }}
    >
      {inner}
      {badge}
    </button>
  )
})

interface SpreadBoardProps {
  spreadType: SpreadType
  /** null khi đang rút: hiển thị các lá úp đúng vị trí của kiểu trải */
  cards: CardInterpretation[] | null
  selectedIndex: number | null
  onSelect: (index: number) => void
}

/** Bàn trải bài: mỗi lá nằm đúng vị trí hình học của kiểu trải (thập tự, móng ngựa…). */
export default function SpreadBoard({ spreadType, cards, selectedIndex, onSelect }: SpreadBoardProps) {
  const layout = SPREAD_LAYOUTS[spreadType]
  const positions = SPREADS_BY_TYPE[spreadType].positions

  return (
    <div
      className="relative mx-auto w-full"
      style={{
        // Không cao quá màn hình: Celtic Cross vẫn nằm trọn trong khung nhìn của laptop
        maxWidth: `min(${layout.maxWidth}px, calc((100dvh - 13rem) * ${layout.width / layout.height}))`,
        aspectRatio: `${layout.width} / ${layout.height}`,
      }}
    >
      {layout.slots.map((slot, i) => (
        <CardSlot
          key={i}
          index={i}
          card={cards?.[i] ?? null}
          label={cards?.[i] ? positionLabel(cards[i], spreadType) : positions[i]}
          crossing={Boolean(slot.crossing)}
          style={slotStyle(layout, slot)}
          isSelected={selectedIndex === i}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

interface SpreadLegendProps {
  spreadType: SpreadType
  cards: CardInterpretation[] | null
  onSelect: (index: number) => void
}

/** Danh sách vị trí → lá bài; cũng là cách mở chi tiết lá bằng bàn phím/trình đọc màn hình. */
export function SpreadLegend({ spreadType, cards, onSelect }: SpreadLegendProps) {
  const positions = SPREADS_BY_TYPE[spreadType].positions
  return (
    <ol className={`grid gap-2 ${positions.length > 3 ? "sm:grid-cols-2 lg:grid-cols-1" : ""}`}>
      {positions.map((pos, i) => {
        const card = cards?.[i]
        const reversed = card?.orientation === "reversed"
        return (
          <li key={pos + i}>
            {card ? (
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-haspopup="dialog"
                className="flex w-full items-center gap-3 rounded-lg border border-mist bg-ink px-3 py-2 text-left
                  transition-colors hover:border-arcane-dim hover:bg-veil"
              >
                <span aria-hidden="true" className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-mist text-xs font-mono text-pearl">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-silver">{positionLabel(card, spreadType)}</span>
                  <span className="block truncate font-serif text-base text-light">{cardTitle(card)}</span>
                </span>
                <OrientationTag reversed={reversed} />
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-mist/60 px-3 py-2">
                <span aria-hidden="true" className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-mist text-xs font-mono text-silver">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-silver">{pos}</span>
                  <span aria-hidden="true" className="mt-1 block h-4 w-28 rounded bg-mist animate-pulse" />
                </span>
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Thuận/ngược: chữ + mũi tên, không chỉ dựa vào màu. */
export function OrientationTag({ reversed, className = "" }: { reversed: boolean; className?: string }) {
  return (
    <span
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium
        ${reversed ? "border-reversed/50 text-reversed" : "border-upright/50 text-upright"} ${className}`}
    >
      <span aria-hidden="true">{reversed ? "↓" : "↑"}</span>
      {reversed ? STRINGS.REVERSED : STRINGS.UPRIGHT}
    </span>
  )
}
