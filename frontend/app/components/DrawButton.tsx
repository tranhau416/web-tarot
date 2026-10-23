import { STRINGS } from "@/app/lib/strings"

interface DrawButtonProps {
  onClick: () => void
  /** Tên kiểu trải đang chọn, ví dụ "Ba lá" */
  detail?: string
}

export default function DrawButton({ onClick, detail }: DrawButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ui-font flex h-14 w-full items-center justify-center gap-2.5 rounded-[14px] bg-gold px-6
        text-lg font-semibold text-on-gold transition-colors hover:bg-gold-soft
        pixel:border-2 pixel:border-mist pixel:pixel-shadow pixel:active:translate-x-0.5 pixel:active:translate-y-0.5 pixel:active:pixel-shadow-sm"
    >
      {detail ? `${STRINGS.DRAW} · ${detail}` : STRINGS.DRAW}
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  )
}
