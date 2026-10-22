"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { STRINGS } from "@/app/lib/strings"

interface CardSheetProps {
  open: boolean
  onClose: () => void
  /** Chuyển sang lá trước / sau mà không phải đóng bảng */
  onPrev?: () => void
  onNext?: () => void
  children: ReactNode
}

/**
 * <dialog> gốc: tự giữ focus, Esc để đóng, trả focus về lá vừa bấm.
 * Dùng trên điện thoại (trượt lên từ cạnh dưới); desktop hiện chi tiết ngay dưới bàn trải.
 */
export default function CardSheet({ open, onClose, onPrev, onNext, children }: CardSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby="card-detail-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose() // bấm ra nền mờ
      }}
      className="m-0 mt-auto w-full max-w-full max-h-[90dvh] overflow-y-auto overscroll-contain
        rounded-t-[22px] border-t border-mist bg-ink p-0 text-light shadow-[0_-20px_40px_rgba(0,0,0,0.45)] animate-sheet-up
        backdrop:bg-black/70 backdrop:backdrop-blur-[2px]
        lg:ml-auto lg:mt-0 lg:h-full lg:max-h-full lg:w-[30rem] lg:rounded-none lg:rounded-l-[22px] lg:border-l lg:animate-fade-in"
    >
      {open && (
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-10 flex h-[52px] flex-none items-center justify-center border-b border-mist bg-ink/95 backdrop-blur-sm">
            <span aria-hidden="true" className="h-1 w-10 rounded-full bg-[#3A4052] lg:hidden" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex min-h-11 items-center rounded-[10px] px-3.5 text-[15px] font-medium text-light hover:bg-veil"
            >
              {STRINGS.CLOSE}
            </button>
          </div>
          <div className="flex-1 px-5 py-5 sm:px-6">{children}</div>
          {(onPrev || onNext) && (
            <div className="sticky bottom-0 flex gap-2.5 border-t border-mist bg-ink/95 px-5 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
              <button
                type="button"
                onClick={onPrev}
                disabled={!onPrev}
                className="h-12 flex-1 rounded-xl border border-mist text-[15px] font-medium text-light transition-colors hover:bg-veil
                  disabled:border-transparent disabled:bg-veil/60 disabled:text-silver disabled:hover:bg-veil/60"
              >
                ← {STRINGS.PREV_CARD}
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!onNext}
                className="h-12 flex-1 rounded-xl border border-mist text-[15px] font-medium text-light transition-colors hover:bg-veil
                  disabled:border-transparent disabled:bg-veil/60 disabled:text-silver disabled:hover:bg-veil/60"
              >
                {STRINGS.NEXT_CARD} →
              </button>
            </div>
          )}
        </div>
      )}
    </dialog>
  )
}
