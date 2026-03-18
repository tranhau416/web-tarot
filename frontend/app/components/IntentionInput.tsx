"use client"

interface IntentionInputProps {
  value: string
  onChange: (value: string) => void
}

const MAX_CHARS = 280

export default function IntentionInput({ value, onChange }: IntentionInputProps) {
  const remaining = MAX_CHARS - value.length

  return (
    <div className="relative w-full">
      <label
        htmlFor="intention-input"
        className="block text-silver/70 text-sm font-sans mb-2"
      >
        Ý định của bạn (tùy chọn)
      </label>
      <textarea
        id="intention-input"
        value={value}
        onChange={(e) => {
          if (e.target.value.length <= MAX_CHARS) {
            onChange(e.target.value)
          }
        }}
        placeholder="Bạn muốn hỏi điều gì với những lá bài?"
        rows={3}
        className="w-full bg-transparent border-b border-mist focus:border-arcane outline-none resize-none
          font-serif italic text-lg text-pearl placeholder:text-silver/60
          transition-colors duration-200 pb-2 pt-1
          leading-relaxed"
      />
      <div className="flex justify-end mt-1">
        <span
          className={`text-xs font-mono transition-colors duration-200
            ${remaining < 40 ? "text-reversed/70" : "text-silver/70"}`}
        >
          {remaining}
        </span>
      </div>
    </div>
  )
}
