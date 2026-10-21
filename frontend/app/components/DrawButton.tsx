import { STRINGS } from "@/app/lib/strings"

interface DrawButtonProps {
  onClick: () => void
  /** Dòng phụ, ví dụ "Ba lá · Quá khứ · Hiện tại · Tương lai" */
  detail?: string
}

export default function DrawButton({ onClick, detail }: DrawButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full max-w-sm mx-auto flex flex-col items-center justify-center
        py-3 px-6 rounded-2xl font-medium text-base transition-colors
        bg-cta hover:bg-cta-hover text-light shadow-lg shadow-arcane/30"
    >
      <span className="flex items-center gap-2 text-lg">
        <span aria-hidden="true" className="text-gold">✦</span>
        {STRINGS.DRAW}
      </span>
      {detail && <span className="text-sm text-light font-normal">{detail}</span>}
    </button>
  )
}
