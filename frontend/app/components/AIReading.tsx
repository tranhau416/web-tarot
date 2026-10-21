import type { ReactNode } from "react"
import ReadingText from "@/app/components/ReadingText"
import { STRINGS } from "@/app/lib/strings"

interface AIReadingProps {
  text: string
  /** Đang chờ draw_result (chưa có lá bài) */
  isWaiting: boolean
  /** Đang nhận token */
  isStreaming: boolean
  isDone: boolean
  stopped: boolean
  error: string | null
  /** Nút "Dừng đọc" cạnh tiêu đề khi đang stream */
  onStop: () => void
  /** Thanh hành động cuối lời đọc */
  actions?: ReactNode
}

export default function AIReading({
  text, isWaiting, isStreaming, isDone, stopped, error, onStop, actions,
}: AIReadingProps) {
  const status = isWaiting
    ? STRINGS.DRAWING
    : isStreaming
      ? text ? STRINGS.READING_STREAMING : STRINGS.READING_THINKING
      : ""

  return (
    <section aria-labelledby="reading-heading" aria-busy={isWaiting || isStreaming}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mb-4">
        <h2 id="reading-heading" className="font-serif text-2xl sm:text-3xl text-light">
          {STRINGS.READING_HEADING}
        </h2>
        <p role="status" className="text-sm text-silver">
          {status && (
            <span className="inline-flex items-center gap-2">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              {status}
            </span>
          )}
        </p>
        {isStreaming && (
          <button
            type="button"
            onClick={onStop}
            className="ml-auto rounded-lg border border-mist px-3 py-1.5 text-sm text-pearl transition-colors hover:border-arcane-dim hover:bg-veil"
          >
            {STRINGS.STOP}
          </button>
        )}
      </div>

      {(isWaiting || (isStreaming && !text)) && (
        <div aria-hidden="true" className="max-w-[65ch] space-y-3 py-2">
          {["w-full", "w-11/12", "w-4/5", "w-full", "w-2/3"].map((w, i) => (
            <div key={i} className={`h-4 rounded bg-mist animate-pulse ${w}`} />
          ))}
        </div>
      )}

      {text && (
        <ReadingText text={text}>
          {isStreaming && (
            <span aria-hidden="true" className="inline-block w-0.5 h-5 bg-glow ml-0.5 align-middle animate-pulse" />
          )}
        </ReadingText>
      )}

      {isDone && !text && !stopped && (
        <p className="font-serif italic text-lg text-silver">{STRINGS.READING_EMPTY}</p>
      )}
      {stopped && <p className="mt-4 text-sm text-silver italic">{STRINGS.READING_STOPPED}</p>}
      {error && (
        <p role="alert" className="mt-4 max-w-[65ch] rounded-lg border border-negative/40 bg-negative/10 px-4 py-3 text-base text-light">
          {error}
        </p>
      )}

      {actions && <div className="mt-8">{actions}</div>}
    </section>
  )
}
