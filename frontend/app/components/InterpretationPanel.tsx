"use client"

import type { CardInterpretation, InterpretationResult } from "../lib/types"

interface InterpretationPanelProps {
  card: CardInterpretation
  interpretationResult?: InterpretationResult
}

function DignityBar({ value }: { value: number }) {
  // value from -1.0 to +1.0
  const percentage = ((value + 1) / 2) * 100
  const color =
    value > 0.2 ? "#6EC99F" : value < -0.2 ? "#E07A7A" : "#8B8FA8"

  return (
    <div className="mt-2">
      <div className="flex justify-between text-sm text-silver/70 mb-1 font-mono">
        <span>−1.0</span>
        <span className="font-medium" style={{ color }}>
          {value >= 0 ? "+" : ""}{value.toFixed(2)}
        </span>
        <span>+1.0</span>
      </div>
      <div className="h-1.5 rounded-full bg-mist overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

export default function InterpretationPanel({
  card,
  interpretationResult,
}: InterpretationPanelProps) {
  const isUpright = card.orientation === "upright"
  const keywords = isUpright ? card.keywords_upright : card.keywords_reversed
  const quantumSource = interpretationResult?.quantum_source ?? "os_entropy"

  return (
    <div className="bg-ink border border-mist rounded-2xl p-4 sm:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-3xl text-light leading-tight">
            {card.card_name}
          </h3>
          <p className="text-silver text-base font-sans mt-1">
            {card.suit.replace(/_/g, " ")} ·{" "}
            {card.arcana.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </p>
        </div>
        <div
          className={`flex-shrink-0 px-3 py-1 rounded-full border text-sm font-sans font-medium
            ${isUpright
              ? "border-upright/50 text-upright bg-upright/10"
              : "border-reversed/50 text-reversed bg-reversed/10"
            }`}
        >
          {isUpright ? "Upright" : "Reversed"}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-mist" />

      {/* 1. Timing */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">⏳</span>
          <h4 className="text-pearl text-sm font-sans font-semibold uppercase tracking-wider">
            Timing
          </h4>
        </div>
        <div className="bg-veil rounded-xl p-4">
          <p className="text-glow font-serif text-lg">
            {card.timing.timing_range === "timeless"
              ? "Timeless"
              : card.timing.timing_range}
          </p>
          {card.timing.notes && card.timing.notes !== "timeless" && (
            <p className="text-silver text-base font-sans mt-1.5 leading-relaxed">
              {card.timing.notes}
            </p>
          )}
          {card.timing.zodiac_mode && (
            <p className="text-silver/70 text-sm font-sans mt-1.5">
              Zodiac: {card.timing.zodiac_mode}
            </p>
          )}
        </div>
      </div>

      {/* 2. Elemental Dignity */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">⚗️</span>
          <h4 className="text-pearl text-sm font-sans font-semibold uppercase tracking-wider">
            Elemental Dignity
          </h4>
        </div>
        <div className="bg-veil rounded-xl p-4">
          {card.element && (
            <p className="text-silver text-base font-sans mb-2">
              Element:{" "}
              <span className="text-pearl capitalize">{card.element}</span>
            </p>
          )}
          <DignityBar value={card.dignity_weight} />
        </div>
      </div>

      {/* 3. Keywords */}
      {keywords.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">🔑</span>
            <h4 className="text-pearl text-sm font-sans font-semibold uppercase tracking-wider">
              Keywords
            </h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <span
                key={kw}
                className={`px-3 py-1.5 rounded-full text-sm font-sans border
                  ${isUpright
                    ? "border-upright/30 text-upright bg-upright/5"
                    : "border-reversed/30 text-reversed bg-reversed/5"
                  }`}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Astro decan / Zodiac */}
      {(card.zodiac_mode || card.astro_decan) && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">♑</span>
            <h4 className="text-pearl text-sm font-sans font-semibold uppercase tracking-wider">
              Astrology
            </h4>
          </div>
          <div className="text-silver text-base font-sans space-y-1.5">
            {card.zodiac_mode && <p>Zodiac: <span className="text-pearl">{card.zodiac_mode}</span></p>}
            {card.astro_decan && <p>Decan: <span className="text-pearl">{card.astro_decan}</span></p>}
          </div>
        </div>
      )}

      {/* 4. Quantum Source Footer */}
      <div className="border-t border-mist pt-4">
        <p className="text-silver/80 text-xs font-mono flex items-center gap-2">
          <span>🔬</span>
          <span>
            Entropy:{" "}
            <span className="text-silver/80">
              {quantumSource === "anu_qrng"
                ? "ANU Quantum RNG"
                : quantumSource}
            </span>
          </span>
          <span className="ml-auto text-silver/50">
            byte: {card.raw_quantum_byte}
          </span>
        </p>
      </div>
    </div>
  )
}
