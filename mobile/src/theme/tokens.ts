/**
 * The three themes of the web app (frontend/app/globals.css), as React Native tokens.
 * Colour names match the CSS tokens so the two stay easy to compare.
 */
export type ThemeId = "night" | "pixel" | "daisy"

export interface ThemeColors {
  void: string // page ground
  ink: string // surfaces
  veil: string // raised / selected
  mist: string // borders, dividers (pixel: outlines and hard shadows)
  silver: string // captions — smallest allowed text colour
  pearl: string // secondary text
  read: string // long reading text
  light: string // primary text
  gold: string // the accent for text, outlines, rings
  goldSoft: string
  /** Fill of primary buttons (daisy: sun yellow, others: the accent) */
  button: string
  buttonPressed: string
  onButton: string
  upright: string
  reversed: string
  positive: string
  negative: string
  scrim: string
  glow: string
}

export interface ThemeFonts {
  body: string
  medium: string
  semibold: string
  bold: string
  italic: string
  display: string
  /** Buttons, labels, chips (pixel: the pixel face) */
  ui: string
}

export interface Theme {
  id: ThemeId
  name: string
  description: string
  dark: boolean
  colors: ThemeColors
  fonts: ThemeFonts
  /** VT323 runs small: pixel display/ui text is scaled up to match the body x-height */
  displayScale: number
  uiScale: number
  radius: { sm: number; md: number; lg: number; pill: number }
  border: number
  /** Pixel theme: solid offset shadows instead of soft ones */
  hardShadow: boolean
}

const beVietnam = {
  body: "BeVietnamPro_400Regular",
  medium: "BeVietnamPro_500Medium",
  semibold: "BeVietnamPro_600SemiBold",
  bold: "BeVietnamPro_700Bold",
  italic: "BeVietnamPro_400Regular_Italic",
}

export const THEMES: Record<ThemeId, Theme> = {
  night: {
    id: "night",
    name: "Đêm trong",
    description: "Nền tối, chữ rõ, nhấn vàng",
    dark: true,
    colors: {
      void: "#0E1015",
      ink: "#161922",
      veil: "#1E2230",
      mist: "#2B3040",
      silver: "#8E93A3",
      pearl: "#B8BCC8",
      read: "#E4E2DC",
      light: "#F3F1EC",
      gold: "#F2C14E",
      goldSoft: "#F7D27A",
      button: "#F2C14E",
      buttonPressed: "#F7D27A",
      onButton: "#1A1405",
      upright: "#F2C14E",
      reversed: "#9DB4FF",
      positive: "#5FD1A0",
      negative: "#F2877C",
      scrim: "rgba(0,0,0,0.7)",
      glow: "rgba(242,193,78,0.16)",
    },
    fonts: { ...beVietnam, display: "Fraunces_500Medium", ui: beVietnam.semibold },
    displayScale: 1,
    uiScale: 1,
    radius: { sm: 10, md: 14, lg: 20, pill: 999 },
    border: 1,
    hardShadow: false,
  },
  pixel: {
    id: "pixel",
    name: "Pixel hồng",
    description: "Hồng pastel, chữ pixel dễ thương",
    dark: false,
    colors: {
      void: "#FFE3EF",
      ink: "#FFF6FA",
      veil: "#FFD0E4",
      mist: "#4A2545",
      silver: "#874278",
      pearl: "#6B2F60",
      read: "#3E2340",
      light: "#34142F",
      gold: "#C2185B",
      goldSoft: "#A31550",
      button: "#C2185B",
      buttonPressed: "#A31550",
      onButton: "#FFFFFF",
      upright: "#C2185B",
      reversed: "#3F51B5",
      positive: "#1E7B4B",
      negative: "#B42318",
      scrim: "rgba(74,37,69,0.45)",
      glow: "rgba(255,255,255,0.75)",
    },
    fonts: {
      body: "Nunito_400Regular",
      medium: "Nunito_600SemiBold",
      semibold: "Nunito_600SemiBold",
      bold: "Nunito_700Bold",
      italic: "Nunito_400Regular_Italic",
      display: "VT323_400Regular",
      ui: "VT323_400Regular",
    },
    displayScale: 1.3,
    uiScale: 1.3,
    radius: { sm: 0, md: 0, lg: 0, pill: 0 },
    border: 2,
    hardShadow: true,
  },
  daisy: {
    id: "daisy",
    name: "Cúc hoạ mi",
    description: "Trắng tinh, vàng nắng, xanh lá non",
    dark: false,
    colors: {
      void: "#FFFBEA",
      ink: "#FFFFFF",
      veil: "#FFF1BA",
      mist: "#CADBB4",
      silver: "#56664A",
      pearl: "#3F4F35",
      read: "#25321D",
      light: "#1B2914",
      gold: "#2E7D32",
      goldSoft: "#25662A",
      button: "#FFC72C",
      buttonPressed: "#F5B000",
      onButton: "#2A2000",
      upright: "#2E7D32",
      reversed: "#2F55C2",
      positive: "#1B7A44",
      negative: "#C0392B",
      scrim: "rgba(27,41,20,0.45)",
      glow: "rgba(255,214,64,0.4)",
    },
    fonts: { ...beVietnam, display: "Baloo2_600SemiBold", ui: beVietnam.semibold },
    displayScale: 1,
    uiScale: 1,
    radius: { sm: 12, md: 16, lg: 22, pill: 999 },
    border: 1,
    hardShadow: false,
  },
}

export const THEME_ORDER: ThemeId[] = ["night", "pixel", "daisy"]
export const DEFAULT_THEME: ThemeId = "night"

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && value in THEMES
}

/** `#RRGGBB` + alpha → `rgba()`, for the tinted fills the web builds with `bg-gold/10`. */
export function alpha(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}
