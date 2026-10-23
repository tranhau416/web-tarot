"use client"

import { STRINGS } from "@/app/lib/strings"
import { THEMES, setTheme, useTheme, type ThemeId } from "@/app/lib/theme"

/** Trái tim pixel 16×16 — biểu tượng của giao diện Pixel hồng. */
export function PixelHeart({ className = "", fill = "#C2185B" }: { className?: string; fill?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges" aria-hidden="true">
      <path
        fill={fill}
        d="M3 3h3v1H3zM10 3h3v1h-3zM2 4h5v1H2zM9 4h5v1H9zM1 5h14v3H1zM2 8h12v1H2zM3 9h10v1H3zM4 10h8v1H4zM5 11h6v1H5zM6 12h4v1H6zM7 13h2v1H7z"
      />
      <path fill="#FFFFFF" d="M3 5h2v1H3zM3 6h1v1H3z" />
    </svg>
  )
}

/** Ảnh thu nhỏ của mỗi giao diện, vẽ bằng màu cố định để luôn đúng với giao diện nó đại diện. */
export function ThemePreview({ id }: { id: ThemeId }) {
  if (id === "pixel") {
    return (
      <span
        aria-hidden="true"
        className="relative block h-16 overflow-hidden border-2 border-[#4A2545] bg-[#FFE3EF]
          bg-[linear-gradient(rgb(194_24_91/0.1)_2px,transparent_2px),linear-gradient(90deg,rgb(194_24_91/0.1)_2px,transparent_2px)] bg-[length:12px_12px]"
      >
        <span className="absolute left-2.5 top-2.5 flex h-9 w-[58%] flex-col gap-1.5 border-2 border-[#4A2545] bg-[#FFF6FA] p-1.5 shadow-[3px_3px_0_0_#4A2545]">
          <span className="block h-1.5 w-4/5 bg-[#34142F]" />
          <span className="block h-1.5 w-1/2 bg-[#C2185B]" />
        </span>
        <PixelHeart className="absolute right-2.5 top-3 h-8 w-8" />
      </span>
    )
  }
  return (
    <span aria-hidden="true" className="relative block h-16 overflow-hidden rounded-lg border border-[#2B3040] bg-[#0E1015]">
      <span className="absolute left-2.5 top-2.5 flex h-9 w-[58%] flex-col gap-1.5 rounded-md border border-[#2B3040] bg-[#161922] p-1.5">
        <span className="block h-1.5 w-4/5 rounded-full bg-[#F3F1EC]" />
        <span className="block h-1.5 w-1/2 rounded-full bg-[#F2C14E]" />
      </span>
      <svg viewBox="0 0 32 32" className="absolute right-3 top-3.5 h-7 w-7" aria-hidden="true">
        <path d="M20 6 A10 10 0 0 0 20 26 A13 13 0 0 1 20 6 Z" fill="#F2C14E" />
      </svg>
    </span>
  )
}

/** Chọn giao diện bằng radio gốc; đổi ngay khi chọn để xem trước. */
export default function ThemePicker() {
  const theme = useTheme()
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2.5 text-[15px] font-semibold text-light">{STRINGS.THEME_LABEL}</legend>
      <div className="grid grid-cols-2 gap-3">
        {THEMES.map((option) => {
          const selected = theme === option.id
          return (
            <label key={option.id} className="cursor-pointer">
              <input
                type="radio"
                name="theme"
                value={option.id}
                checked={selected}
                onChange={() => setTheme(option.id)}
                className="peer sr-only"
              />
              <span
                className={`flex h-full flex-col gap-2 rounded-xl border-[1.5px] p-2.5 text-left transition-colors
                  peer-focus-visible:outline-2 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-gold
                  ${selected ? "border-gold bg-gold/[0.08] pixel:pixel-shadow-sm" : "border-mist hover:border-pearl/40"}`}
              >
                <ThemePreview id={option.id} />
                <span className="text-[15px] font-semibold text-light">{option.name}</span>
                <span className="text-sm leading-snug text-pearl">{option.description}</span>
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Nút trên thanh điều hướng: đổi qua lại giữa hai giao diện. */
export function ThemeToggle() {
  const theme = useTheme()
  const next = THEMES.find((t) => t.id !== theme) ?? THEMES[0]
  return (
    <button
      type="button"
      onClick={() => setTheme(next.id)}
      aria-label={`${STRINGS.THEME_SWITCH_TO} ${next.name}`}
      title={`${STRINGS.THEME_SWITCH_TO} ${next.name}`}
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-[10px] px-3 text-[15px] font-medium
        text-pearl transition-colors hover:bg-veil hover:text-light whitespace-nowrap"
    >
      {next.id === "pixel" ? (
        <PixelHeart className="h-5 w-5" />
      ) : (
        <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
          <circle cx="16" cy="16" r="15" fill="#0E1015" />
          <path d="M20 6 A10 10 0 0 0 20 26 A13 13 0 0 1 20 6 Z" fill="#F2C14E" />
        </svg>
      )}
      <span className="hidden md:inline">{next.name}</span>
    </button>
  )
}
