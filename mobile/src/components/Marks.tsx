import type { StyleProp, ViewStyle } from "react-native"
import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg"
import { CARD_H, CARD_W, SPREAD_LAYOUTS } from "@shared/spreadLayouts"
import type { SpreadType } from "@shared/types"
import { useTheme } from "@/theme/ThemeContext"

const PETALS = Array.from({ length: 12 }, (_, i) => i * 30)

/** 12-petal daisy — the mark of the "Cúc hoạ mi" theme (frontend/app/components/Daisy.tsx). */
export function Daisy({ size = 32, style }: { size?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" style={style}>
      <G fill="#FFFFFF" stroke="#9CBF7A" strokeWidth={0.9}>
        {PETALS.map((deg) => (
          <Ellipse key={deg} cx={16} cy={8.2} rx={2.7} ry={6.6} transform={`rotate(${deg} 16 16)`} />
        ))}
      </G>
      <Circle cx={16} cy={16} r={4.6} fill="#FFC72C" stroke="#E0A400" strokeWidth={0.9} />
    </Svg>
  )
}

/** 16×16 pixel heart — the mark of the "Pixel hồng" theme. */
export function PixelHeart({ size = 20, fill = "#C2185B", outline }: { size?: number; fill?: string; outline?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      {outline && (
        <Path
          fill={outline}
          d="M2 2h5v1H2zM9 2h5v1H9zM1 3h1v1H1zM7 3h2v1H7zM14 3h1v1h-1zM0 4h1v4H0zM15 4h1v4h-1zM1 8h1v1H1zM14 8h1v1h-1zM2 9h1v1H2zM13 9h1v1h-1zM3 10h1v1H3zM12 10h1v1h-1zM4 11h1v1H4zM11 11h1v1h-1zM5 12h1v1H5zM10 12h1v1h-1zM6 13h1v1H6zM9 13h1v1H9zM7 14h2v1H7z"
        />
      )}
      <Path
        fill={fill}
        d="M2 3h5v1H2zM9 3h5v1H9zM1 4h14v4H1zM2 8h12v1H2zM3 9h10v1H3zM4 10h8v1H4zM5 11h6v1H5zM6 12h4v1H6zM7 13h2v1H7z"
      />
      <Path fill="#FFFFFF" d="M2 4h2v1H2zM2 5h1v1H2z" />
    </Svg>
  )
}

/** Crescent moon (night theme mark). */
export function Moon({ size = 20, color = "#F2C14E", disc }: { size?: number; color?: string; disc?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      {disc && <Circle cx={16} cy={16} r={15} fill={disc} />}
      <Path d="M20 6 A10 10 0 0 0 20 26 A13 13 0 0 1 20 6 Z" fill={color} />
    </Svg>
  )
}

/** Brand mark: moon and star, pixel heart, or daisy, following the theme. */
export function BrandMark({ size = 30 }: { size?: number }) {
  const { theme } = useTheme()
  const c = theme.colors
  if (theme.id === "pixel") return <PixelHeart size={size} fill={c.gold} outline={c.mist} />
  if (theme.id === "daisy") return <Daisy size={size} />
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Circle cx={16} cy={16} r={14.5} stroke={c.gold} strokeOpacity={0.35} fill="none" />
      <Path d="M20 6 A10 10 0 0 0 20 26 A13 13 0 0 1 20 6 Z" fill={c.gold} />
      <Path d="M23.5 8.5 L24.35 11.15 L27 12 L24.35 12.85 L23.5 15.5 L22.65 12.85 L20 12 L22.65 11.15 Z" fill={c.light} />
    </Svg>
  )
}

/** Mini layout of a spread — same geometry as the real board. */
export function SpreadDiagram({ type, height = 44, color }: { type: SpreadType; height?: number; color: string }) {
  const layout = SPREAD_LAYOUTS[type]
  const pad = 0.15
  const vbW = layout.width + pad * 2
  const vbH = layout.height + pad * 2
  return (
    <Svg width={(height * vbW) / vbH} height={height} viewBox={`${-pad} ${-pad} ${vbW} ${vbH}`}>
      {layout.slots.map((slot, i) => {
        const cx = slot.x + CARD_W / 2
        const cy = slot.y + CARD_H / 2
        return (
          <Rect
            key={i}
            x={slot.x}
            y={slot.y}
            width={CARD_W}
            height={CARD_H}
            rx={0.12}
            transform={slot.crossing ? `rotate(90 ${cx} ${cy})` : undefined}
            fill={color}
            fillOpacity={slot.crossing ? 0.95 : 0.55}
            stroke={color}
            strokeWidth={0.06}
          />
        )
      })}
    </Svg>
  )
}
