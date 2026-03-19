"use client"

import { memo } from "react"
import type { CardInterpretation, InterpretationResult } from "../lib/types"

interface InterpretationPanelProps {
  card: CardInterpretation
  interpretationResult?: InterpretationResult
}

function DignityBar({ value }: { value: number }) {
  const percentage = ((value + 1) / 2) * 100
  const color =
    value > 0.2 ? "#6EC99F" : value < -0.2 ? "#E07A7A" : "#8B8FA8"
  const label =
    value > 0.2 ? "Harmonious" : value < -0.2 ? "Discordant" : "Neutral"

  return (
    <div className="mt-2">
      <div className="flex justify-between text-sm text-silver/70 mb-1 font-mono">
        <span aria-hidden="true">−1.0</span>
        <span className="font-medium" style={{ color }}>
          <span className="sr-only">{label}, </span>
          {value >= 0 ? "+" : ""}{value.toFixed(2)}
        </span>
        <span aria-hidden="true">+1.0</span>
      </div>
      <div
        className="h-1.5 rounded-full bg-veil overflow-hidden"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={-1}
        aria-valuemax={1}
        aria-label={`Elemental dignity: ${label} (${value >= 0 ? "+" : ""}${value.toFixed(2)})`}
      >
        <div
          className="h-full rounded-full transition-[width,background-color] duration-700"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function InterpretationPanel({
  card,
  interpretationResult,
}: InterpretationPanelProps) {
  const isUpright = card.orientation === "upright"
  const keywords = isUpright ? card.keywords_upright : card.keywords_reversed
  const quantumSource = interpretationResult?.quantum_source ?? "os_entropy"

  return (
    <div
      className="animate-phase-fade-in rounded-2xl border border-mist bg-abyss overflow-hidden"
      style={{ borderTopColor: "rgba(232,160,69,0.2)" }}
    >
      {/* Header section */}
      <div className="px-5 py-5 border-b border-mist/50">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-cinzel text-2xl text-parchment leading-tight">
              {card.card_name}
            </h3>
            <p className="font-serif italic text-sm text-silver mt-1">
              {card.suit.replace(/_/g, " ")} ·{" "}
              {card.arcana.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </p>
          </div>
          <div
            className={`flex-shrink-0 px-3 py-1 rounded-full border font-cinzel text-xs tracking-wider
              ${isUpright
                ? "border-upright/50 text-upright bg-upright/10"
                : "border-reversed/50 text-reversed bg-reversed/10"
              }`}
          >
            {isUpright ? "Upright" : "Reversed"}
          </div>
        </div>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* 1. Timing */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {/* Hourglass icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-flame/60" aria-hidden="true">
              <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 1 .586 1.414L12 12l4.414-4.414A2 2 0 0 1 17 6.172V2"/>
            </svg>
            <h3 className="text-phase">Timing</h3>
          </div>
          <div className="border-t border-flame/20 pt-3">
            <p className="text-glow-arcane font-serif text-lg">
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

        {/* Divider */}
        <div className="border-t border-flame/20" />

        {/* 2. Elemental Dignity */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            {/* Triangle element icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-flame/60" aria-hidden="true">
              <path d="M12 3 L21 20 H3 Z"/>
            </svg>
            <h3 className="text-phase">Elemental Dignity</h3>
          </div>
          <div className="border-t border-flame/20 pt-3">
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
          <>
            <div className="border-t border-flame/20" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                {/* Diamond icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-flame/60" aria-hidden="true">
                  <path d="M12 2 L22 12 L12 22 L2 12 Z"/>
                </svg>
                <h3 className="text-phase">Keywords</h3>
              </div>
              <div className="border-t border-flame/20 pt-3">
                <div className="flex flex-wrap gap-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className={`font-cinzel text-xs tracking-wide px-3 py-1.5 rounded-full border
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
            </div>
          </>
        )}

        {/* 4. Astrology */}
        {(card.zodiac_mode || card.astro_decan) && (
          <>
            <div className="border-t border-flame/20" />
            <div>
              <div className="flex items-center gap-2 mb-2">
                {/* Star icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-flame/60" aria-hidden="true">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
                </svg>
                <h3 className="text-phase">Astrology</h3>
              </div>
              <div className="border-t border-flame/20 pt-3">
                <div className="text-silver text-base font-sans space-y-1.5">
                  {card.zodiac_mode && (
                    <p>Zodiac: <span className="text-pearl">{card.zodiac_mode}</span></p>
                  )}
                  {card.astro_decan && (
                    <p>Decan: <span className="text-pearl">{card.astro_decan}</span></p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quantum Source Footer */}
      <div className="border-t border-mist/50 px-5 py-4">
        <p className="font-mono text-xs text-silver/60 flex items-center gap-2">
          {/* Atom icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="1"/>
            <path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9-4.54-4.52-9.87-6.54-11.9-4.5-2.04 2.03-.02 7.36 4.5 11.9 4.54 4.52 9.87 6.54 11.9 4.5z"/>
            <path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9-2.03-2.04-7.36-.02-11.9 4.5-4.52 4.54-6.54 9.87-4.5 11.9 2.03 2.04 7.36.02 11.9-4.5z"/>
          </svg>
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

export default memo(InterpretationPanel);
