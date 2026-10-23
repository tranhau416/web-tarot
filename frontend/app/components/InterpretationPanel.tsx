"use client"

import Image from "next/image"
import { useState } from "react"
import { OrientationTag, cardTitle, positionLabel } from "@/app/components/SpreadBoard"
import { ELEMENT_VI, QUANTUM_SOURCE_LABELS, SUIT_VI, ZODIAC_MODE_VI } from "@/app/lib/constants"
import { STRINGS } from "@/app/lib/strings"
import type { CardInterpretation, InterpretationResult } from "@/app/lib/types"

function capitalize(text: string): string {
  return text ? text[0].toUpperCase() + text.slice(1) : text
}

function DignityNote({ card }: { card: CardInterpretation }) {
  const w = card.dignity_weight
  const tone = w > 0 ? "text-positive" : w < 0 ? "text-negative" : "text-silver"
  const icon = w > 0 ? "▲" : w < 0 ? "▼" : "●"
  return (
    <span className="flex items-start gap-2">
      <span aria-hidden="true" className={`${tone} text-xs mt-1.5`}>{icon}</span>
      <span>{capitalize(card.dignity_label_vi)}.</span>
    </span>
  )
}

interface InterpretationPanelProps {
  card: CardInterpretation
  interpretation: InterpretationResult
  /**
   * sheet: trong bảng chi tiết trên điện thoại — có ảnh lá, tiêu đề là nhãn của dialog.
   * inline: ngay dưới bàn trải trên desktop — lá đã hiện trên bàn nên không lặp ảnh.
   */
  variant?: "sheet" | "inline"
}

/** Chi tiết một lá: ý nghĩa trước, kỹ thuật (byte, điểm số) thu gọn ở cuối. */
export default function InterpretationPanel({ card, interpretation, variant = "sheet" }: InterpretationPanelProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const inline = variant === "inline"
  const reversed = card.orientation === "reversed"
  const keywords = reversed
    ? (card.keywords_reversed_vi.length ? card.keywords_reversed_vi : card.keywords_reversed)
    : (card.keywords_upright_vi.length ? card.keywords_upright_vi : card.keywords_upright)
  const hasNeighbours = interpretation.cards.length > 1
  const element = card.element ? ELEMENT_VI[card.element] : null
  const zodiac = card.zodiac_mode ? ZODIAC_MODE_VI[card.zodiac_mode] ?? card.zodiac_mode : null
  const astro = card.astro_decan_vi || card.astro_decan
  const timingRange = card.timing.range_vi || card.timing.timing_range
  const timingNotes = card.timing.notes_vi
  const suitLine = `${SUIT_VI[card.suit] ?? card.suit}${element ? ` · ${element}` : ""}`
  // Giữ thứ bậc tiêu đề: trong dialog tên lá là h2, ngay dưới bàn trải là h3
  const SubHeading = inline ? "h4" : "h3"

  return (
    <div className="flex flex-col gap-6">
      {inline ? (
        <div aria-live="polite" className="flex flex-col gap-0.5">
          <h3 className="font-display text-[28px] font-medium leading-tight text-light">{cardTitle(card)}</h3>
          <p className="text-[15px] text-pearl">
            {card.name_vi ? `${card.card_name} · ` : ""}
            {suitLine}
          </p>
        </div>
      ) : (
        <div className="flex items-start gap-4">
          {card.image_url && !imageFailed && (
            <div className={`relative w-24 sm:w-28 aspect-[3/5] flex-shrink-0 overflow-hidden rounded-[10px] border-[1.5px]
              ${reversed ? "border-reversed/55" : "border-upright/50"}`}
            >
              <Image
                src={card.image_url}
                alt={`${card.card_name}${reversed ? ` (${STRINGS.REVERSED.toLowerCase()})` : ""}`}
                fill
                unoptimized
                sizes="112px"
                className={`object-cover ${reversed ? "rotate-180" : ""}`}
                onError={() => setImageFailed(true)}
              />
            </div>
          )}
          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <p className="text-sm text-silver">
              {card.position_index + 1} · {positionLabel(card, interpretation.spread_type)}
            </p>
            <h2 id="card-detail-title" className="font-display text-3xl font-medium leading-tight text-light">
              {cardTitle(card)}
            </h2>
            {card.name_vi && <p className="text-[15px] text-pearl">{card.card_name}</p>}
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <OrientationTag reversed={reversed} />
              <span className="text-sm text-pearl">{suitLine}</span>
            </div>
          </div>
        </div>
      )}

      {keywords.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <SubHeading className="text-[15px] font-semibold text-pearl">
            {reversed ? STRINGS.MEANING_REVERSED : STRINGS.MEANING_UPRIGHT}
          </SubHeading>
          <ul className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <li
                key={kw}
                className={`rounded-full border px-3 py-1.5 text-[15px] leading-tight text-light
                  ${reversed ? "border-reversed/35 bg-reversed/10" : "border-upright/35 bg-upright/10"}`}
              >
                {kw}
              </li>
            ))}
          </ul>
        </section>
      )}

      <dl
        className={`text-base leading-relaxed
          ${inline ? "grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 text-[15px]" : "flex flex-col gap-3.5"}`}
      >
        <div className={inline ? "contents" : "flex flex-col gap-0.5"}>
          <dt className={inline ? "text-silver" : "text-[15px] font-semibold text-pearl"}>{STRINGS.TIMING}</dt>
          <dd className="text-light">
            {capitalize(timingRange)}.
            {timingNotes && <span className="block text-pearl">{timingNotes}</span>}
          </dd>
        </div>
        {hasNeighbours && (
          <div className={inline ? "contents" : "flex flex-col gap-0.5"}>
            <dt className={inline ? "text-silver" : "text-[15px] font-semibold text-pearl"}>{STRINGS.NEIGHBOURS}</dt>
            <dd className="text-light"><DignityNote card={card} /></dd>
          </div>
        )}
        {(astro || zodiac) && (
          <div className={inline ? "contents" : "flex flex-col gap-0.5"}>
            <dt className={inline ? "text-silver" : "text-[15px] font-semibold text-pearl"}>{STRINGS.ASTROLOGY}</dt>
            <dd className="text-light">
              {astro}
              {zodiac && <span className="text-pearl">{astro ? " · " : ""}Cung {zodiac.toLowerCase()}</span>}
            </dd>
          </div>
        )}
      </dl>

      <details className="rounded-xl border border-mist">
        <summary className="flex min-h-11 cursor-pointer items-center px-4 text-[15px] text-pearl hover:text-light">
          {STRINGS.TECHNICAL}
        </summary>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-4 pb-4 text-sm tabular-nums text-light">
          <dt className="text-silver">Elemental dignity</dt>
          <dd>{card.dignity_weight >= 0 ? "+" : ""}{card.dignity_weight.toFixed(2)}</dd>
          <dt className="text-silver">{STRINGS.ENTROPY_SOURCE}</dt>
          <dd>{QUANTUM_SOURCE_LABELS[interpretation.quantum_source] ?? interpretation.quantum_source}</dd>
          <dt className="text-silver">Byte chọn lá</dt>
          <dd>{card.raw_quantum_byte}</dd>
          {card.orientation_byte !== null && (
            <>
              <dt className="text-silver">Byte chiều lá</dt>
              <dd>{card.orientation_byte}</dd>
            </>
          )}
        </dl>
      </details>
    </div>
  )
}
