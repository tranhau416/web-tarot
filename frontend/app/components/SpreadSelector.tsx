import { memo } from "react"
import type { SpreadType } from "../lib/types"
import type { ReactElement } from "react"

interface SpreadOption {
  type: SpreadType
  name: string
  cardCount: number
  description: string
}

// SVG icon components for each spread type
const SingleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
)

const ThreeCardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <circle cx="12" cy="6"  r="3"/>
    <circle cx="6"  cy="18" r="3"/>
    <circle cx="18" cy="18" r="3"/>
    <line x1="12" y1="9" x2="7.5" y2="15"/>
    <line x1="12" y1="9" x2="16.5" y2="15"/>
    <line x1="9"  y1="18" x2="15" y2="18"/>
  </svg>
)

const HorseshoeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <path d="M6 20 C6 12 18 12 18 20"/>
    <circle cx="6"  cy="20" r="1.5" fill="currentColor"/>
    <circle cx="18" cy="20" r="1.5" fill="currentColor"/>
    <circle cx="4"  cy="14" r="1"   fill="currentColor"/>
    <circle cx="20" cy="14" r="1"   fill="currentColor"/>
    <circle cx="5"  cy="10" r="1"   fill="currentColor"/>
    <circle cx="19" cy="10" r="1"   fill="currentColor"/>
    <circle cx="12" cy="8"  r="1"   fill="currentColor"/>
  </svg>
)

const CelticCrossIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
    <line x1="12" y1="2"  x2="12" y2="22"/>
    <line x1="2"  y1="12" x2="22" y2="12"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
)

const SPREAD_ICONS: Record<SpreadType, () => ReactElement> = {
  single: SingleIcon,
  three_card: ThreeCardIcon,
  horseshoe: HorseshoeIcon,
  celtic_cross: CelticCrossIcon,
}

const SPREAD_OPTIONS: SpreadOption[] = [
  {
    type: "single",
    name: "Single",
    cardCount: 1,
    description: "A direct answer for the present moment",
  },
  {
    type: "three_card",
    name: "Three Card",
    cardCount: 3,
    description: "Past · Present · Future",
  },
  {
    type: "horseshoe",
    name: "Horseshoe",
    cardCount: 7,
    description: "A week's arc of energy",
  },
  {
    type: "celtic_cross",
    name: "Celtic Cross",
    cardCount: 10,
    description: "Deep dive into a complex situation",
  },
]

interface SpreadSelectorProps {
  selected: SpreadType
  onChange: (type: SpreadType) => void
}

function SpreadSelector({ selected, onChange }: SpreadSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {SPREAD_OPTIONS.map((option) => {
        const isSelected = selected === option.type
        const IconComponent = SPREAD_ICONS[option.type]
        return (
          <button
            key={option.type}
            type="button"
            onClick={() => onChange(option.type)}
            aria-label={`${option.name} — ${option.description}`}
            aria-pressed={isSelected}
            className={`relative rounded-xl border bg-abyss p-3 flex flex-col items-center gap-1 text-center cursor-pointer transition-[border-color,background-color,box-shadow] duration-200
              ${isSelected
                ? "border-flame/70"
                : "border-mist hover:border-arcane-dim hover:bg-veil"
              }`}
            style={isSelected ? { boxShadow: "0 0 20px rgba(232,160,69,0.15)", backgroundColor: "rgba(232,160,69,0.10)" } : undefined}
          >
            {/* Icon */}
            <span
              className={`w-6 h-6 flex items-center justify-center transition-colors duration-200
                ${isSelected ? "text-flame" : "text-silver/70"}`}
            >
              <IconComponent />
            </span>

            {/* Spread name */}
            <span
              className={`font-cinzel text-sm transition-[color] duration-200
                ${isSelected ? "text-parchment" : "text-silver"}`}
            >
              {option.name}
            </span>

            {/* Card count badge */}
            <span
              className={`font-mono text-xs px-2 py-0.5 rounded-full border transition-[border-color,color,background-color] duration-200
                ${isSelected
                  ? "border-flame/50 text-flame bg-flame/10"
                  : "border-mist text-silver"
                }`}
            >
              {option.cardCount} {option.cardCount === 1 ? "card" : "cards"}
            </span>

            {/* Description */}
            <span className="font-serif italic text-xs text-silver/80 leading-snug">
              {option.description}
            </span>

            {/* Selected dot indicator */}
            {isSelected && (
              <div className="w-1.5 h-1.5 rounded-full bg-flame absolute top-2 right-2" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default memo(SpreadSelector);
