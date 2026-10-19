"use client";

import { useState, useCallback } from "react";
import IntentionInput from "@/app/components/IntentionInput";
import SpreadSelector from "@/app/components/SpreadSelector";
import DrawButton from "@/app/components/DrawButton";
import CardReveal from "@/app/components/CardReveal";
import AIReading from "@/app/components/AIReading";
import InterpretationPanel from "@/app/components/InterpretationPanel";
import { QUANTUM_SOURCE_LABELS } from "@/app/lib/constants";
import { useTarotReading } from "@/app/lib/useTarotReading";
import type { CardInterpretation, DrawRequest, SpreadType } from "@/app/lib/types";

export default function Home() {
  const [intention, setIntention] = useState("");
  const [spreadType, setSpreadType] = useState<SpreadType>("single");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { phase, request, draw, text, error, start, reset } = useTarotReading();

  const cards = draw?.interpretation.cards ?? [];
  const selectedCard = cards[selectedIndex] ?? null;
  const isStreaming = phase === "reading";

  const handleDraw = useCallback(() => {
    const req: DrawRequest = {
      spread_type: spreadType,
      intention: intention.trim() || undefined,
    };
    setSelectedIndex(0);
    start(req);
  }, [spreadType, intention, start]);

  const handleRetry = useCallback(() => {
    if (!request) return;
    setSelectedIndex(0);
    start(request);
  }, [request, start]);

  const handleDrawAgain = useCallback(() => {
    reset();
    setSelectedIndex(0);
    setIntention("");
  }, [reset]);

  const handleSelectCard = useCallback((card: CardInterpretation) => {
    setSelectedIndex(card.position_index);
  }, []);

  return (
    <div className="min-h-screen bg-void text-light">
      {/* Hero */}
      <section className="py-8 sm:py-12 md:py-16 text-center px-4">
        <div className="text-5xl sm:text-7xl mb-4 sm:mb-6">🔮</div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-pearl mb-4 leading-tight tracking-tight">Sacred Tarot</h1>
        <p className="text-base md:text-lg text-silver max-w-xl mx-auto leading-relaxed">
          Quantum-powered readings — mỗi lá bài được chọn bởi entropy lượng tử thực sự.
        </p>
      </section>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {/* Draw form — only show when idle */}
        {phase === "idle" && (
          <div className="space-y-6">
            <IntentionInput value={intention} onChange={setIntention} />
            <SpreadSelector selected={spreadType} onChange={setSpreadType} />
            <div className="flex justify-center">
              <DrawButton onClick={handleDraw} isLoading={false} />
            </div>
          </div>
        )}

        {phase !== "idle" && (
          <div className="space-y-8">
            {request?.intention && (
              <p className="text-center text-silver font-serif italic">
                &ldquo;{request.intention}&rdquo;
              </p>
            )}

            {draw && (
              <>
                <CardReveal
                  cards={cards}
                  selectedCard={selectedCard}
                  onSelectCard={handleSelectCard}
                />
                {selectedCard && (
                  <InterpretationPanel
                    key={selectedCard.position_index}
                    card={selectedCard}
                    interpretationResult={draw.interpretation}
                  />
                )}
              </>
            )}

            {(phase === "drawing" || draw) && (
              <AIReading
                text={text}
                isWaiting={phase === "drawing"}
                isStreaming={isStreaming}
                isDone={phase === "done"}
                error={error}
              />
            )}

            {/* Overview stats */}
            {draw && (
              <>
                <div className="rounded-lg border border-mist bg-ink p-5 text-base space-y-3">
                  <div className="flex justify-between text-silver">
                    <span>Nguyên tố thống trị</span>
                    <span className="text-pearl capitalize font-medium">{draw.interpretation.dominant_element}</span>
                  </div>
                  <div className="flex justify-between text-silver">
                    <span>Elemental Dignity</span>
                    <span className="text-pearl font-medium">{draw.interpretation.overall_dignity_score.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-silver">
                    <span>Nguồn entropy</span>
                    <span className="text-pearl font-medium">
                      {QUANTUM_SOURCE_LABELS[draw.interpretation.quantum_source] ?? draw.interpretation.quantum_source}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-silver/80 text-center leading-relaxed">
                  {draw.disclaimer}
                </p>
              </>
            )}

            {/* Error before any card arrived */}
            {error && !draw && (
              <div className="rounded border border-red-500/50 bg-red-900/10 p-4" role="alert">
                <p className="text-red-400 text-center">{error}</p>
              </div>
            )}

            {phase !== "drawing" && (
              <div className="flex flex-wrap justify-center gap-3">
                {phase === "error" && (
                  <button
                    onClick={handleRetry}
                    className="px-6 py-2 rounded border border-arcane/60 text-glow hover:text-pearl hover:border-arcane transition-colors font-serif"
                  >
                    ↻ Thử lại
                  </button>
                )}
                <button
                  onClick={handleDrawAgain}
                  className="px-6 py-2 rounded border border-mist text-silver hover:text-pearl hover:border-arcane transition-colors font-serif"
                >
                  ✦ Rút bài lại
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
