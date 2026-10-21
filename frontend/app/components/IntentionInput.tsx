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
    <div className="w-full">
      <label htmlFor="intention-input" className="flex items-baseline gap-2 text-pearl text-sm font-medium mb-2">
        {STRINGS.INTENTION_LABEL}
        <span className="text-silver font-normal">({STRINGS.INTENTION_OPTIONAL})</span>
      </label>
      <div className="rounded-xl border border-mist bg-ink focus-within:border-arcane transition-colors">
        <textarea
          id="intention-input"
          value={value}
          maxLength={MAX_CHARS}
          onChange={(e) => onChange(e.target.value)}
          placeholder={STRINGS.INTENTION_PLACEHOLDER}
          rows={2}
          aria-describedby="intention-count"
          className="block w-full bg-transparent outline-none focus-visible:outline-none resize-none
            font-serif text-lg text-light placeholder:text-silver leading-relaxed px-4 pt-3 pb-1"
        />
        <div className="flex justify-end px-4 pb-2">
          <span
            id="intention-count"
            aria-live={nearLimit ? "polite" : "off"}
            className={`text-xs font-mono ${nearLimit ? "text-gold" : "text-silver"}`}
          >
            {value.length}/{MAX_CHARS}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label={STRINGS.TOPICS_LABEL}>
        <span className="text-silver text-xs mr-1">{STRINGS.TOPICS_LABEL}:</span>
        {TOPICS.map((topic) => {
          const active = value === topic.question
          return (
            <button
              key={topic.label}
              type="button"
              onClick={() => onChange(active ? "" : topic.question)}
              aria-pressed={active}
              className={`px-3 py-1.5 rounded-full border text-sm transition-colors
                ${active
                  ? "border-arcane bg-arcane/15 text-light"
                  : "border-mist text-pearl hover:border-arcane-dim hover:bg-veil"
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
