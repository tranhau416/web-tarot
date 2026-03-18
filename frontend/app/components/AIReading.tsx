"use client";

import { useEffect, useRef, useState } from "react";
import { streamAIReading } from "@/app/lib/api";
import type { DrawRequest, InterpretationResult } from "@/app/lib/types";

interface AIReadingProps {
  drawRequest: DrawRequest;
  onDrawResult: (result: { session_id: string; interpretation: InterpretationResult; disclaimer: string }) => void;
}

export default function AIReading({ drawRequest, onDrawResult }: AIReadingProps) {
  const [streamedText, setStreamedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);
  const hasStarted = useRef(false);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    async function run() {
      try {
        for await (const event of streamAIReading(drawRequest)) {
          if (event.type === "draw_result") {
            onDrawResult({
              session_id: event.session_id,
              interpretation: event.interpretation,
              disclaimer: event.disclaimer,
            });
            setIsLoading(false);
            setIsStreaming(true);
          } else if (event.type === "token") {
            setStreamedText((prev) => prev + event.text);
          } else if (event.type === "done") {
            setIsStreaming(false);
            setIsDone(true);
          } else if (event.type === "error") {
            setError(event.message);
            setIsLoading(false);
            setIsStreaming(false);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.");
        setIsLoading(false);
        setIsStreaming(false);
      }
    }

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when streaming new content
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [streamedText, isStreaming]);

  if (isLoading) {
    return (
      <div className="space-y-4 py-6">
        {/* Shimmer skeleton lines */}
        <div className="space-y-3">
          <div className="h-4 bg-mist/40 rounded animate-pulse w-full" />
          <div className="h-4 bg-mist/40 rounded animate-pulse w-5/6" />
          <div className="h-4 bg-mist/40 rounded animate-pulse w-4/6" />
        </div>
        {/* Loading message */}
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

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/50 bg-red-900/10 p-6 text-center">
        <p className="text-red-400 font-serif">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
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
        ref={scrollRef}
        className="rounded-lg border border-mist bg-ink/60 p-6 font-serif text-lg text-pearl leading-loose whitespace-pre-wrap"
        style={{ minHeight: "8rem" }}
      >
        {streamedText}
        {isStreaming && (
          <span
            ref={cursorRef}
            className="inline-block w-0.5 h-5 bg-glow ml-0.5 align-middle animate-pulse"
          />
        )}
        {isDone && !streamedText && (
          <div className="flex flex-col items-center gap-3 text-silver py-4">
            <span className="text-3xl select-none">✦</span>
            <p className="italic text-base text-center">
              Vũ trụ im lặng lần này. Hãy thử lại với một câu hỏi khác.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
