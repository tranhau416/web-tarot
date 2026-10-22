"use client"

import Image from "next/image"
import { memo, useEffect, useState, type CSSProperties } from "react"
import {
  CARD_BACK_IMAGE,
  CARD_FLIP_DELAY_BASE,
  CARD_FLIP_DELAY_INTERVAL,
  SPREADS_BY_TYPE,
} from "@/app/lib/constants"
import { CARD_W, SPREAD_LAYOUTS, slotStyle, type SpreadLayout } from "@/app/lib/spreadLayouts"
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

/** Một lá hay ba lá xếp một hàng: tên lá ghi ngay dưới mỗi lá thay cho bảng chú giải. */
export function isRowSpread(spreadType: SpreadType): boolean {
  return SPREAD_LAYOUTS[spreadType].slots.every((slot) => slot.y === 0)
}

/** Bề rộng tối đa của bàn trải: không cao quá màn hình, Celtic Cross vẫn nằm trọn khung nhìn laptop. */
function boardMaxWidth(layout: SpreadLayout): string {
  return `min(${layout.maxWidth}px, calc((100dvh - 13rem) * ${layout.width / layout.height}))`
}

/** Mặt bài vẽ bằng CSS — dùng khi lá không có ảnh hoặc ảnh lỗi. */
function DrawnFace({ card }: { card: CardInterpretation }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 p-2 bg-veil text-center">
      <span aria-hidden="true" className="text-gold text-lg">✦</span>
      <span className="text-pearl text-[13px] leading-tight">{cardTitle(card)}</span>
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
  /** Desktop: chọn lá để xem chi tiết ngay trong trang. Điện thoại: mở bảng chi tiết. */
  opensDialog: boolean
  onSelect: (index: number) => void
}

const CardSlot = memo(function CardSlot({ index, card, label, crossing, style, isSelected, opensDialog, onSelect }: CardSlotProps) {
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
        className={`absolute inset-0 block rounded-[10px] lg:rounded-xl overflow-hidden border border-mist bg-ink shadow-[0_10px_28px_rgba(0,0,0,0.5)]
          ${card ? "" : "animate-shimmer"}`}
        style={{ ...FACE_STYLE, animationDelay: `${index * 120}ms` }}
      >
        <Image src={CARD_BACK_IMAGE} alt="" fill unoptimized sizes="200px" className="object-cover" />
      </span>
      {card && (
        <span
          className={`absolute inset-0 block rounded-[10px] lg:rounded-xl overflow-hidden border-[1.5px] bg-ink shadow-[0_10px_28px_rgba(0,0,0,0.5)]
            ${isSelected ? "border-gold" : reversed ? "border-reversed/55" : "border-upright/50"}`}
          style={{ ...FACE_STYLE, transform: "rotateY(180deg)" }}
        >
          {card.image_url && !imageFailed ? (
            <Image
              src={card.image_url}
              alt=""
              fill
              unoptimized
              sizes="200px"
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
      className="absolute top-1.5 left-1.5 z-10 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full
        bg-void/85 text-xs sm:text-[13px] font-semibold tabular-nums text-light"
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
      aria-haspopup={opensDialog ? "dialog" : undefined}
      aria-pressed={opensDialog ? undefined : isSelected}
      className={`absolute block rounded-[10px] lg:rounded-xl transition-transform duration-200 hover:-translate-y-1
        ${isSelected ? "ring-2 ring-gold ring-offset-[3px] ring-offset-void lg:ring-offset-ink" : ""}`}
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
  opensDialog: boolean
  onSelect: (index: number) => void
}

/** Bàn trải bài: mỗi lá nằm đúng vị trí hình học của kiểu trải (thập tự, móng ngựa…). */
export default function SpreadBoard({ spreadType, cards, selectedIndex, opensDialog, onSelect }: SpreadBoardProps) {
  const layout = SPREAD_LAYOUTS[spreadType]
  const positions = SPREADS_BY_TYPE[spreadType].positions

  return (
    <div
      className="relative mx-auto w-full"
      style={{ maxWidth: boardMaxWidth(layout), aspectRatio: `${layout.width} / ${layout.height}` }}
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
          opensDialog={opensDialog}
          onSelect={onSelect}
        />
      ))}
    </div>
  )
}

/** Vị trí, tên lá và chiều lá ngay dưới từng lá (kiểu trải một hàng), thẳng cột với bàn trải. */
export function SpreadCaptions({ spreadType, cards }: { spreadType: SpreadType; cards: CardInterpretation[] | null }) {
  const layout = SPREAD_LAYOUTS[spreadType]
  const positions = SPREADS_BY_TYPE[spreadType].positions
  const cardPct = (CARD_W / layout.width) * 100
  const gapPct = layout.slots.length > 1 ? ((layout.slots[1].x - CARD_W) / layout.width) * 100 : 0

  return (
    <ol
      className="mx-auto grid w-full"
      style={{
        maxWidth: boardMaxWidth(layout),
        gridTemplateColumns: `repeat(${layout.slots.length}, ${cardPct}%)`,
        columnGap: `${gapPct}%`,
      }}
    >
      {positions.map((pos, i) => {
        const card = cards?.[i]
        return (
          <li key={pos} className="flex min-w-0 flex-col items-start gap-1">
            <span className="text-[13px] sm:text-sm text-silver">{card ? positionLabel(card, spreadType) : pos}</span>
            {card ? (
              <>
                <span className="text-[15px] sm:text-[17px] font-semibold leading-snug text-light">{cardTitle(card)}</span>
                <OrientationTag reversed={card.orientation === "reversed"} />
              </>
            ) : (
              <span aria-hidden="true" className="mt-1 block h-4 w-4/5 rounded bg-veil animate-pulse" />
            )}
          </li>
        )
      })}
    </ol>
  )
}

interface SpreadLegendProps {
  spreadType: SpreadType
  cards: CardInterpretation[] | null
  selectedIndex: number | null
  opensDialog: boolean
  onSelect: (index: number) => void
}

/** Danh sách vị trí → lá bài cho kiểu trải nhiều lá; cũng là cách chọn lá bằng bàn phím. */
export function SpreadLegend({ spreadType, cards, selectedIndex, opensDialog, onSelect }: SpreadLegendProps) {
  const positions = SPREADS_BY_TYPE[spreadType].positions
  return (
    <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
      {positions.map((pos, i) => {
        const card = cards?.[i]
        const reversed = card?.orientation === "reversed"
        const number = (
          <span aria-hidden="true" className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-mist text-[13px] font-semibold tabular-nums text-pearl">
            {i + 1}
          </span>
        )
        return (
          <li key={pos + i}>
            {card ? (
              <button
                type="button"
                onClick={() => onSelect(i)}
                aria-haspopup={opensDialog ? "dialog" : undefined}
                aria-pressed={opensDialog ? undefined : selectedIndex === i}
                className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors
                  ${!opensDialog && selectedIndex === i
                    ? "border-gold bg-gold/[0.06]"
                    : "border-mist bg-ink lg:bg-void hover:border-pearl/40"
                  }`}
              >
                {number}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-silver">{positionLabel(card, spreadType)}</span>
                  <span className="block truncate text-base font-semibold text-light">{cardTitle(card)}</span>
                </span>
                <OrientationTag reversed={reversed} />
              </button>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-mist/60 px-3 py-2.5">
                {number}
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-silver">{pos}</span>
                  <span aria-hidden="true" className="mt-1 block h-4 w-28 rounded bg-veil animate-pulse" />
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
      className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-[13px] font-medium
        ${reversed ? "border-reversed/50 text-reversed" : "border-upright/50 text-upright"} ${className}`}
    >
      <span aria-hidden="true">{reversed ? "↓" : "↑"}</span>
      {reversed ? STRINGS.REVERSED : STRINGS.UPRIGHT}
    </span>
  )
}
