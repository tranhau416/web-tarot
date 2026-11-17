import { Pressable, View } from "react-native"
import { STRINGS } from "@/lib/cards"
import { useTheme } from "@/theme/ThemeContext"
import { THEMES, THEME_ORDER, alpha, type ThemeId } from "@/theme/tokens"
import { Daisy, Moon, PixelHeart } from "./Marks"
import { Txt } from "./ui"

/** Thumbnail of a theme in its own fixed colours, so it always shows the theme it stands for. */
function ThemePreview({ id }: { id: ThemeId }) {
  const t = THEMES[id]
  const c = t.colors
  return (
    <View
      style={{
        height: 64,
        width: 104,
        backgroundColor: c.void,
        borderColor: c.mist,
        borderWidth: t.border,
        borderRadius: Math.min(t.radius.sm, 8),
        overflow: "hidden",
      }}
    >
      <View
        style={{
          position: "absolute",
          left: 9,
          top: 10,
          width: 58,
          height: 36,
          padding: 6,
          gap: 6,
          backgroundColor: c.ink,
          borderColor: c.mist,
          borderWidth: t.border,
          borderRadius: Math.min(t.radius.sm, 6),
        }}
      >
        <View style={{ height: 6, width: "80%", backgroundColor: c.light, borderRadius: t.hardShadow ? 0 : 3 }} />
        <View style={{ height: 6, width: "50%", backgroundColor: c.button, borderRadius: t.hardShadow ? 0 : 3 }} />
      </View>
      <View style={{ position: "absolute", right: 8, top: 14 }}>
        {id === "pixel" ? <PixelHeart size={30} fill={c.gold} /> : id === "daisy" ? <Daisy size={32} /> : <Moon size={28} color={c.gold} />}
      </View>
    </View>
  )
}

/** Native-feeling radio tiles; the theme changes as soon as one is picked. */
export default function ThemePicker() {
  const { theme, setTheme } = useTheme()
  const c = theme.colors
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={STRINGS.THEME_LABEL} style={{ gap: 10 }}>
      <Txt face="semibold" size={15}>{STRINGS.THEME_LABEL}</Txt>
      {THEME_ORDER.map((id) => {
        const option = THEMES[id]
        const selected = theme.id === id
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${option.name}. ${option.description}`}
            onPress={() => setTheme(id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              padding: 10,
              borderRadius: theme.radius.md,
              borderWidth: selected ? Math.max(2, theme.border) : theme.border,
              borderColor: selected ? c.gold : c.mist,
              backgroundColor: selected ? alpha(c.gold, 0.08) : "transparent",
            }}
          >
            <ThemePreview id={id} />
            <View style={{ flex: 1, gap: 2 }}>
              <Txt face="semibold" size={15}>{option.name}</Txt>
              <Txt size={14} color="pearl" leading={1.35}>{option.description}</Txt>
            </View>
          </Pressable>
        )
      })}
    </View>
  )
}

/** Header button: switch to the next theme. */
export function ThemeToggle() {
  const { next, setTheme } = useTheme()
  const icon =
    next.id === "pixel" ? <PixelHeart size={22} fill={next.colors.gold} /> : next.id === "daisy" ? <Daisy size={22} /> : <Moon size={22} disc="#0E1015" />
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${STRINGS.THEME_SWITCH_TO} ${next.name}`}
      onPress={() => setTheme(next.id)}
      hitSlop={6}
      style={{ minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }}
    >
      {icon}
    </Pressable>
  )
}
