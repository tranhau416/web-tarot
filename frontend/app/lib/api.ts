import type {
  DrawRequest,
  DrawResponse,
  Card,
  InterpretationResult,
} from "./types"

/**
 * Base URL của backend.
 * - NEXT_PUBLIC_API_URL (được inline lúc build) — "" nghĩa là cùng origin (sau nginx).
 * - Dev (`npm run dev`) mặc định gọi thẳng FastAPI ở :8001.
 */
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "development" ? "http://localhost:8001" : "")

const DRAW_HEADERS = {
  "Content-Type": "application/json",
  "X-Adult-Confirmed": "true", // đã xác nhận qua Legal Gate
}

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message)
    this.name = "ApiError"
  }
}

const STATUS_MESSAGES: Record<number, string> = {
  403: "Bạn cần xác nhận đủ 18 tuổi trước khi rút bài.",
  429: "Bạn rút bài hơi nhanh — hãy hít thở và thử lại sau ít phút.",
  502: "Máy chủ đang khởi động lại. Vui lòng thử lại sau giây lát.",
  504: "Máy chủ phản hồi quá lâu. Vui lòng thử lại.",
}

async function toApiError(res: Response): Promise<ApiError> {
  let detail: string | undefined
  try {
    const body: unknown = await res.json()
    if (body && typeof body === "object" && "detail" in body) {
      const d = (body as { detail: unknown }).detail
      if (typeof d === "string") detail = d
    }
  } catch {
    // body không phải JSON (VD: trang lỗi của nginx)
  }
  const message =
    STATUS_MESSAGES[res.status] ??
    (res.status === 503 && detail ? `Dịch vụ tạm thời không sẵn sàng: ${detail}` : undefined) ??
    detail ??
    `Lỗi máy chủ (HTTP ${res.status}).`
  return new ApiError(message, res.status)
}

async function request(input: string, init?: RequestInit): Promise<Response> {
  let res: Response
  try {
    res = await fetch(input, init)
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err
    throw new ApiError("Không kết nối được tới máy chủ. Kiểm tra mạng hoặc backend.")
  }
  if (!res.ok) throw await toApiError(res)
  return res
}

export async function drawCards(req: DrawRequest): Promise<DrawResponse> {
  const res = await request(`${BASE_URL}/api/v1/draw`, {
    method: "POST",
    headers: DRAW_HEADERS,
    body: JSON.stringify(req),
  })
  return res.json()
}

export async function getCards(params?: {
  suit?: string
  limit?: number
}): Promise<Card[]> {
  const query = new URLSearchParams()
  if (params?.suit) query.set("suit", params.suit)
  if (params?.limit) query.set("limit", String(params.limit))
  const qs = query.toString()

  const res = await request(`${BASE_URL}/api/v1/cards${qs ? `?${qs}` : ""}`)
  return res.json()
}

export async function getCard(id: number): Promise<Card> {
  const res = await request(`${BASE_URL}/api/v1/cards/${id}`)
  return res.json()
}

export type StreamEvent =
  | { type: "draw_result"; session_id: string; interpretation: InterpretationResult; disclaimer: string }
  | { type: "token"; text: string }
  | { type: "done" }
  | { type: "error"; message: string }

function isStreamEvent(e: unknown): e is StreamEvent {
  return (
    typeof e === "object" &&
    e !== null &&
    "type" in e &&
    typeof (e as Record<string, unknown>).type === "string"
  )
}

function parseDataLine(line: string): StreamEvent | null {
  if (!line.startsWith("data: ")) return null
  const jsonStr = line.slice(6).trim()
  if (!jsonStr) return null
  try {
    const event: unknown = JSON.parse(jsonStr)
    return isStreamEvent(event) ? event : null
  } catch {
    return null // bỏ qua dòng malformed
  }
}

/**
 * Gọi POST /draw/ai-stream và yield từng SSE event.
 * Kết thúc sau event "done" hoặc "error"; nếu stream đứt trước đó → throw ApiError.
 */
export async function* streamAIReading(
  req: DrawRequest,
  signal?: AbortSignal,
): AsyncGenerator<StreamEvent> {
  const res = await request(`${BASE_URL}/api/v1/draw/ai-stream`, {
    method: "POST",
    headers: DRAW_HEADERS,
    body: JSON.stringify(req),
    signal,
  })

  if (!res.body) {
    throw new ApiError("Máy chủ không trả về dữ liệu.")
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      buffer += done ? decoder.decode() : decoder.decode(value, { stream: true })

      const lines = buffer.split("\n")
      // Khi stream kết thúc, xử lý luôn phần còn lại (không có \n cuối)
      buffer = done ? "" : lines.pop() ?? ""

      for (const line of lines) {
        const event = parseDataLine(line)
        if (!event) continue
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
