"use client"

import { STRINGS, TOPICS } from "@/app/lib/strings"

interface IntentionInputProps {
  value: string
  onChange: (value: string) => void
}

const MAX_CHARS = 280

export default function IntentionInput({ value, onChange }: IntentionInputProps) {
  const nearLimit = value.length > MAX_CHARS - 40

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="intention-input" className="text-base font-semibold text-light">
          {STRINGS.INTENTION_LABEL}
        </label>
        <span id="intention-hint" className="text-sm text-silver">
          {STRINGS.INTENTION_OPTIONAL} ·{" "}
          <span aria-live={nearLimit ? "polite" : "off"} className={`tabular-nums ${nearLimit ? "text-gold" : ""}`}>
            {value.length}/{MAX_CHARS}
          </span>
        </span>
      </div>
      <textarea
        id="intention-input"
        value={value}
        maxLength={MAX_CHARS}
        onChange={(e) => onChange(e.target.value)}
        placeholder={STRINGS.INTENTION_PLACEHOLDER}
        rows={3}
        aria-describedby="intention-hint"
        className="block w-full resize-none rounded-[14px] border border-mist bg-ink sm:bg-void px-4 py-3.5
          text-[17px] sm:text-lg leading-relaxed text-light placeholder:text-silver
          transition-colors focus:border-gold focus:ring-1 focus:ring-gold focus-visible:outline-none"
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label={STRINGS.TOPICS_LABEL}>
        {TOPICS.map((topic) => {
          const active = value === topic.question
          return (
            <button
              key={topic.label}
              type="button"
              onClick={() => onChange(active ? "" : topic.question)}
              aria-pressed={active}
              className={`h-10 rounded-full border px-4 text-[15px] transition-colors
                ${active
                  ? "border-gold bg-gold/10 text-light"
                  : "border-mist text-pearl hover:border-pearl/50 hover:text-light"
                }`}
            >
              {topic.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
