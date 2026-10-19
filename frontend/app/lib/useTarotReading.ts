"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { streamAIReading } from "./api"
import type { DrawRequest, DrawResponse } from "./types"

/**
 * idle     → chưa rút
 * drawing  → đã gửi request, chờ draw_result
 * reading  → đã có lá bài, đang stream lời đọc
 * done     → stream hoàn tất
 * error    → lỗi (có thể đã có lá bài + một phần lời đọc)
 */
export type ReadingPhase = "idle" | "drawing" | "reading" | "done" | "error"

function toMessage(err: unknown): string {
  return err instanceof Error && err.message ? err.message : "Đã xảy ra lỗi không xác định."
}

export function useTarotReading() {
  const [phase, setPhase] = useState<ReadingPhase>("idle")
  const [request, setRequest] = useState<DrawRequest | null>(null)
  const [draw, setDraw] = useState<DrawResponse | null>(null)
  const [text, setText] = useState("")
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const start = useCallback(async (req: DrawRequest) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setRequest(req)
    setDraw(null)
    setText("")
    setError(null)
    setPhase("drawing")

    try {
      for await (const event of streamAIReading(req, controller.signal)) {
        if (controller.signal.aborted) return
        switch (event.type) {
          case "draw_result":
            setDraw({
              session_id: event.session_id,
              interpretation: event.interpretation,
              disclaimer: event.disclaimer,
            })
            setPhase("reading")
            break
          case "token":
            setText((prev) => prev + event.text)
            break
          case "done":
            setPhase("done")
            break
          case "error":
            setError(event.message)
            setPhase("error")
            break
        }
      }
    } catch (err) {
      if (controller.signal.aborted) return
      setError(toMessage(err))
      setPhase("error")
    }
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setPhase("idle")
    setRequest(null)
    setDraw(null)
    setText("")
    setError(null)
  }, [])

  // Huỷ stream đang chạy khi component unmount
  useEffect(() => () => abortRef.current?.abort(), [])

  return { phase, request, draw, text, error, start, reset }
}
