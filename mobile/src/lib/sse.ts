import type { InterpretationResult } from "@shared/types"

export type StreamEvent =
  | { type: "draw_result"; session_id: string; interpretation: InterpretationResult; disclaimer: string }
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message: string }

function isStreamEvent(e: unknown): e is StreamEvent {
  return typeof e === "object" && e !== null && typeof (e as Record<string, unknown>).type === "string"
}

function parseDataLine(line: string): StreamEvent | null {
  if (!line.startsWith("data: ")) return null
  const json = line.slice(6).trim()
  if (!json) return null
  try {
    const event: unknown = JSON.parse(json)
    return isStreamEvent(event) ? event : null
  } catch {
    return null // skip malformed lines
  }
}

/**
 * Incremental parser for the backend's `/draw/ai-stream` SSE: feed text chunks as they
 * arrive (a chunk may end mid-line), get back the complete events. Same rules as the web
 * client in frontend/app/lib/api.ts.
 */
export function createSseParser() {
  let buffer = ""
  return {
    push(chunk: string): StreamEvent[] {
      buffer += chunk
      const lines = buffer.split("\n")
      buffer = lines.pop() ?? ""
      return lines.map(parseDataLine).filter((e): e is StreamEvent => e !== null)
    },
    /** The stream ended: parse whatever is left without a trailing newline. */
    flush(): StreamEvent[] {
      const rest = buffer
      buffer = ""
      const event = parseDataLine(rest)
      return event ? [event] : []
    },
  }
}
