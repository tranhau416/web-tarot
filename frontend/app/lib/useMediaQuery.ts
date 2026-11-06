"use client"

import { useCallback, useSyncExternalStore } from "react"

/** true khi media query khớp; server và lần render đầu luôn là false. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** Mốc lg của Tailwind: bố cục hai cột, chi tiết lá hiện ngay trong trang. */
export const DESKTOP_QUERY = "(min-width: 1024px)"
