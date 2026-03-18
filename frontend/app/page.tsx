"use client";

import { useState, useCallback } from "react";
import IntentionInput from "@/app/components/IntentionInput";
import SpreadSelector from "@/app/components/SpreadSelector";
import DrawButton from "@/app/components/DrawButton";
import CardReveal from "@/app/components/CardReveal";
import AIReading from "@/app/components/AIReading";
import type {
  CardInterpretation,
  DrawRequest,
  DrawResponse,
  InterpretationResult,
  SpreadType,
} from "@/app/lib/types";

type AppState = "idle" | "streaming" | "revealed";

export default function Home() {
  const [intention, setIntention] = useState("");
  const [spreadType, setSpreadType] = useState<SpreadType>("single");
  const [appState, setAppState] = useState<AppState>("idle");
  const [drawResponse, setDrawResponse] = useState<DrawResponse | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardInterpretation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<DrawRequest | null>(null);

  const handleDraw = useCallback(() => {
    setError(null);
    setDrawResponse(null);
    setSelectedCard(null);
    const req: DrawRequest = {
      spread_type: spreadType,
      intention: intention.trim() || undefined,
    };
    setPendingRequest(req);
    setAppState("streaming");
  }, [spreadType, intention]);

  const handleDrawResult = useCallback((result: {
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
    setAppState("revealed");
  }, []);

  const handleDrawAgain = useCallback(() => {
    setAppState("idle");
    setDrawResponse(null);
    setSelectedCard(null);
    setPendingRequest(null);
    setError(null);
    setIntention("");
  }, []);

  return (
    <main className="min-h-screen bg-void text-light">
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
        {appState === "idle" && (
          <div className="space-y-6">
            <IntentionInput value={intention} onChange={setIntention} />
            <SpreadSelector selected={spreadType} onChange={setSpreadType} />
            <div className="flex justify-center">
              <DrawButton onClick={handleDraw} isLoading={false} />
            </div>
          </div>
        )}

        {/* Streaming + Revealed states — keep AIReading mounted */}
        {pendingRequest && (appState === "streaming" || appState === "revealed") && (
          <div className="space-y-8">
            {/* Cards — shown only after draw result arrives */}
            {drawResponse && (
              <>
                {intention && (
                  <p className="text-center text-silver font-serif italic">
                    &ldquo;{intention}&rdquo;
                  </p>
                )}
                <CardReveal
                  cards={drawResponse.interpretation.cards}
                  selectedCard={selectedCard}
                  onSelectCard={setSelectedCard}
                />
              </>
            )}

            {/* Show spinner while waiting for cards */}
            {!drawResponse && (
              <div className="flex items-center justify-center gap-3 py-6">
                <div className="w-5 h-5 border-2 border-arcane border-t-transparent rounded-full animate-spin" />
                <span className="text-silver font-serif text-base">Đang kết nối với vũ trụ…</span>
              </div>
            )}

            {/* AIReading — mounted once, handles its own streaming lifecycle */}
            <AIReading
              drawRequest={pendingRequest}
              onDrawResult={handleDrawResult}
            />

            {/* Overview stats — shown only after revealed */}
            {drawResponse && appState === "revealed" && (
              <>
                <div className="rounded-lg border border-mist bg-ink p-5 text-base space-y-3">
                  <div className="flex justify-between text-silver">
                    <span>Nguyên tố thống trị</span>
                    <span className="text-pearl capitalize font-medium">{drawResponse.interpretation.dominant_element}</span>
                  </div>
                  <div className="flex justify-between text-silver">
                    <span>Elemental Dignity</span>
                    <span className="text-pearl font-medium">{drawResponse.interpretation.overall_dignity_score.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-silver">
                    <span>Nguồn entropy</span>
                    <span className="text-pearl font-medium">{drawResponse.interpretation.quantum_source}</span>
                  </div>
                </div>

                <p className="text-sm text-silver/80 text-center leading-relaxed">
                  {drawResponse.disclaimer}
                </p>

                <div className="flex justify-center">
                  <button
                    onClick={handleDrawAgain}
                    className="px-6 py-2 rounded border border-mist text-silver hover:text-pearl hover:border-arcane transition-colors font-serif"
                  >
                    ✦ Rút bài lại
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-6 rounded border border-red-500/50 bg-red-900/10 p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="text-red-400 text-center flex-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-400/70 hover:text-red-400 transition-colors flex-shrink-0 text-lg leading-none"
                aria-label="Đóng thông báo lỗi"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-center mt-3">
              <button
                onClick={handleDrawAgain}
                className="text-sm text-red-400/80 hover:text-red-400 underline transition-colors font-sans"
              >
                Thử lại
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
