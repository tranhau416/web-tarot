"use client";

import { Fragment, useEffect, useRef, type ReactNode } from "react";

interface AIReadingProps {
  text: string;
  /** Đang chờ draw_result (chưa có lá bài) */
  isWaiting: boolean;
  /** Đang nhận token */
  isStreaming: boolean;
  isDone: boolean;
  error: string | null;
}

/** Inline markdown tối giản: **đậm** và *nghiêng*. */
function renderInline(line: string): ReactNode[] {
  return line.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i} className="text-light font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i} className="text-glow">{part.slice(1, -1)}</em>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

/** Block markdown tối giản: tiêu đề (#, hoặc dòng chỉ có **...**), gạch đầu dòng, đoạn văn. */
function renderReading(text: string): ReactNode[] {
  const blocks: ReactNode[] = [];
  let bullets: string[] = [];

  const flushBullets = () => {
    if (bullets.length === 0) return;
    const items = bullets;
    bullets = [];
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-none space-y-2 pl-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-arcane select-none">✦</span>
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>,
    );
  };

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      continue;
    }

    const heading = line.match(/^#{1,4}\s+(.*)$/) ?? line.match(/^\*\*([^*]+)\*\*:?$/);
    if (heading) {
      flushBullets();
      blocks.push(
        <h3 key={`h-${blocks.length}`} className="font-serif text-xl text-pearl pt-2">
          {heading[1].replace(/\*\*/g, "")}
        </h3>,
      );
      continue;
    }

    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (bullet) {
      bullets.push(bullet[1]);
      continue;
    }

    flushBullets();
    blocks.push(<p key={`p-${blocks.length}`}>{renderInline(line)}</p>);
  }
  flushBullets();
  return blocks;
}

export default function AIReading({ text, isWaiting, isStreaming, isDone, error }: AIReadingProps) {
  const endRef = useRef<HTMLDivElement>(null);

  // Auto-scroll theo nội dung mới khi đang stream — chỉ khi người đọc đang ở
  // gần cuối lời đọc, để không kéo trang đi khi họ đang xem lá bài phía trên.
  useEffect(() => {
    const end = endRef.current;
    if (!isStreaming || !end) return;
    const distanceBelowViewport = end.getBoundingClientRect().top - window.innerHeight;
    if (distanceBelowViewport < 160) {
      end.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [text, isStreaming]);

  if (isWaiting) {
    return (
      <div className="space-y-4 py-6" aria-live="polite">
        <div className="space-y-3">
          <div className="h-4 bg-mist/40 rounded animate-pulse w-full" />
          <div className="h-4 bg-mist/40 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-mist/40 rounded animate-pulse w-4/6" />
        </div>
        <div className="flex items-center justify-center gap-3 pt-4">
          <span className="animate-pulse text-xl">✦</span>
          <span className="text-silver font-serif text-base">
            Đang rút bài và kết nối với vũ trụ
            <span className="inline-flex gap-0.5 ml-1">
              <span className="animate-bounce" style={{ animationDelay: "0ms" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "150ms" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "300ms" }}>.</span>
            </span>
          </span>
          <span className="animate-pulse text-xl">✦</span>
        </div>
      </div>
    );
  }

  // Lỗi trước khi có nội dung: để page hiển thị thông báo lỗi chung
  if (error && !text) return null;

  return (
    <section className="mt-8" aria-live="polite" aria-busy={isStreaming}>
      <h2 className="text-2xl font-serif text-pearl mb-4 flex items-center gap-2">
        <span className="text-glow">✦</span>
        Lời Đọc Bài
        {isStreaming && (
          <span className="text-base text-silver font-sans animate-pulse ml-2">
            đang đọc…
          </span>
        )}
      </h2>

      <div
        className="rounded-lg border border-mist bg-ink/60 p-4 sm:p-6 font-serif text-lg text-pearl leading-loose space-y-3"
        style={{ minHeight: "8rem" }}
      >
        {renderReading(text)}
        {isStreaming && (
          <span className="inline-block w-0.5 h-5 bg-glow ml-0.5 align-middle animate-pulse" />
        )}
        {isStreaming && !text && (
          <p className="text-silver italic text-base">Các lá bài đang thì thầm…</p>
        )}
        {isDone && !text && (
          <div className="flex flex-col items-center gap-3 text-silver py-4">
            <span className="text-3xl select-none">✦</span>
            <p className="italic text-base text-center">
              Vũ trụ im lặng lần này. Hãy thử lại với một câu hỏi khác.
            </p>
          </div>
        )}
        {error && (
          <p className="text-red-400 text-base font-sans border-t border-red-500/30 pt-3">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </div>
    </section>
  );
}
