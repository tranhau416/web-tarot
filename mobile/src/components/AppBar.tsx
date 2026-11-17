import { Pressable, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { STRINGS } from "@/lib/cards"
import { useTheme } from "@/theme/ThemeContext"
import { BrandMark } from "./Marks"
import { ThemeToggle } from "./ThemePicker"
import { Txt } from "./ui"

/** Top bar: brand (back to the reading form), theme switch, and one link on the right. */
export default function AppBar({
  onBrand,
  link,
}: {
  onBrand?: () => void
  link?: { label: string; onPress: () => void; active?: boolean }
}) {
  const { theme } = useTheme()
  const c = theme.colors
  const insets = useSafeAreaInsets()
  return (
    <View
      style={{
        paddingTop: insets.top,
        paddingHorizontal: 16,
        backgroundColor: c.void,
        borderBottomWidth: theme.border,
        borderBottomColor: theme.hardShadow ? c.mist : c.veil,
      }}
    >
      <View style={{ height: 60, flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={STRINGS.BRAND}
          onPress={onBrand}
          disabled={!onBrand}
          style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}
        >
          <BrandMark size={28} />
          <Txt face="display" size={21} leading={1.2} numberOfLines={1}>{STRINGS.BRAND}</Txt>
        </Pressable>
        <ThemeToggle />
        {link && (
          <Pressable
            accessibilityRole="link"
            onPress={link.onPress}
            style={{
              minHeight: 44,
              justifyContent: "center",
              paddingHorizontal: 14,
              borderRadius: theme.radius.sm,
              backgroundColor: link.active ? c.veil : "transparent",
            }}
          >
            <Txt face="ui" size={15} color={link.active ? "light" : "pearl"} leading={1.2}>{link.label}</Txt>
          </Pressable>
        )}
      </View>
    </View>
  )
}
