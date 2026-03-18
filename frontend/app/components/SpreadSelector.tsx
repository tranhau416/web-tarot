import type { SpreadType } from "../lib/types"

interface SpreadOption {
  type: SpreadType
  name: string
  cardCount: number
  description: string
  symbol: string
}

const SPREAD_OPTIONS: SpreadOption[] = [
  {
    type: "single",
    name: "Single",
    cardCount: 1,
    description: "A direct answer for the present moment",
    symbol: "✦",
  },
  {
    type: "three_card",
    name: "Three Card",
    cardCount: 3,
    description: "Past · Present · Future",
    symbol: "✦✦✦",
  },
  {
    type: "horseshoe",
    name: "Horseshoe",
    cardCount: 7,
    description: "A week's arc of energy",
    symbol: "⌒",
  },
  {
    type: "celtic_cross",
    name: "Celtic Cross",
    cardCount: 10,
    description: "Deep dive into a complex situation",
    symbol: "✛",
  },
]

interface SpreadSelectorProps {
  selected: SpreadType
  onChange: (type: SpreadType) => void
}

export default function SpreadSelector({ selected, onChange }: SpreadSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {SPREAD_OPTIONS.map((option) => {
        const isSelected = selected === option.type
        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            aria-label={`${option.name} — ${option.description}`}
            aria-pressed={isSelected}
            className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200
              text-center cursor-pointer
              ${isSelected
                ? "border-arcane bg-arcane/10 text-glow shadow-lg shadow-arcane/10"
                : "border-mist bg-ink/50 text-silver hover:border-arcane-dim hover:text-pearl hover:bg-veil"
              }`}
          >
            {/* Symbol */}
            <span
              className={`text-xl font-mono select-none transition-colors duration-200
                ${isSelected ? "text-arcane" : "text-silver/70"}`}
            >
              {option.symbol}
            </span>

            {/* Name */}
            <span
              className={`font-sans font-semibold text-base transition-colors duration-200
                ${isSelected ? "text-glow" : "text-pearl"}`}
            >
              {option.name}
            </span>

            {/* Card count badge */}
            <span
              className={`text-sm font-mono px-2 py-0.5 rounded-full border transition-all duration-200
                ${isSelected
                  ? "border-arcane text-arcane bg-arcane/10"
                  : "border-mist text-silver"
                }`}
            >
              {option.cardCount} {option.cardCount === 1 ? "card" : "cards"}
            </span>

            {/* Description */}
            <span className="text-sm text-silver/80 leading-snug font-sans">
              {option.description}
            </span>

            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-arcane" />
            )}
          </button>
        )
      })}
    </div>
  )
}
