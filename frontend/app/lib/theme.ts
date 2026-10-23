"use client"

import { useSyncExternalStore } from "react"
import { STORAGE_KEYS } from "./constants"

export type ThemeId = "night" | "pixel"

export interface ThemeOption {
  id: ThemeId
  name: string
  description: string
}

export const THEMES: ThemeOption[] = [
  { id: "night", name: "Đêm trong", description: "Nền tối, chữ rõ, nhấn vàng" },
  { id: "pixel", name: "Pixel hồng", description: "Hồng pastel, chữ pixel dễ thương" },
]

export const DEFAULT_THEME: ThemeId = "night"

const THEME_EVENT = "tarot-theme-change"

function isTheme(value: unknown): value is ThemeId {
  return value === "night" || value === "pixel"
}

function readTheme(): ThemeId {
  const current = document.documentElement.dataset.theme
  return isTheme(current) ? current : DEFAULT_THEME
}

function subscribe(onChange: () => void) {
  // Đổi giao diện ở tab khác: áp theo rồi báo cho React
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.THEME && isTheme(e.newValue)) {
      document.documentElement.dataset.theme = e.newValue
      onChange()
    }
  }
  window.addEventListener(THEME_EVENT, onChange)
  window.addEventListener("storage", onStorage)
  return () => {
    window.removeEventListener(THEME_EVENT, onChange)
    window.removeEventListener("storage", onStorage)
  }
}

export function setTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, id)
  } catch {
    // bộ nhớ bị chặn — giao diện chỉ giữ trong phiên này
  }
  window.dispatchEvent(new Event(THEME_EVENT))
}

export function useTheme(): ThemeId {
  return useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME)
}
