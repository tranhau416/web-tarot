import type { ReactNode } from "react"
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from "react-native"
import { useTheme } from "@/theme/ThemeContext"
import type { ThemeColors, ThemeFonts } from "@/theme/tokens"

type Face = keyof ThemeFonts

interface TxtProps extends TextProps {
  face?: Face
  size?: number
  color?: keyof ThemeColors
  /** Line height as a multiple of size */
  leading?: number
  style?: StyleProp<TextStyle>
}

/** Text in the theme's face and colour. Display/ui faces are scaled for the pixel font. */
export function Txt({ face = "body", size = 16, color = "light", leading = 1.5, style, ...rest }: TxtProps) {
  const { theme } = useTheme()
  const scale = face === "display" ? theme.displayScale : face === "ui" ? theme.uiScale : 1
  const fontSize = Math.round(size * scale)
  return (
    <Text
      {...rest}
      style={[
        { fontFamily: theme.fonts[face], fontSize, lineHeight: Math.round(fontSize * leading), color: theme.colors[color] },
        style,
      ]}
    />
  )
}

/**
 * A raised surface: ink fill, border, rounded — or, in the pixel theme, square with a solid
 * plum shadow offset to the bottom right (drawn as a backdrop view, since Android has no
 * hard box-shadow).
 */
export function Surface({
  children,
  style,
  offset = 4,
  fill,
}: {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  offset?: number
  fill?: string
}) {
  const { theme } = useTheme()
  const c = theme.colors
  return (
    <View style={[{ position: "relative" }, theme.hardShadow && { marginRight: offset, marginBottom: offset }, style]}>
      {theme.hardShadow && (
        <View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { backgroundColor: c.mist, transform: [{ translateX: offset }, { translateY: offset }] }]}
        />
      )}
      <View
        style={{
          backgroundColor: fill ?? c.ink,
          borderColor: c.mist,
          borderWidth: theme.border,
          borderRadius: theme.radius.lg,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  )
}

interface BtnProps extends Omit<PressableProps, "children" | "style"> {
  label: string
  kind?: "primary" | "secondary"
  style?: StyleProp<ViewStyle>
  height?: number
  icon?: ReactNode
}

/** Primary (filled) and secondary (outlined) buttons; pixel theme adds the hard shadow and a press-in. */
export function Btn({ label, kind = "primary", style, height = 52, icon, disabled, ...rest }: BtnProps) {
  const { theme } = useTheme()
  const c = theme.colors
  const primary = kind === "primary"
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={style}
      {...rest}
    >
      {({ pressed }) => {
        const shift = theme.hardShadow && pressed && !disabled ? 3 : 0
        return (
          <View style={{ height: height + (theme.hardShadow ? 3 : 0) }}>
            {theme.hardShadow && !disabled && (
              <View
                style={{ position: "absolute", left: 3, top: 3, right: 0, height, backgroundColor: c.mist }}
              />
            )}
            <View
              style={{
                height,
                marginRight: theme.hardShadow ? 3 : 0,
                transform: [{ translateX: shift }, { translateY: shift }],
                flexDirection: "row",
                gap: 10,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 20,
                borderRadius: theme.radius.md,
                borderWidth: primary && !theme.hardShadow ? 0 : theme.border,
                borderColor: theme.hardShadow ? c.mist : c.mist,
                backgroundColor: disabled
                  ? c.veil
                  : primary
                    ? pressed ? c.buttonPressed : c.button
                    : pressed ? c.veil : theme.hardShadow ? c.ink : "transparent",
              }}
            >
              <Txt face="ui" size={16} color={disabled ? "silver" : primary ? "onButton" : "light"} leading={1.2}>
                {label}
              </Txt>
              {icon}
            </View>
          </View>
        )
      }}
    </Pressable>
  )
}

/** Small rounded label: orientation tags, keyword chips, header stats. */
export function Pill({
  children,
  border,
  fill,
  style,
}: {
  children: ReactNode
  border: string
  fill?: string
  style?: StyleProp<ViewStyle>
}) {
  const { theme } = useTheme()
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          alignSelf: "flex-start",
          borderWidth: theme.border,
          borderColor: border,
          backgroundColor: fill,
          borderRadius: theme.radius.pill,
          paddingHorizontal: 10,
          paddingVertical: 3,
        },
        style,
      ]}
    >
      {children}
    </View>
  )
}
