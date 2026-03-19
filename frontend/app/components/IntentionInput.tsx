"use client"

interface IntentionInputProps {
  value: string
  onChange: (value: string) => void
}

const MAX_CHARS = 280

export default function IntentionInput({ value, onChange }: IntentionInputProps) {
  const remaining = MAX_CHARS - value.length
  const isFocusNear = remaining < 40

  return (
    <div className="relative w-full">
      <div
        className="rounded-xl border border-mist bg-abyss p-3 transition-[border-color] duration-300 focus-within:border-flame/60 group"
        style={undefined}
      >
        {/* Label */}
        <label
          htmlFor="intention-input"
          className="flex items-center gap-1.5 mb-2 cursor-text"
        >
          {/* Quill icon */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-silver/60 flex-shrink-0"
            aria-hidden="true"
          >
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <line x1="16" y1="8" x2="2" y2="22" />
          </svg>
          <span className="text-phase">YOUR INTENTION</span>
        </label>

        {/* Textarea */}
        <textarea
          id="intention-input"
          value={value}
          onChange={(e) => {
            if (e.target.value.length <= MAX_CHARS) {
              onChange(e.target.value)
            }
          }}
          placeholder="What does the cosmos hold for you…"
          rows={2}
          aria-describedby="intention-counter"
          name="intention"
          autoComplete="off"
          className="bg-transparent border-none resize-none w-full font-serif italic text-base text-pearl placeholder:text-silver/40 leading-relaxed py-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-flame/60 rounded-sm"
        />

        {/* Progress bar */}
        <div className="h-px bg-mist mt-2">
          <div
            className="h-full bg-flame/50 transition-[width] duration-300"
            style={{ width: `${(value.length / MAX_CHARS) * 100}%` }}
          />
        </div>

        {/* Character counter */}
        <div className="flex justify-end mt-1.5">
          <span
            id="intention-counter"
            aria-live="polite"
            aria-atomic="true"
            className={`font-mono text-xs transition-colors duration-200
              ${isFocusNear ? "text-flame/70" : "text-silver/50"}`}
          >
            <span className="sr-only">{remaining} characters remaining</span>
            <span aria-hidden="true">{remaining}</span>
          </span>
        </div>
      </div>
    </div>
  )
}
