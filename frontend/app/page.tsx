"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AIReading from "@/app/components/AIReading";
import CardSheet from "@/app/components/CardSheet";
import DrawButton from "@/app/components/DrawButton";
import HeroFan from "@/app/components/HeroFan";
import IntentionInput from "@/app/components/IntentionInput";
import InterpretationPanel from "@/app/components/InterpretationPanel";
import SpreadBoard, { SpreadLegend, cardTitle, positionLabel } from "@/app/components/SpreadBoard";
import SpreadSelector from "@/app/components/SpreadSelector";
import { QUANTUM_SOURCE_LABELS, spreadSummary } from "@/app/lib/constants";
import { saveReading } from "@/app/lib/history";
import { STRINGS } from "@/app/lib/strings";
import { useTarotReading } from "@/app/lib/useTarotReading";
import type { DrawResponse, SpreadType } from "@/app/lib/types";

const BUTTON_PRIMARY =
  "rounded-xl bg-cta px-5 py-2.5 font-medium text-light shadow-lg shadow-arcane/25 transition-colors hover:bg-cta-hover";
const BUTTON_SECONDARY =
  "rounded-xl border border-mist px-5 py-2.5 text-pearl transition-colors hover:border-arcane-dim hover:bg-veil";

function harmonyLabel(score: number): string {
  if (score > 0.15) return STRINGS.HARMONY_STRONG;
  if (score < -0.15) return STRINGS.HARMONY_TENSE;
  return STRINGS.HARMONY_NEUTRAL;
}

/** Bản sao chép: câu hỏi, danh sách lá theo vị trí, rồi lời đọc. */
function readingAsText(draw: DrawResponse, intention: string | undefined, text: string): string {
  const spreadType = draw.interpretation.spread_type;
  const cards = draw.interpretation.cards
    .map((c) => {
      const orientation = c.orientation === "reversed" ? STRINGS.REVERSED : STRINGS.UPRIGHT;
      return `${c.position_index + 1}. ${positionLabel(c, spreadType)}: ${cardTitle(c)} (${orientation.toLowerCase()})`;
    })
    .join("\n");
  const header = intention ? `“${intention}”\n` : "";
  return `${header}${spreadSummary(spreadType)}\n${cards}\n\n${text.trim()}\n`;
}

function CopyButton({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      className={BUTTON_SECONDARY}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setCopied(true);
        } catch {
          // trình duyệt chặn clipboard — bỏ qua
        }
      }}
    >
      <span aria-live="polite">{copied ? `✓ ${STRINGS.COPIED}` : STRINGS.COPY}</span>
    </button>
  );
}

export default function Home() {
  const [intention, setIntention] = useState("");
  const [spreadType, setSpreadType] = useState<SpreadType>("three_card");
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { phase, request, draw, text, error, stopped, start, stop, reset } = useTarotReading();

  const cards = draw?.interpretation.cards ?? null;
  const openCard = openIndex !== null ? cards?.[openIndex] ?? null : null;
  const activeSpread = request?.spread_type ?? spreadType;

  // Lưu vào lịch sử khi lời đọc hoàn tất (kể cả khi người dùng bấm dừng)
  useEffect(() => {
    if (phase === "done" && draw) saveReading(draw, request?.intention, text);
  }, [phase, draw, request, text]);

  const handleDraw = useCallback(() => {
    setOpenIndex(null);
    window.scrollTo(0, 0);
    start({ spread_type: spreadType, intention: intention.trim() || undefined });
  }, [spreadType, intention, start]);

  const handleRetry = useCallback(() => {
    if (!request) return;
    setOpenIndex(null);
    start(request);
  }, [request, start]);

  const handleNewReading = useCallback(() => {
    reset();
    setOpenIndex(null);
    setIntention("");
    window.scrollTo(0, 0);
  }, [reset]);

  if (phase === "idle") {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <section className="pt-8 sm:pt-12 pb-8 text-center">
          <HeroFan />
          <h1 className="mt-6 font-serif text-4xl sm:text-5xl text-light tracking-tight">{STRINGS.BRAND}</h1>
          <p className="mx-auto mt-3 max-w-xl text-base sm:text-lg text-silver leading-relaxed">
            {STRINGS.HERO_SUBTITLE}
          </p>
        </section>

        <div className="space-y-8">
          <IntentionInput value={intention} onChange={setIntention} />
          <SpreadSelector selected={spreadType} onChange={setSpreadType} />
          {/* Nút rút bài luôn trong tầm tay trên màn hình thấp */}
          <div className="sticky bottom-0 z-10 -mx-4 px-4 pt-6 pb-[max(1rem,env(safe-area-inset-bottom))] bg-linear-to-t from-void from-60% to-transparent sm:-mx-6 sm:px-6">
            <DrawButton onClick={handleDraw} detail={spreadSummary(spreadType)} />
          </div>
        </div>

        <p className="py-8 text-center text-sm text-silver leading-relaxed">{STRINGS.DISCLAIMER}</p>
      </div>
    );
  }

  const isStreaming = phase === "reading";
  const intentionText = request?.intention;

  const actions =
    draw && (phase === "done" || phase === "error") ? (
      <div className="flex flex-wrap gap-3">
        {phase === "error" ? (
          <button type="button" onClick={handleRetry} className={BUTTON_PRIMARY}>
            {STRINGS.RETRY}
          </button>
        ) : (
          <button type="button" onClick={handleNewReading} className={BUTTON_PRIMARY}>
            {STRINGS.NEW_READING}
          </button>
        )}
        {text && <CopyButton getText={() => readingAsText(draw, intentionText, text)} />}
        {phase === "error" && (
          <button type="button" onClick={handleNewReading} className={BUTTON_SECONDARY}>
            {STRINGS.NEW_READING}
          </button>
        )}
        {phase === "done" && (
          <Link href="/history" className={BUTTON_SECONDARY}>
            {STRINGS.HISTORY}
          </Link>
        )}
      </div>
    ) : null;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-6 sm:pt-10 pb-12">
      <header className="mb-8 max-w-3xl">
        <p className="text-sm text-silver">{spreadSummary(activeSpread)}</p>
        <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-light leading-tight">
          {intentionText ? `“${intentionText}”` : STRINGS.RESULT_FALLBACK_TITLE}
        </h1>
        {draw && (
          <dl className="mt-3 flex flex-wrap gap-2 text-sm">
            <div className="flex gap-1.5 rounded-full border border-mist px-3 py-1">
              <dt className="text-silver">{STRINGS.DOMINANT_ELEMENT}:</dt>
              <dd className="text-light">{draw.interpretation.dominant_element_vi || draw.interpretation.dominant_element}</dd>
            </div>
            {draw.interpretation.cards.length > 1 && (
              <div className="flex gap-1.5 rounded-full border border-mist px-3 py-1">
                <dt className="text-silver">{STRINGS.HARMONY}:</dt>
                <dd className="text-light">{harmonyLabel(draw.interpretation.overall_dignity_score)}</dd>
              </div>
            )}
          </dl>
        )}
      </header>

      {error && !draw ? (
        <div role="alert" className="max-w-xl rounded-2xl border border-negative/40 bg-negative/10 p-6">
          <p className="text-light">{error}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" onClick={handleRetry} className={BUTTON_PRIMARY}>
              {STRINGS.RETRY}
            </button>
            <button type="button" onClick={handleNewReading} className={BUTTON_SECONDARY}>
              {STRINGS.BACK}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:grid-rows-[auto_1fr] lg:gap-x-14">
          <section aria-labelledby="cards-heading" className="lg:col-start-1 lg:row-start-1">
            <h2 id="cards-heading" className="sr-only">{STRINGS.CARDS_HEADING}</h2>
            <SpreadBoard
              key={draw?.session_id ?? "pending"}
              spreadType={activeSpread}
              cards={cards}
              selectedIndex={openIndex}
              onSelect={setOpenIndex}
            />
            {draw && <p className="mt-5 text-center text-sm text-silver">{STRINGS.TAP_HINT}</p>}
          </section>

          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <AIReading
              text={text}
              isWaiting={phase === "drawing"}
              isStreaming={isStreaming}
              isDone={phase === "done"}
              stopped={stopped}
              error={draw ? error : null}
              onStop={stop}
              actions={actions}
            />
          </div>

          <section aria-labelledby="legend-heading" className="lg:col-start-1 lg:row-start-2">
            <h2 id="legend-heading" className="mb-3 text-xs font-semibold uppercase tracking-wider text-silver">
              {STRINGS.LEGEND_HEADING}
            </h2>
            <SpreadLegend spreadType={activeSpread} cards={cards} onSelect={setOpenIndex} />
          </section>
        </div>
      )}

      <footer className="mt-14 border-t border-mist pt-6 text-center text-sm text-silver leading-relaxed">
        <p className="mx-auto max-w-2xl">{STRINGS.DISCLAIMER}</p>
        {draw && (
          <p className="mt-2 text-xs">
            {STRINGS.ENTROPY_SOURCE}:{" "}
            {QUANTUM_SOURCE_LABELS[draw.interpretation.quantum_source] ?? draw.interpretation.quantum_source}
          </p>
        )}
      </footer>

      <CardSheet
        open={openCard !== null}
        onClose={() => setOpenIndex(null)}
        onPrev={openIndex !== null && openIndex > 0 ? () => setOpenIndex(openIndex - 1) : undefined}
        onNext={
          openIndex !== null && cards && openIndex < cards.length - 1
            ? () => setOpenIndex(openIndex + 1)
            : undefined
        }
      >
        {openCard && draw && (
          <InterpretationPanel key={openCard.position_index} card={openCard} interpretation={draw.interpretation} />
        )}
      </CardSheet>
    </div>
  );
}
