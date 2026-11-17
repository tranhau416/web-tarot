import { STORAGE_KEYS } from "@shared/constants"
import { addToHistory, buildHistoryEntry, parseHistory, type HistoryEntry } from "@shared/history"
import type { DrawResponse } from "@shared/types"
import { readItem, writeItem } from "./storage"

/** Reading history on the phone (AsyncStorage), same entries and limit as the website. */
export async function loadHistory(): Promise<HistoryEntry[]> {
  return parseHistory(await readItem(STORAGE_KEYS.HISTORY))
}

export async function saveReading(draw: DrawResponse, intention: string | undefined, text: string): Promise<void> {
  if (!text.trim()) return
  const entries = addToHistory(await loadHistory(), buildHistoryEntry(draw, intention, text))
  await writeItem(STORAGE_KEYS.HISTORY, JSON.stringify(entries))
}

export async function clearHistory(): Promise<void> {
  await writeItem(STORAGE_KEYS.HISTORY, "[]")
}

export type { HistoryEntry }
