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
    <fieldset className="min-w-0">
      <legend className="mb-3 text-base font-semibold text-light">{STRINGS.SPREAD_LABEL}</legend>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {SPREADS.map((spread) => {
          const isSelected = selected === spread.type
          return (
            <label key={spread.type} className="cursor-pointer">
              <input
                type="radio"
                name="spread"
                value={spread.type}
                checked={isSelected}
                onChange={() => onChange(spread.type)}
                className="peer sr-only"
              />
              <span
                className={`flex h-full flex-col items-start gap-3 rounded-2xl border-[1.5px] p-3.5 sm:p-4 text-left transition-colors
                  peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-gold
                  ${isSelected
                    ? "border-gold bg-gold/[0.08] pixel:pixel-shadow-sm"
                    : "border-mist bg-ink sm:bg-void hover:border-pearl/40"
                  }`}
              >
                <SpreadDiagram
                  type={spread.type}
                  className={`h-11 ${isSelected ? "text-gold" : "text-silver/60"}`}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-base font-semibold text-light">{spread.name}</span>
                  <span className="text-sm leading-snug text-pearl">{spread.description}</span>
                </span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
