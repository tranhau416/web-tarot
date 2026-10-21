"use client";

import BrandMark from "./components/BrandMark";
import { STRINGS } from "./lib/strings";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-void flex items-center justify-center px-4">
      <div className="bg-ink border border-mist rounded-2xl p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
        <BrandMark className="w-12 h-12 mx-auto" />
        <div>
          <h1 className="font-serif text-2xl text-light mb-2">Có gì đó không ổn</h1>
          <p className="text-silver text-sm leading-relaxed">{STRINGS.ERROR_UNKNOWN}</p>
          {error.digest && (
            <p className="text-silver text-xs font-mono mt-2">Mã lỗi: {error.digest}</p>
          )}
        </div>
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-cta hover:bg-cta-hover text-light font-medium transition-colors shadow-lg shadow-arcane/25"
        >
          {STRINGS.RETRY}
        </button>
      </div>
    </div>
  );
}
