"use client";

import { useState, useCallback } from "react";
import IntentionInput from "@/app/components/IntentionInput";
import SpreadSelector from "@/app/components/SpreadSelector";
import DrawButton from "@/app/components/DrawButton";
import CardReveal from "@/app/components/CardReveal";
import AIReading from "@/app/components/AIReading";
import InterpretationPanel from "@/app/components/InterpretationPanel";
import type {
  CardInterpretation,
  DrawRequest,
  DrawResponse,
  InterpretationResult,
  SpreadType,
} from "@/app/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type RitualPhase = "approach" | "invoke" | "reveal";

// ─── EyeSigil ─────────────────────────────────────────────────────────────────

function EyeSigil({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

// ─── Ambient Ember Particles ──────────────────────────────────────────────────

const EMBER_PARTICLES = [
  { left: "8%",  delay: "0s",   dur: "7s"  },
  { left: "22%", delay: "2s",   dur: "9s"  },
  { left: "38%", delay: "0.5s", dur: "6s"  },
  { left: "51%", delay: "3s",   dur: "8s"  },
  { left: "65%", delay: "1.2s", dur: "10s" },
  { left: "77%", delay: "0.8s", dur: "5s"  },
  { left: "88%", delay: "2.7s", dur: "7s"  },
  { left: "95%", delay: "1.5s", dur: "6s"  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [intention, setIntention]       = useState("");
  const [spreadType, setSpreadType]     = useState<SpreadType>("single");
  const [phase, setPhase]               = useState<RitualPhase>("approach");
  const [drawResponse, setDrawResponse] = useState<DrawResponse | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardInterpretation | null>(null);
  const [error, setError]               = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<DrawRequest | null>(null);
  const [oracleText, setOracleText]     = useState("");

  const handleDraw = useCallback(() => {
    setError(null);
    setDrawResponse(null);
    setSelectedCard(null);
    const req: DrawRequest = {
      spread_type: spreadType,
      intention: intention.trim() || undefined,
    };
    setPendingRequest(req);
    setPhase("invoke");
  }, [spreadType, intention]);

  const handleDrawResult = useCallback(
    (result: {
      session_id: string;
      interpretation: InterpretationResult;
      disclaimer: string;
    }) => {
      const resp: DrawResponse = {
        session_id: result.session_id,
        interpretation: result.interpretation,
        disclaimer: result.disclaimer,
      };
      setDrawResponse(resp);
      setSelectedCard(result.interpretation.cards[0] ?? null);
      setPhase("reveal");
    },
    []
  );

  const handleDrawAgain = useCallback(() => {
    setPhase("approach");
    setDrawResponse(null);
    setSelectedCard(null);
    setPendingRequest(null);
    setError(null);
    setIntention("");
    setOracleText("");
  }, []);

  return (
    <main className="min-h-screen bg-void text-light" id="main-content">

      {/* ── APPROACH ─────────────────────────────────────────────────────── */}
      {phase === "approach" && (
        <section className="animate-phase-fade-in h-screen flex flex-col overflow-hidden">
          {/* Ambient ember particles */}
          {EMBER_PARTICLES.map((p, i) => (
            <div
              key={i}
              className="fixed bottom-0 w-1 h-1 rounded-full bg-flame/60 pointer-events-none"
              style={{
                left: p.left,
                animation: `emberFloat ${p.dur} ${p.delay} infinite ease-out`,
              }}
              aria-hidden="true"
            />
          ))}

          {/* Ambient altar glow — full screen */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse 80% 50% at 50% 80%, rgba(124,111,205,0.18) 0%, rgba(212,168,67,0.08) 40%, transparent 70%)",
            }}
            aria-hidden="true"
          />

          {/* ── TOP: Brand header — compact, etched ── */}
          <div className="flex-none pt-5 pb-0 text-center">
            <div className="flex items-center justify-center gap-2 mb-0.5">
              <EyeSigil size={16} className="text-arcane/60" />
              <h1
                className="font-cinzel text-sm tracking-[0.3em] uppercase animate-inscribe"
                style={{ color: "rgba(139,143,168,0.75)" }}
              >
                Sacred Tarot
              </h1>
              <EyeSigil size={16} className="text-arcane/60" />
            </div>
            <p className="font-serif italic text-silver/60 text-xs leading-relaxed">
              Quantum-powered · Cosmos entropy
            </p>
          </div>

          {/* ── MIDDLE: Spread selector + Draw focal point ── */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-4 min-h-0">
            {/* Spread selector */}
            <div className="w-full max-w-lg">
              <SpreadSelector selected={spreadType} onChange={setSpreadType} />
            </div>

            {/* Draw button — the altar focal point */}
            <div className="flex flex-col items-center gap-2">
              <DrawButton onClick={handleDraw} isLoading={false} />
            </div>
          </div>

          {/* ── BOTTOM: Intention input — grounding element ── */}
          <div className="flex-none w-full max-w-lg mx-auto px-4 pb-7">
            <IntentionInput value={intention} onChange={setIntention} />
          </div>
        </section>
      )}

      {/* ── INVOKE + REVEAL — AIReading stays mounted across both phases ── */}
      {pendingRequest && (phase === "invoke" || phase === "reveal") && (
        <>
          {/* INVOKE: centered communing view */}
          {phase === "invoke" && (
            <section className="animate-phase-fade-in flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4 py-12">
              <h2 className="text-phase">The Oracle is Communing</h2>
              <EyeSigil size={80} className="text-arcane animate-sigil-pulse" />
              <div className="w-full max-w-3xl">
                <AIReading key="invoke" drawRequest={pendingRequest} onDrawResult={handleDrawResult} onStreamComplete={(text) => setOracleText(text)} />
              </div>
            </section>
          )}

          {/* REVEAL: full layout with cards + oracle + grimoire */}
          {phase === "reveal" && (
            <section className="animate-phase-fade-in">
              <div className="max-w-5xl mx-auto px-4 pb-16 pt-8">
                {/* Phase label */}
                <h2 className="text-phase text-center mb-8">The Cards Have Spoken</h2>

                {/* Intention quote */}
                {intention && (
                  <p className="font-serif italic text-silver text-center mb-8 text-lg">
                    &ldquo;{intention}&rdquo;
                  </p>
                )}

                {/* Main layout: cards column + grimoire sidebar */}
                <div className="flex gap-8 items-start">
                  <div className="flex-1 min-w-0 space-y-8">
                    {/* Cards */}
                    {drawResponse && (
                      <CardReveal
                        cards={drawResponse.interpretation.cards}
                        selectedCard={selectedCard}
                        onSelectCard={setSelectedCard}
                      />
                    )}

                    {/* Oracle scroll — AIReading re-renders in reveal, already has streamed text */}
                    <AIReading key="reveal" drawRequest={pendingRequest} onDrawResult={handleDrawResult} initialText={oracleText} skipFetch={true} />

                    {/* Session Codex */}
                    {drawResponse && (
                      <div
                        className="rounded-2xl border border-mist bg-abyss p-6 space-y-4"
                        style={{ borderTopColor: "rgba(232,160,69,0.3)", borderTopWidth: "2px" }}
                      >
                        <h3 className="text-phase mb-4">Session Codex</h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-sans text-sm text-silver">Dominant Element</span>
                            <span className="font-serif text-pearl capitalize">
                              {drawResponse.interpretation.dominant_element}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-sans text-sm text-silver">Elemental Dignity</span>
                            <span className="font-mono text-sm text-pearl">
                              {drawResponse.interpretation.overall_dignity_score.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-sans text-sm text-silver">Quantum Source</span>
                            <span className="font-mono text-sm text-pearl">
                              {drawResponse.interpretation.quantum_source === "anu_qrng"
                                ? "ANU Quantum RNG"
                                : drawResponse.interpretation.quantum_source}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Disclaimer */}
                    {drawResponse && (
                      <p className="font-serif italic text-sm text-silver/60 text-center leading-relaxed max-w-prose mx-auto">
                        {drawResponse.disclaimer}
                      </p>
                    )}

                    {/* Begin Anew */}
                    <div className="flex justify-center pt-4">
                      <button
                        type="button"
                        onClick={handleDrawAgain}
                        className="font-cinzel text-sm tracking-[0.2em] px-8 py-3 rounded-full border border-mist text-silver hover:border-flame/60 hover:text-parchment transition-[border-color,color] duration-300 cursor-pointer"
                      >
                        BEGIN ANEW
                      </button>
                    </div>
                  </div>

                  {/* Grimoire Panel — desktop sidebar */}
                  {selectedCard && drawResponse && (
                    <aside aria-label="Card interpretation" className="hidden lg:block w-80 flex-shrink-0 sticky top-16">
                      <InterpretationPanel
                        card={selectedCard}
                        interpretationResult={drawResponse.interpretation}
                      />
                    </aside>
                  )}
                </div>

                {/* Grimoire Panel — mobile (below all content) */}
                {selectedCard && drawResponse && (
                  <aside aria-label="Card interpretation" className="lg:hidden mt-8">
                    <InterpretationPanel
                      card={selectedCard}
                      interpretationResult={drawResponse.interpretation}
                    />
                  </aside>
                )}
              </div>
            </section>
          )}
        </>
      )}

      {/* ── ERROR TOAST ──────────────────────────────────────────────────── */}
      {/* Error toast — persistent live region */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-opacity duration-200 ${
          error ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        {error && (
          <div className="bg-abyss border border-crimson/50 rounded-xl px-6 py-4 flex items-center gap-4 shadow-xl">
            <span className="font-serif text-crimson-glow">{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-silver/60 hover:text-silver transition-colors ml-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-flame focus-visible:outline-none rounded"
              aria-label="Dismiss error"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
