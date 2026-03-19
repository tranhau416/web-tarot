"use client"

interface DrawButtonProps {
  onClick: () => void
  isLoading: boolean
  disabled?: boolean
}

export default function DrawButton({ onClick, isLoading, disabled }: DrawButtonProps) {
  const isActive = !isLoading && !disabled

  return (
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading || disabled}
        aria-busy={isLoading}
        aria-label={isLoading ? "Communing with the oracle" : "Invoke the tarot reading"}
        className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center
          transition-[box-shadow,background,transform] duration-300 cursor-pointer group
          ${isActive ? "hover:scale-105 active:scale-95" : "cursor-not-allowed opacity-60"}`}
        style={isActive ? {
          background: "radial-gradient(circle, rgba(124,111,205,0.22) 0%, rgba(232,160,69,0.06) 50%, rgba(6,6,15,1) 75%)",
          boxShadow: "0 0 0 1px rgba(232,160,69,0.5), 0 0 50px rgba(124,111,205,0.35), 0 0 90px rgba(124,111,205,0.12)",
        } : {
          background: "radial-gradient(circle, rgba(74,69,128,0.1) 0%, rgba(6,6,15,1) 70%)",
          boxShadow: "0 0 0 1px rgba(74,69,128,0.3)",
        }}
      >
        {/* Outer rotating ring */}
        <svg
          className={`seal-rotate-svg absolute inset-0 w-full h-full ${isLoading ? "animate-[sealRotate_3s_linear_infinite]" : isActive ? "animate-[sealRotate_20s_linear_infinite] group-hover:animate-[sealRotate_6s_linear_infinite]" : ""}`}
          viewBox="0 0 200 200"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="100" cy="100" r="92"
            stroke={isActive ? "rgba(232,160,69,0.55)" : "rgba(74,69,128,0.35)"}
            strokeWidth="1"
            strokeDasharray="5 7"
            strokeLinecap="round"
          />
          <circle
            cx="100" cy="100" r="82"
            stroke={isActive ? "rgba(124,111,205,0.3)" : "rgba(74,69,128,0.18)"}
            strokeWidth="0.5"
            strokeDasharray="2 14"
          />
          {/* Octagram tick marks */}
          {isActive && [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
            const rad = (deg * Math.PI) / 180
            const x1 = 100 + 87 * Math.cos(rad)
            const y1 = 100 + 87 * Math.sin(rad)
            const x2 = 100 + 80 * Math.cos(rad)
            const y2 = 100 + 80 * Math.sin(rad)
            return (
              <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(232,160,69,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            )
          })}
        </svg>

        {/* Inner eye sigil */}
        <div className="relative z-10 flex flex-col items-center gap-1">
          {isLoading ? (
            <svg className="w-12 h-12 animate-spin text-arcane" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="40" strokeDashoffset="20"/>
            </svg>
          ) : (
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-[color] duration-300 ${isActive ? "text-flame group-hover:text-parchment animate-sigil-pulse" : "text-arcane-dim"}`}
              aria-hidden="true"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
            </svg>
          )}
        </div>
        {/* INVOKE label */}
        <span
          className={`font-cinzel text-xs tracking-[0.35em] uppercase transition-colors duration-200
            ${isLoading ? "text-silver/50" : isActive ? "text-silver/80 group-hover:text-parchment" : "text-silver/40"}`}
        >
          {isLoading ? "Communing…" : "Invoke"}
        </span>
      </button>
  )
}
