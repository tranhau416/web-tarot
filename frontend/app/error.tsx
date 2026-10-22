"use client";

import BrandMark from "./components/BrandMark";
import { STRINGS } from "./lib/strings";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-void flex items-center justify-center px-4">
      <div className="bg-ink border border-mist rounded-[20px] p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
        <BrandMark className="w-12 h-12 mx-auto" />
        <div>
          <h1 className="font-display text-3xl font-medium text-light mb-2">Có gì đó không ổn</h1>
          <p className="text-pearl text-base leading-relaxed">{STRINGS.ERROR_UNKNOWN}</p>
          {error.digest && (
            <p className="text-silver text-sm tabular-nums mt-2">Mã lỗi: {error.digest}</p>
          )}
        </div>
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-12 items-center px-6 rounded-xl bg-gold hover:bg-gold-soft text-on-gold font-semibold transition-colors"
        >
          {STRINGS.RETRY}
        </button>
      </div>
    </div>
  );
}
