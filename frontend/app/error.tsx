"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center px-4">
      <div className="bg-ink border border-mist rounded-2xl p-8 max-w-md w-full text-center space-y-6 animate-fade-in">
        <div className="text-5xl select-none">⚠️</div>
        <div>
          <h2 className="font-serif text-2xl text-light mb-2">
            Something went wrong
          </h2>
          <p className="text-silver text-sm font-sans leading-relaxed">
            {error.message || "An unexpected error occurred in the sacred space."}
          </p>
          {error.digest && (
            <p className="text-silver/50 text-xs font-mono mt-2">
              Error ID: {error.digest}
            </p>
          )}
        </div>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-xl bg-arcane hover:bg-glow text-light font-sans font-medium transition-all duration-200 shadow-lg shadow-arcane/25"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
