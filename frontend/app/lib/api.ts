import type {
  DrawRequest,
  DrawResponse,
  Card,
  InterpretationResult,
} from "./types"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001"

export async function drawCards(req: DrawRequest): Promise<DrawResponse> {
  const res = await fetch(`${BASE_URL}/api/v1/draw`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Adult-Confirmed": "true", // đã xác nhận qua Legal Gate
    },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getCards(params?: {
  suit?: string
  limit?: number
}): Promise<Card[]> {
  const url = new URL(`${BASE_URL}/api/v1/cards`)
  if (params?.suit) url.searchParams.set("suit", params.suit)
  if (params?.limit) url.searchParams.set("limit", String(params.limit))

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

export async function getCard(id: number): Promise<Card> {
  const res = await fetch(`${BASE_URL}/api/v1/cards/${id}`)
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

type StreamEvent =
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

export async function* streamAIReading(
  req: DrawRequest
): AsyncGenerator<StreamEvent> {
  const res = await fetch(`${BASE_URL}/api/v1/draw/ai-stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Adult-Confirmed": "true",
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  if (!res.body) {
    throw new Error("No response body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();

      // Khi stream kết thúc, flush phần còn trong buffer (không có \n cuối)
      if (done) {
        if (buffer.startsWith("data: ")) {
          const jsonStr = buffer.slice(6).trim();
          if (jsonStr) {
            try {
              const event: unknown = JSON.parse(jsonStr);
              if (isStreamEvent(event)) yield event;
            } catch {
              // bỏ qua nếu malformed
            }
          }
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;
          try {
            const event: unknown = JSON.parse(jsonStr);
            if (!isStreamEvent(event)) continue;
            yield event;
            if (event.type === "done" || event.type === "error") return;
          } catch {
            // skip malformed line
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
