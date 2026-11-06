import { STORAGE_KEYS } from "./constants"
import type { DrawResponse, SpreadType } from "./types"

/**
 * Lịch sử trải bài — lưu trên trình duyệt (localStorage), không gửi đi đâu.
 * Mọi thao tác đều try/catch: chế độ ẩn danh hoặc bộ nhớ bị chặn vẫn chạy được.
 */

export interface HistoryCard {
  name: string
  name_vi: string | null
  image_url: string | null
  orientation: "upright" | "reversed"
  position: string
}

export interface HistoryEntry {
  id: string
  createdAt: string
  spreadType: SpreadType
  intention: string | null
  cards: HistoryCard[]
  text: string
}

const MAX_ENTRIES = 30

export function parseHistory(raw: string | null): HistoryEntry[] {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as HistoryEntry[]) : []
  } catch {
    return []
  }
}

export function loadHistory(): HistoryEntry[] {
  try {
    return parseHistory(localStorage.getItem(STORAGE_KEYS.HISTORY))
  } catch {
    return []
  }
}

function persist(entries: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // bộ nhớ đầy hoặc bị chặn — bỏ qua
  }
}

export function saveReading(draw: DrawResponse, intention: string | undefined, text: string) {
  if (!text.trim()) return
  const entry: HistoryEntry = {
    id: draw.session_id,
    createdAt: new Date().toISOString(),
    spreadType: draw.interpretation.spread_type,
    intention: intention?.trim() || null,
    cards: draw.interpretation.cards.map((c) => ({
      name: c.card_name,
      name_vi: c.name_vi,
      image_url: c.image_url,
      orientation: c.orientation,
      position: c.position_label_vi || c.position_label || "",
    })),
    text,
  }
  persist([entry, ...loadHistory().filter((e) => e.id !== entry.id)])
}

export function clearHistory() {
  persist([])
}
