import { useEffect, useState, type ReactNode } from "react"
import { Pressable, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import Svg, { Path } from "react-native-svg"
import { STORAGE_KEYS } from "@shared/constants"
import { STRINGS } from "@/lib/cards"
import { readItem, writeItem } from "@/lib/storage"
import { useTheme } from "@/theme/ThemeContext"
import { BrandMark } from "./Marks"
import ThemePicker from "./ThemePicker"
import { Btn, Surface, Txt } from "./ui"

function Check({ checked, label, onToggle }: { checked: boolean; label: string; onToggle: () => void }) {
  const { theme } = useTheme()
  const c = theme.colors
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onToggle}
      style={{ flexDirection: "row", alignItems: "center", gap: 12, minHeight: 44 }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: theme.hardShadow ? 0 : 6,
          borderWidth: 2,
          borderColor: checked ? c.gold : c.silver,
          backgroundColor: checked ? c.button : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {checked && (
          <Svg width={14} height={14} viewBox="0 0 16 16">
            <Path d="M3 8.5l3 3 7-7" stroke={c.onButton} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
      </View>
      <Txt size={16} style={{ flex: 1 }}>{label}</Txt>
    </Pressable>
  )
}

/**
 * 18+ confirmation, required before any reading (the backend also checks the header).
 * It is also where the reader first picks a theme.
 */
export default function LegalGate({ children }: { children: ReactNode }) {
  const { theme } = useTheme()
  const insets = useSafeAreaInsets()
  const [confirmed, setConfirmed] = useState<boolean | null>(null)
  const [age, setAge] = useState(false)
  const [fun, setFun] = useState(false)

  useEffect(() => {
    readItem(STORAGE_KEYS.ADULT_CONFIRMED).then((v) => setConfirmed(v === "true"))
  }, [])

  if (confirmed === null) return null
  if (confirmed) return <>{children}</>

  const enter = () => {
    writeItem(STORAGE_KEYS.ADULT_CONFIRMED, "true")
    setConfirmed(true)
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: 20, paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, flexGrow: 1, justifyContent: "center" }}
    >
      <Surface offset={6}>
        <View style={{ padding: 22, gap: 18 }}>
          <View style={{ alignItems: "center", gap: 10 }}>
            <BrandMark size={56} />
            <Txt face="display" size={30} leading={1.2} style={{ textAlign: "center" }} accessibilityRole="header">
              {STRINGS.GATE_TITLE}
            </Txt>
            <Txt size={15} color="pearl" style={{ textAlign: "center" }}>{STRINGS.GATE_SUBTITLE}</Txt>
          </View>
          <View
            style={{
              padding: 14,
              borderRadius: theme.radius.md,
              borderWidth: theme.border,
              borderColor: theme.colors.mist,
              backgroundColor: theme.colors.void,
            }}
          >
            <Txt size={15} color="read" leading={1.6}>{STRINGS.GATE_BODY}</Txt>
          </View>
          <ThemePicker />
          <View>
            <Check checked={age} label={STRINGS.GATE_CHECK_AGE} onToggle={() => setAge((v) => !v)} />
            <Check checked={fun} label={STRINGS.GATE_CHECK_FUN} onToggle={() => setFun((v) => !v)} />
          </View>
          <Btn label={STRINGS.GATE_ENTER} disabled={!(age && fun)} onPress={enter} />
          <Txt size={14} color="silver" style={{ textAlign: "center" }}>{STRINGS.GATE_REMEMBERED}</Txt>
        </View>
      </Surface>
    </ScrollView>
  )
}
