"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import AIReading from "@/app/components/AIReading";
import CardSheet from "@/app/components/CardSheet";
import DrawButton from "@/app/components/DrawButton";
import HeroFan from "@/app/components/HeroFan";
import IntentionInput from "@/app/components/IntentionInput";
import InterpretationPanel from "@/app/components/InterpretationPanel";
import SpreadBoard, {
  SpreadCaptions,
  SpreadLegend,
  cardTitle,
  isRowSpread,
  positionLabel,
} from "@/app/components/SpreadBoard";
import SpreadSelector from "@/app/components/SpreadSelector";
import { QUANTUM_SOURCE_LABELS, SPREADS_BY_TYPE, spreadSummary } from "@/app/lib/constants";
import { saveReading } from "@/app/lib/history";
import { STRINGS } from "@/app/lib/strings";
import { DESKTOP_QUERY, useMediaQuery } from "@/app/lib/useMediaQuery";
import { useTarotReading } from "@/app/lib/useTarotReading";
import type { DrawResponse, SpreadType } from "@/app/lib/types";

const PIXEL_BUTTON =
  "pixel:border-2 pixel:border-mist pixel:pixel-shadow-sm pixel:active:translate-x-0.5 pixel:active:translate-y-0.5 pixel:active:shadow-none";
const BUTTON_PRIMARY =
  `ui-font inline-flex h-12 items-center justify-center rounded-xl bg-gold px-5 text-base font-semibold text-on-gold transition-colors hover:bg-gold-soft ${PIXEL_BUTTON}`;
const BUTTON_SECONDARY =
  `ui-font inline-flex h-12 items-center justify-center rounded-xl border border-mist bg-transparent px-5 text-base font-medium text-light transition-colors hover:bg-veil pixel:bg-ink ${PIXEL_BUTTON}`;

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });

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

function CopyButton({ getText, label, className }: { getText: () => string; label: string; className: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(getText());
          setCopied(true);
        } catch {
          // trình duyệt chặn clipboard — bỏ qua
        }
      }}
    >
      <span aria-live="polite">{copied ? `✓ ${STRINGS.COPIED}` : label}</span>
    </button>
  );
}

export default function Home() {
  const [intention, setIntention] = useState("");
  const [spreadType, setSpreadType] = useState<SpreadType>("three_card");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const { phase, request, draw, text, error, stopped, start, stop, reset } = useTarotReading();
  // Desktop: chi tiết lá hiện ngay dưới bàn trải. Điện thoại: mở bảng trượt từ dưới lên.
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  const cards = draw?.interpretation.cards ?? null;
  const activeSpread = request?.spread_type ?? spreadType;
  // Desktop luôn có một lá đang xem (mặc định lá đầu); điện thoại chỉ khi bảng chi tiết mở
  const detailIndex = isDesktop ? selectedIndex ?? 0 : sheetOpen ? selectedIndex : null;
  const detailCard = detailIndex !== null ? cards?.[detailIndex] ?? null : null;

  // Lưu vào lịch sử khi lời đọc hoàn tất (kể cả khi người dùng bấm dừng)
  useEffect(() => {
    if (phase === "done" && draw) saveReading(draw, request?.intention, text);
  }, [phase, draw, request, text]);

  const selectCard = useCallback(
    (index: number) => {
      setSelectedIndex(index);
      if (!isDesktop) setSheetOpen(true);
    },
    [isDesktop],
  );

  const handleDraw = useCallback(() => {
    setSelectedIndex(null);
    setSheetOpen(false);
    setStartedAt(new Date());
    window.scrollTo(0, 0);
    start({ spread_type: spreadType, intention: intention.trim() || undefined });
  }, [spreadType, intention, start]);

  const handleRetry = useCallback(() => {
    if (!request) return;
    setSelectedIndex(null);
    setSheetOpen(false);
    setStartedAt(new Date());
    start(request);
  }, [request, start]);

  const handleNewReading = useCallback(() => {
    reset();
    setSelectedIndex(null);
    setSheetOpen(false);
    setIntention("");
    window.scrollTo(0, 0);
  }, [reset]);

  if (phase === "idle") {
    return (
      <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-6 sm:pt-12 pb-10">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 lg:items-start">
          <HeroFan />

          <section className="flex min-w-0 flex-col gap-7 lg:order-first">
            <div className="flex flex-col gap-3 sm:gap-4">
              <p className="hidden sm:flex items-center gap-2.5 text-[15px] font-medium text-pearl">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold" />
                {STRINGS.HERO_EYEBROW}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[60px] font-medium leading-[1.1] text-light">
                {STRINGS.HERO_TITLE}
              </h1>
              <p className="max-w-[34em] text-base sm:text-[19px] leading-relaxed text-pearl">
                {STRINGS.HERO_SUBTITLE}
              </p>
            </div>

            <div className="flex flex-col gap-6 sm:rounded-[20px] sm:border sm:border-mist sm:bg-ink sm:p-7 sm:pixel:pixel-shadow">
              <IntentionInput value={intention} onChange={setIntention} />
              <SpreadSelector selected={spreadType} onChange={setSpreadType} />
              {/* Nút rút bài luôn trong tầm tay trên điện thoại */}
              <div className="sticky bottom-0 z-10 -mx-5 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]
                bg-linear-to-t from-void from-70% to-transparent
                sm:-mx-7 sm:px-7 sm:-mb-7 sm:pb-7 sm:rounded-b-[20px] sm:from-ink">
                <DrawButton onClick={handleDraw} detail={SPREADS_BY_TYPE[spreadType].name} />
              </div>
            </div>
          </section>
        </div>

        <p className="mt-10 border-t border-veil pt-6 text-sm leading-relaxed text-silver">{STRINGS.DISCLAIMER}</p>
      </div>
    );
  }

  const isStreaming = phase === "reading";
  const finished = Boolean(draw) && (phase === "done" || phase === "error");
  const intentionText = request?.intention;
  const rowSpread = isRowSpread(activeSpread);
  const copyText = () => (draw ? readingAsText(draw, intentionText, text) : "");

  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-8 pt-6 sm:pt-12 pb-32 lg:pb-14">
      <header className="mb-8 sm:mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="flex min-w-0 flex-[1_1_560px] flex-col gap-3">
          <p className="text-sm sm:text-[15px] text-silver">
            {spreadSummary(activeSpread)}
            {startedAt && ` · ${DATE_FORMAT.format(startedAt)}`}
          </p>
          <h1 className="max-w-[22em] font-display text-[28px] sm:text-[44px] font-medium leading-[1.15] text-light">
            {intentionText ? `“${intentionText}”` : STRINGS.RESULT_FALLBACK_TITLE}
          </h1>
          {draw && (
            <dl className="flex flex-wrap gap-2 text-sm sm:text-[15px]">
              <div className="flex gap-2 rounded-full border border-mist bg-ink px-3.5 py-1.5">
                <dt className="text-pearl">{STRINGS.DOMINANT_ELEMENT}</dt>
                <dd className="font-semibold text-light">
                  {draw.interpretation.dominant_element_vi || draw.interpretation.dominant_element}
                </dd>
              </div>
              {draw.interpretation.cards.length > 1 && (
                <div className="flex gap-2 rounded-full border border-mist bg-ink px-3.5 py-1.5">
                  <dt className="text-pearl">{STRINGS.HARMONY}</dt>
                  <dd className="font-semibold text-light">{harmonyLabel(draw.interpretation.overall_dignity_score)}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
        {finished && phase === "done" && (
          <div className="hidden lg:flex gap-3">
            <CopyButton getText={copyText} label={STRINGS.COPY} className={BUTTON_SECONDARY} />
            <button type="button" onClick={handleNewReading} className={BUTTON_PRIMARY}>
              {STRINGS.NEW_READING}
            </button>
          </div>
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
        <div className="flex flex-wrap items-start gap-10 lg:gap-12">
          <section
            aria-labelledby="cards-heading"
            className="flex min-w-0 flex-[1_1_440px] max-w-full lg:max-w-[520px] flex-col gap-5 sm:gap-6
              lg:rounded-3xl lg:border lg:border-mist lg:bg-ink lg:p-7 lg:pixel:pixel-shadow"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="cards-heading" className="sr-only lg:not-sr-only text-lg font-semibold text-light">
                {STRINGS.CARDS_HEADING}
              </h2>
              {draw && <p className="hidden lg:block text-sm text-silver">{STRINGS.TAP_HINT}</p>}
            </div>

            <SpreadBoard
              key={draw?.session_id ?? "pending"}
              spreadType={activeSpread}
              cards={cards}
              selectedIndex={detailIndex}
              opensDialog={!isDesktop}
              onSelect={selectCard}
            />

            {rowSpread ? (
              <SpreadCaptions spreadType={activeSpread} cards={cards} />
            ) : (
              <SpreadLegend
                spreadType={activeSpread}
                cards={cards}
                selectedIndex={detailIndex}
                opensDialog={!isDesktop}
                onSelect={selectCard}
              />
            )}

            {draw && <p className="text-center text-sm text-pearl lg:hidden">{STRINGS.TAP_HINT}</p>}

            {isDesktop && detailCard && draw && (
              <div className="border-t border-mist pt-6">
                <InterpretationPanel
                  key={detailCard.position_index}
                  card={detailCard}
                  interpretation={draw.interpretation}
                  variant="inline"
                />
              </div>
            )}
          </section>

          <div className="min-w-0 flex-[999_1_560px]">
            <AIReading
              text={text}
              isWaiting={phase === "drawing"}
              isStreaming={isStreaming}
              isDone={phase === "done"}
              stopped={stopped}
              error={draw ? error : null}
              onStop={stop}
              actions={
                finished ? (
                  <div className="hidden lg:flex flex-wrap gap-3">
                    {phase === "error" ? (
                      <button type="button" onClick={handleRetry} className={BUTTON_PRIMARY}>
                        {STRINGS.RETRY}
                      </button>
                    ) : (
                      <button type="button" onClick={handleNewReading} className={BUTTON_PRIMARY}>
                        {STRINGS.NEW_READING}
                      </button>
                    )}
                    {text && <CopyButton getText={copyText} label={STRINGS.COPY} className={BUTTON_SECONDARY} />}
                    {phase === "error" ? (
                      <button type="button" onClick={handleNewReading} className={BUTTON_SECONDARY}>
                        {STRINGS.NEW_READING}
                      </button>
                    ) : (
                      <Link href="/history" className={BUTTON_SECONDARY}>
                        {STRINGS.HISTORY}
                      </Link>
                    )}
                  </div>
                ) : null
              }
            />
          </div>
        </div>
      )}

      <footer className="mt-14 flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-veil pt-6 text-sm leading-relaxed text-silver">
        <p className="max-w-[60em]">{STRINGS.DISCLAIMER}</p>
        {draw && (
          <p>
            {STRINGS.ENTROPY_SOURCE}:{" "}
            {QUANTUM_SOURCE_LABELS[draw.interpretation.quantum_source] ?? draw.interpretation.quantum_source}
          </p>
        )}
      </footer>

      {/* Điện thoại: hành động cuối lời đọc luôn ở đáy màn hình */}
      {finished && (
        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2.5 border-t border-veil bg-void/95 px-5 pt-3.5
          pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm lg:hidden"
        >
          {phase === "error" ? (
            <button type="button" onClick={handleRetry} className={`${BUTTON_SECONDARY} flex-1`}>
              {STRINGS.RETRY}
            </button>
          ) : (
            text && <CopyButton getText={copyText} label={STRINGS.COPY_SHORT} className={`${BUTTON_SECONDARY} flex-1`} />
          )}
          <button type="button" onClick={handleNewReading} className={`${BUTTON_PRIMARY} flex-1`}>
            {STRINGS.NEW_READING}
          </button>
        </div>
      )}

      <CardSheet
        open={!isDesktop && sheetOpen && detailCard !== null}
        onClose={() => setSheetOpen(false)}
        onPrev={detailIndex !== null && detailIndex > 0 ? () => setSelectedIndex(detailIndex - 1) : undefined}
        onNext={
          detailIndex !== null && cards && detailIndex < cards.length - 1
            ? () => setSelectedIndex(detailIndex + 1)
            : undefined
        }
      >
        {!isDesktop && detailCard && draw && (
          <InterpretationPanel key={detailCard.position_index} card={detailCard} interpretation={draw.interpretation} />
        )}
      </CardSheet>
    </div>
  );
}
