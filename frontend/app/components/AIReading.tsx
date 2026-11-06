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
    <section aria-labelledby="reading-heading" aria-busy={isWaiting || isStreaming} className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2 id="reading-heading" className="font-display text-[28px] sm:text-[34px] font-medium leading-tight text-light">
          {STRINGS.READING_HEADING}
        </h2>
        <p role="status" className="text-sm text-pearl">
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
            className="ml-auto inline-flex min-h-11 items-center rounded-[10px] border border-mist px-4 text-[15px] font-medium text-light transition-colors hover:bg-veil"
          >
            {STRINGS.STOP}
          </button>
        )}
      </div>

      {(isWaiting || (isStreaming && !text)) && (
        <div aria-hidden="true" className="flex max-w-[66ch] flex-col gap-3.5 py-1">
          {["w-full", "w-11/12", "w-4/5", "w-full", "w-2/3"].map((w, i) => (
            <div key={i} className={`h-4 rounded bg-veil animate-pulse ${w}`} />
          ))}
        </div>
      )}

      {text && (
        <ReadingText text={text}>
          {isStreaming && (
            <span aria-hidden="true" className="inline-block w-0.5 h-5 bg-gold ml-0.5 align-middle animate-pulse" />
          )}
        </ReadingText>
      )}

      {isDone && !text && !stopped && (
        <p className="text-lg italic text-pearl">{STRINGS.READING_EMPTY}</p>
      )}
      {stopped && <p className="text-sm italic text-silver">{STRINGS.READING_STOPPED}</p>}
      {error && (
        <p role="alert" className="max-w-[66ch] rounded-xl border border-negative/40 bg-negative/10 px-4 py-3 text-base text-light">
          {error}
        </p>
      )}

      {actions && <div className="pt-3">{actions}</div>}
    </section>
  )
}
