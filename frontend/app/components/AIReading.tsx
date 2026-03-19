"use client";

import { useEffect, useRef, useState } from "react";
import { streamAIReading } from "@/app/lib/api";
import type { DrawRequest, InterpretationResult } from "@/app/lib/types";

interface AIReadingProps {
  drawRequest: DrawRequest;
  onDrawResult: (result: { session_id: string; interpretation: InterpretationResult; disclaimer: string }) => void;
  initialText?: string;
  skipFetch?: boolean;
  onStreamComplete?: (text: string) => void;
}

export default function AIReading({ drawRequest, onDrawResult, initialText, skipFetch, onStreamComplete }: AIReadingProps) {
  const [streamedText, setStreamedText] = useState(initialText ?? "");
  const [isLoading, setIsLoading] = useState(skipFetch ? false : true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(skipFetch ? true : false);
  const [hasContent, setHasContent] = useState(skipFetch ? !!(initialText) : false);
  const hasStarted = useRef(false);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingTokens = useRef<string>("");
  const rafHandle = useRef<number | null>(null);

  useEffect(() => {
    if (hasStarted.current || skipFetch) return;
    hasStarted.current = true;
    const controller = new AbortController();

    async function run() {
      try {
        for await (const event of streamAIReading(drawRequest, controller.signal)) {
          if (event.type === "draw_result") {
            onDrawResult({
              session_id: event.session_id,
              interpretation: event.interpretation,
              disclaimer: event.disclaimer,
            });
            setIsLoading(false);
            setIsStreaming(true);
          } else if (event.type === "token") {
            if (!hasContent) setHasContent(true);
            pendingTokens.current += event.text;
            if (rafHandle.current === null) {
              rafHandle.current = requestAnimationFrame(() => {
                setStreamedText((prev) => prev + pendingTokens.current);
                pendingTokens.current = "";
                rafHandle.current = null;
              });
            }
          } else if (event.type === "done") {
            if (rafHandle.current !== null) {
              cancelAnimationFrame(rafHandle.current);
              rafHandle.current = null;
            }
            if (pendingTokens.current) {
              setStreamedText((prev) => prev + pendingTokens.current);
              pendingTokens.current = "";
            }
            setIsStreaming(false);
            setIsDone(true);
          } else if (event.type === "error") {
            setError(event.message);
            setIsLoading(false);
            setIsStreaming(false);
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setIsLoading(false);
        setIsStreaming(false);
      }
    }

    run();
    return () => {
      controller.abort();
      if (rafHandle.current !== null) cancelAnimationFrame(rafHandle.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to bottom when streaming new content
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [streamedText, isStreaming]);

  // Notify parent when streaming is complete
  useEffect(() => {
    if (isDone && onStreamComplete && streamedText) {
      onStreamComplete(streamedText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone]);

  if (isLoading) {
    return (
      <div
        className="rounded-b-2xl rounded-tr-2xl border border-mist bg-abyss overflow-hidden"
        style={{ borderTopColor: "rgba(232,160,69,0.4)", borderTopWidth: "3px" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-3 border-b border-mist/50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-flame/60" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span className="text-phase">THE ORACLE SPEAKS</span>
        </div>

        {/* Loading skeleton */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-3" aria-hidden="true">
            <div className="h-4 bg-wax/20 rounded animate-pulse w-full" />
            <div className="h-4 bg-wax/20 rounded animate-pulse w-5/6" />
            <div className="h-4 bg-wax/20 rounded animate-pulse w-4/6" />
          </div>
          {/* Loading message — live region so AT users hear the loading state */}
          <div className="flex items-center justify-center pt-4" role="status" aria-live="polite" aria-atomic="true">
            <span className="font-serif italic text-silver text-base animate-pulse">
              The oracle is reading the quantum field…
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-b-2xl rounded-tr-2xl border border-mist bg-abyss overflow-hidden"
        style={{ borderTopColor: "rgba(232,160,69,0.4)", borderTopWidth: "3px" }}
      >
        <div className="flex items-center gap-2 px-6 pt-5 pb-3 border-b border-mist/50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-flame/60" aria-hidden="true">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <span className="text-phase">THE ORACLE SPEAKS</span>
        </div>
        <div className="px-6 py-5">
          <div className="border border-crimson/40 bg-crimson/5 rounded-xl px-6 py-5 text-center" role="alert">
            <p className="font-serif italic text-crimson-glow">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-b-2xl rounded-tr-2xl border border-mist bg-abyss overflow-hidden"
      style={{ borderTopColor: "rgba(232,160,69,0.4)", borderTopWidth: "3px" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-6 pt-5 pb-3 border-b border-mist/50">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-flame/60" aria-hidden="true">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <span className="text-phase">THE ORACLE SPEAKS</span>
        {isStreaming && (
          <span className="font-serif italic text-sm text-silver/60 ml-auto animate-pulse">
            inscribing…
          </span>
        )}
      </div>

      {/* Streaming text area */}
      <div
        ref={scrollRef}
        className={`px-6 py-5 font-serif text-lg text-light leading-[1.9] whitespace-pre-wrap
          ${hasContent ? "animate-scroll-unfurl" : ""}`}
        style={{ minHeight: "8rem" }}
        aria-live="polite"
        aria-busy={isStreaming}
        aria-atomic="true"
        aria-label="Oracle reading"
      >
        {streamedText}
        {isStreaming && (
          <span
            ref={cursorRef}
            className="inline-block w-px h-5 bg-flame ml-0.5 align-middle animate-pulse"
            aria-hidden="true"
          />
        )}
        {isDone && !streamedText && (
          <div className="font-serif italic text-silver/70 text-center py-6">
            The cosmos speaks in silence. Seek again with a new question.
          </div>
        )}
      </div>
    </div>
  );
}
