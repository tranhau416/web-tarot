"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import ReadingText from "@/app/components/ReadingText";
import { STORAGE_KEYS, spreadSummary } from "@/app/lib/constants";
import { clearHistory, parseHistory, type HistoryEntry } from "@/app/lib/history";
import { STRINGS } from "@/app/lib/strings";

const HISTORY_EVENT = "tarot-history-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(HISTORY_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(HISTORY_EVENT, onChange);
  };
}

/** Chuỗi thô (so sánh theo giá trị) để useSyncExternalStore không render lặp. */
function readRaw(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.HISTORY) ?? "[]";
  } catch {
    return "[]";
  }
}

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" });

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  return (
    <article className="rounded-[20px] border border-mist bg-ink p-5 sm:p-7">
      <p className="text-sm text-silver">
        <time dateTime={entry.createdAt}>{DATE_FORMAT.format(new Date(entry.createdAt))}</time>
        {" · "}
        {spreadSummary(entry.spreadType)}
      </p>
      <h2 className="mt-1 font-display text-[22px] sm:text-[26px] font-medium leading-snug text-light">
        {entry.intention ? `“${entry.intention}”` : STRINGS.HISTORY_NO_QUESTION}
      </h2>

      <ul className="mt-5 flex flex-wrap gap-3">
        {entry.cards.map((card, i) => {
          const reversed = card.orientation === "reversed";
          return (
            <li key={i} className="w-[72px] text-center">
              <div className="relative mx-auto aspect-[3/5] w-full overflow-hidden rounded-lg border border-mist bg-veil">
                {card.image_url && (
                  <Image
                    src={card.image_url}
                    alt=""
                    fill
                    unoptimized
                    sizes="64px"
                    className={`object-cover ${reversed ? "rotate-180" : ""}`}
                  />
                )}
              </div>
              <p className="mt-1.5 text-[13px] leading-tight text-light">{card.name_vi || card.name}</p>
              <p className={`mt-0.5 text-[13px] leading-tight ${reversed ? "text-reversed" : "text-upright"}`}>
                {reversed ? STRINGS.REVERSED : STRINGS.UPRIGHT}
              </p>
            </li>
          );
        })}
      </ul>

      <details className="group mt-5">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-[15px] font-medium text-gold hover:text-gold-soft">
          <span className="group-open:hidden">{STRINGS.HISTORY_SHOW}</span>
          <span className="hidden group-open:inline">{STRINGS.HISTORY_HIDE}</span>
        </summary>
        <div className="mt-4">
          <ReadingText text={entry.text} />
        </div>
      </details>
    </article>
  );
}

export default function HistoryPage() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const entries = useMemo(() => (raw === null ? null : parseHistory(raw)), [raw]);
  const [confirming, setConfirming] = useState(false);

  const handleClear = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    clearHistory();
    window.dispatchEvent(new Event(HISTORY_EVENT));
    setConfirming(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-5 sm:px-8 pt-8 sm:pt-12 pb-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[32px] sm:text-[44px] font-medium leading-tight text-light">{STRINGS.HISTORY_TITLE}</h1>
          <p className="mt-2 text-base text-pearl">{STRINGS.HISTORY_SUBTITLE}</p>
        </div>
        {entries && entries.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            onBlur={() => setConfirming(false)}
            className={`inline-flex min-h-11 items-center rounded-[10px] border px-4 text-[15px] font-medium transition-colors
              ${confirming ? "border-negative/60 text-light bg-negative/15" : "border-mist text-light hover:bg-veil"}`}
          >
            {confirming ? STRINGS.HISTORY_CONFIRM_CLEAR : STRINGS.HISTORY_CLEAR}
          </button>
        )}
      </div>

      {entries && entries.length === 0 && (
        <div className="rounded-[20px] border border-mist bg-ink p-8 text-center">
          <p className="text-read">{STRINGS.HISTORY_EMPTY}</p>
          <Link
            href="/"
            className="mt-5 inline-flex h-12 items-center rounded-xl bg-gold px-5 font-semibold text-on-gold transition-colors hover:bg-gold-soft"
          >
            {STRINGS.DRAW}
          </Link>
        </div>
      )}

      {entries && entries.length > 0 && (
        <div className="space-y-5">
          {entries.map((entry) => (
            <HistoryItem key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
