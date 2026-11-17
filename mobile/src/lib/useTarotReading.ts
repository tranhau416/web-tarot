import { useCallback, useEffect, useRef, useState } from "react"
import type { DrawRequest, DrawResponse } from "@shared/types"
import { streamAIReading } from "./api"

/**
 * Same state machine as the website's hook (frontend/app/lib/useTarotReading.ts):
 * idle → drawing → reading → done/error; stop() keeps the cards and the text so far.
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
  const [stopped, setStopped] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const start = useCallback(async (req: DrawRequest) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setRequest(req)
    setDraw(null)
    setText("")
    setError(null)
    setStopped(false)
    setPhase("drawing")

    try {
      for await (const event of streamAIReading(req, controller.signal)) {
        if (controller.signal.aborted) return
        switch (event.type) {
          case "draw_result":
            setDraw({ session_id: event.session_id, interpretation: event.interpretation, disclaimer: event.disclaimer })
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

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setStopped(true)
    setPhase("done")
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setPhase("idle")
    setRequest(null)
    setDraw(null)
    setText("")
    setError(null)
    setStopped(false)
  }, [])

  useEffect(() => () => abortRef.current?.abort(), [])

  return { phase, request, draw, text, error, stopped, start, stop, reset }
}
