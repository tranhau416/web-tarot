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
 * Di động: trượt lên từ cạnh dưới. Desktop: ngăn kéo bên phải.
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
      className="m-0 mt-auto w-full max-w-full max-h-[88dvh] overflow-y-auto overscroll-contain
        rounded-t-2xl border border-mist bg-ink p-0 text-light shadow-2xl animate-sheet-up
        backdrop:bg-void/75 backdrop:backdrop-blur-sm
        lg:ml-auto lg:mt-0 lg:h-full lg:max-h-full lg:w-[30rem] lg:rounded-none lg:rounded-l-2xl lg:animate-fade-in"
    >
      {open && (
        <div className="flex min-h-full flex-col">
          <div className="sticky top-0 z-10 flex h-12 items-center justify-center border-b border-mist bg-ink/95 backdrop-blur-sm">
            <span aria-hidden="true" className="h-1 w-10 rounded-full bg-mist lg:hidden" />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-1.5 text-sm text-pearl hover:bg-veil"
            >
              {STRINGS.CLOSE}
            </button>
          </div>
          <div className="flex-1 px-5 py-5 sm:px-6">{children}</div>
          {(onPrev || onNext) && (
            <div className="sticky bottom-0 flex gap-2 border-t border-mist bg-ink/95 px-4 py-3 backdrop-blur-sm">
              <button
                type="button"
                onClick={onPrev}
                disabled={!onPrev}
                className="flex-1 rounded-lg border border-mist py-2 text-sm text-pearl transition-colors hover:bg-veil disabled:opacity-40 disabled:hover:bg-transparent"
              >
                ← {STRINGS.PREV_CARD}
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={!onNext}
                className="flex-1 rounded-lg border border-mist py-2 text-sm text-pearl transition-colors hover:bg-veil disabled:opacity-40 disabled:hover:bg-transparent"
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
