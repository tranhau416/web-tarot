import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { STORAGE_KEYS } from "@shared/constants"
import { readItem, writeItem } from "@/lib/storage"
import { DEFAULT_THEME, THEMES, THEME_ORDER, isThemeId, type Theme, type ThemeId } from "./tokens"

interface ThemeState {
  theme: Theme
  setTheme: (id: ThemeId) => void
  /** The theme the header toggle switches to */
  next: Theme
  /** False until the saved theme has been read, so the first frame is not the wrong theme */
  ready: boolean
}

const ThemeContext = createContext<ThemeState | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<ThemeId>(DEFAULT_THEME)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    readItem(STORAGE_KEYS.THEME).then((saved) => {
      if (isThemeId(saved)) setId(saved)
      setReady(true)
    })
  }, [])

  const setTheme = useCallback((next: ThemeId) => {
    setId(next)
    writeItem(STORAGE_KEYS.THEME, next)
  }, [])

  const value = useMemo<ThemeState>(() => {
    const nextId = THEME_ORDER[(THEME_ORDER.indexOf(id) + 1) % THEME_ORDER.length]
    return { theme: THEMES[id], setTheme, next: THEMES[nextId], ready }
  }, [id, setTheme, ready])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
