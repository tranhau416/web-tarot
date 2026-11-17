import { fetch } from "expo/fetch"
import type { DrawRequest } from "@shared/types"
import { createSseParser, type StreamEvent } from "./sse"

export type { StreamEvent } from "./sse"

/**
 * Backend address, inlined at build time from EXPO_PUBLIC_API_URL
 * (e.g. https://tarot.example.com — the app talks to the same FastAPI as the website).
 */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/+$/, "")

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
    this.name = "ApiError"
  }
}

/** Messages for the reader — never the backend's technical detail. Same wording as the website. */
const STATUS_MESSAGES: Record<number, string> = {
  403: "Bạn cần xác nhận đủ 18 tuổi trước khi rút bài.",
  404: "Không tìm thấy dữ liệu bạn yêu cầu.",
  429: "Bạn rút bài hơi nhanh — hãy hít thở và thử lại sau ít phút.",
  502: "Máy chủ đang khởi động lại. Vui lòng thử lại sau giây lát.",
  503: "Bộ bài đang được chuẩn bị. Vui lòng thử lại sau ít phút.",
  504: "Máy chủ phản hồi quá lâu. Vui lòng thử lại.",
}

function statusMessage(status: number): string {
  return (
    STATUS_MESSAGES[status] ??
    (status >= 500
      ? "Máy chủ đang gặp sự cố. Vui lòng thử lại sau ít phút."
      : "Yêu cầu chưa hợp lệ. Vui lòng mở lại ứng dụng và thử lại.")
  )
}

function isAbort(err: unknown): boolean {
  return err instanceof Error && err.name === "AbortError"
}

/**
 * POST /api/v1/draw/ai-stream and yield each SSE event. Ends after "done" or "error";
 * throws ApiError if the stream breaks before either.
 */
export async function* streamAIReading(req: DrawRequest, signal?: AbortSignal): AsyncGenerator<StreamEvent> {
  if (!API_URL) {
    throw new ApiError("Ứng dụng chưa được cấu hình địa chỉ máy chủ (EXPO_PUBLIC_API_URL).")
  }

  let res: Awaited<ReturnType<typeof fetch>>
  try {
    res = await fetch(`${API_URL}/api/v1/draw/ai-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Adult-Confirmed": "true" },
      body: JSON.stringify(req),
      signal,
    })
  } catch (err) {
    if (isAbort(err)) throw err
    throw new ApiError("Không kết nối được tới máy chủ. Hãy kiểm tra kết nối mạng và thử lại.")
  }
  if (!res.ok) throw new ApiError(statusMessage(res.status), res.status)
  if (!res.body) throw new ApiError("Máy chủ không trả về dữ liệu.")

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  const parser = createSseParser()
  try {
    while (true) {
      const { done, value } = await reader.read()
      const events = done ? [...parser.push(decoder.decode()), ...parser.flush()] : parser.push(decoder.decode(value, { stream: true }))
      for (const event of events) {
        yield event
        if (event.type === "done" || event.type === "error") return
      }
      if (done) break
    }
  } finally {
    reader.cancel().catch(() => {})
  }
  throw new ApiError("Kết nối bị ngắt trước khi lời đọc hoàn tất.")
}
