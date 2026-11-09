import type { CSSProperties } from "react"

const PETALS = Array.from({ length: 12 }, (_, i) => i * 30)

/** Hoa cúc hoạ mi 12 cánh — biểu tượng của giao diện Cúc hoạ mi. */
export default function Daisy({ className = "", edge = "#9CBF7A", style }: { className?: string; edge?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 32 32" className={className} style={style} aria-hidden="true">
      <g fill="#FFFFFF" stroke={edge} strokeWidth="0.9">
        {PETALS.map((deg) => (
          <ellipse key={deg} cx="16" cy="8.2" rx="2.7" ry="6.6" transform={`rotate(${deg} 16 16)`} />
        ))}
      </g>
      <circle cx="16" cy="16" r="4.6" fill="#FFC72C" stroke="#E0A400" strokeWidth="0.9" />
    </svg>
  )
}
