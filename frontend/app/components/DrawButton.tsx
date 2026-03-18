interface DrawButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled?: boolean
}

export default function DrawButton({ onClick, isLoading, disabled }: DrawButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      aria-label={isLoading ? "Đang rút bài từ lượng tử" : "Rút bài từ vũ trụ"}
      className={`relative w-full max-w-sm mx-auto flex items-center justify-center gap-3
        py-3 sm:py-4 px-5 sm:px-8 rounded-2xl font-sans font-medium text-base
        transition-all duration-200 overflow-hidden
        ${isLoading || disabled
          ? "bg-arcane-dim text-pearl/60 cursor-not-allowed"
          : "bg-arcane hover:bg-glow text-light cursor-pointer shadow-lg shadow-arcane/30 hover:shadow-glow/30 hover:shadow-xl"
        }`}
    >
      {/* Glow pulse ring (idle state) */}
      {!isLoading && !disabled && (
        <span className="absolute inset-0 rounded-2xl bg-arcane animate-ping opacity-20 pointer-events-none" />
      )}

      {/* Content */}
      <span className="relative flex items-center gap-2">
        {isLoading ? (
          <>
            {/* Spinner */}
            <svg
              className="w-5 h-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Reading the Quantum Field…</span>
          </>
        ) : (
          <>
            <span className="text-lg">✦</span>
            <span>Draw from the Void</span>
          </>
        )}
      </span>
    </button>
  )
}
