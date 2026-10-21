"use client"

import Image from "next/image"
import { useState, type ReactNode } from "react"
import { OrientationTag, cardTitle, positionLabel } from "@/app/components/SpreadBoard"
import { ELEMENT_VI, QUANTUM_SOURCE_LABELS, SUIT_VI, ZODIAC_MODE_VI } from "@/app/lib/constants"
import { STRINGS } from "@/app/lib/strings"
import type { CardInterpretation, InterpretationResult } from "@/app/lib/types"

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-silver mb-2">{title}</h3>
      {children}
    </section>
  )
}

function capitalize(text: string): string {
  return text ? text[0].toUpperCase() + text.slice(1) : text
}

function DignityNote({ card }: { card: CardInterpretation }) {
  const w = card.dignity_weight
  const tone = w > 0 ? "text-positive" : w < 0 ? "text-negative" : "text-silver"
  const icon = w > 0 ? "▲" : w < 0 ? "▼" : "●"
  return (
    <p className="flex items-start gap-2 text-base text-pearl">
      <span aria-hidden="true" className={`${tone} text-xs mt-1.5`}>{icon}</span>
      <span>{capitalize(card.dignity_label_vi)}.</span>
    </p>
  )
}

interface InterpretationPanelProps {
  card: CardInterpretation
  interpretation: InterpretationResult
}

/** Chi tiết một lá: ý nghĩa trước, kỹ thuật (byte, điểm số) thu gọn ở cuối. */
export default function InterpretationPanel({ card, interpretation }: InterpretationPanelProps) {
  const [imageFailed, setImageFailed] = useState(false)
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

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        {card.image_url && !imageFailed && (
          <div className="relative w-24 sm:w-28 aspect-[3/5] flex-shrink-0 rounded-lg overflow-hidden border border-mist shadow-lg">
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
        <div className="min-w-0 flex-1">
          <p className="text-sm text-silver">
            {card.position_index + 1} · {positionLabel(card, interpretation.spread_type)}
          </p>
          <h2 id="card-detail-title" className="font-serif text-2xl sm:text-3xl text-light leading-tight mt-0.5">
            {cardTitle(card)}
          </h2>
          {card.name_vi && <p className="font-serif italic text-base text-silver">{card.card_name}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <OrientationTag reversed={reversed} />
            <span className="text-sm text-silver">
              {SUIT_VI[card.suit] ?? card.suit}
              {element && ` · ${element}`}
            </span>
          </div>
        </div>
      </div>

      {keywords.length > 0 && (
        <Section title={`${STRINGS.MEANING} (${reversed ? STRINGS.REVERSED : STRINGS.UPRIGHT})`}>
          <ul className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <li
                key={kw}
                className={`rounded-full border px-3 py-1 text-sm text-light ${reversed ? "border-reversed/40 bg-reversed/10" : "border-upright/40 bg-upright/10"}`}
              >
                {kw}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {hasNeighbours && (
        <Section title={STRINGS.NEIGHBOURS}>
          <DignityNote card={card} />
        </Section>
      )}

      <Section title={STRINGS.TIMING}>
        <p className="font-serif text-lg text-light">{capitalize(timingRange)}</p>
        {timingNotes && <p className="mt-1 text-base text-pearl leading-relaxed">{timingNotes}</p>}
      </Section>

      {(astro || zodiac) && (
        <Section title={STRINGS.ASTROLOGY}>
          <p className="text-base text-pearl">
            {astro}
            {zodiac && <span className="text-silver">{astro ? " · " : ""}Cung {zodiac.toLowerCase()}</span>}
          </p>
        </Section>
      )}

      <details className="group rounded-lg border border-mist px-4 py-3">
        <summary className="cursor-pointer text-sm text-silver hover:text-pearl">{STRINGS.TECHNICAL}</summary>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm font-mono text-pearl">
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
