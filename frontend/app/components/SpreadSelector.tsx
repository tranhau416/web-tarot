import SpreadDiagram from "@/app/components/SpreadDiagram"
import { SPREADS } from "@/app/lib/constants"
import { STRINGS } from "@/app/lib/strings"
import type { SpreadType } from "@/app/lib/types"

interface SpreadSelectorProps {
  selected: SpreadType
  onChange: (type: SpreadType) => void
}

/** Nhóm radio gốc (phím mũi tên hoạt động sẵn), mỗi lựa chọn có sơ đồ bố cục lá. */
export default function SpreadSelector({ selected, onChange }: SpreadSelectorProps) {
  return (
    <fieldset>
      <legend className="text-pearl text-sm font-medium mb-2">{STRINGS.SPREAD_LABEL}</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SPREADS.map((spread) => {
          const isSelected = selected === spread.type
          const count = spread.positions.length
          return (
            <label key={spread.type} className="relative cursor-pointer">
              <input
                type="radio"
                name="spread"
                value={spread.type}
                checked={isSelected}
                onChange={() => onChange(spread.type)}
                className="peer sr-only"
              />
              <span
                className={`flex h-full flex-col items-center gap-1.5 rounded-xl border p-3 sm:p-4 text-center transition-colors
                  peer-focus-visible:ring-2 peer-focus-visible:ring-glow peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-void
                  ${isSelected
                    ? "border-arcane bg-arcane/15"
                    : "border-mist bg-ink hover:border-arcane-dim hover:bg-veil"
                  }`}
              >
                <SpreadDiagram
                  type={spread.type}
                  className={`h-11 mb-1 ${isSelected ? "text-gold" : "text-silver"}`}
                />
                <span className={`font-semibold text-base ${isSelected ? "text-light" : "text-pearl"}`}>
                  {spread.name}
                </span>
                <span className={`text-xs font-mono ${isSelected ? "text-pearl" : "text-silver"}`}>
                  {count} lá
                </span>
                <span className="text-sm text-silver leading-snug">{spread.description}</span>
              </span>
              {isSelected && (
                <span aria-hidden="true" className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gold" />
              )}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
