import { CARD_H, CARD_W, SPREAD_LAYOUTS } from "@/app/lib/spreadLayouts"
import type { SpreadType } from "@/app/lib/types"

/** Sơ đồ thu nhỏ của một kiểu trải bài — cùng hình học với bàn trải thật. */
export default function SpreadDiagram({ type, className = "h-12" }: { type: SpreadType; className?: string }) {
  const layout = SPREAD_LAYOUTS[type]
  const pad = 0.15
  return (
    <svg
      viewBox={`${-pad} ${-pad} ${layout.width + pad * 2} ${layout.height + pad * 2}`}
      className={className}
      aria-hidden="true"
    >
      {layout.slots.map((slot, i) => {
        const cx = slot.x + CARD_W / 2
        const cy = slot.y + CARD_H / 2
        return (
          <rect
            key={i}
            x={slot.x}
            y={slot.y}
            width={CARD_W}
            height={CARD_H}
            rx={0.12}
            transform={slot.crossing ? `rotate(90 ${cx} ${cy})` : undefined}
            className="fill-current"
            fillOpacity={slot.crossing ? 0.95 : 0.55}
            stroke="currentColor"
            strokeWidth={0.06}
          />
        )
      })}
    </svg>
  )
}
