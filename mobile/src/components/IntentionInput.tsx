import { Pressable, TextInput, View } from "react-native"
import { TOPICS } from "@shared/strings"
import { STRINGS } from "@/lib/cards"
import { useTheme } from "@/theme/ThemeContext"
import { alpha } from "@/theme/tokens"
import { Txt } from "./ui"

const MAX_LENGTH = 280

/** The question (optional, 280 characters) and topic chips that fill in a ready-made question. */
export default function IntentionInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { theme } = useTheme()
  const c = theme.colors
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <Txt face="semibold" size={16} nativeID="intention-label">{STRINGS.INTENTION_LABEL}</Txt>
        <Txt size={14} color="silver">{`${STRINGS.INTENTION_OPTIONAL} · ${value.length}/${MAX_LENGTH}`}</Txt>
      </View>
      <TextInput
        accessibilityLabelledBy="intention-label"
        accessibilityLabel={STRINGS.INTENTION_LABEL}
        value={value}
        onChangeText={onChange}
        maxLength={MAX_LENGTH}
        multiline
        placeholder={STRINGS.INTENTION_PLACEHOLDER}
        placeholderTextColor={c.silver}
        selectionColor={c.gold}
        style={{
          minHeight: 104,
          textAlignVertical: "top",
          padding: 14,
          fontFamily: theme.fonts.body,
          fontSize: 17,
          lineHeight: 25,
          color: c.light,
          backgroundColor: c.void,
          borderWidth: theme.border,
          borderColor: c.mist,
          borderRadius: theme.radius.md,
        }}
      />
      <View accessibilityLabel={STRINGS.TOPICS_LABEL} style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {TOPICS.map((topic) => {
          const selected = value === topic.question
          return (
            <Pressable
              key={topic.label}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(selected ? "" : topic.question)}
              style={{
                minHeight: 40,
                justifyContent: "center",
                paddingHorizontal: 14,
                borderRadius: theme.radius.pill,
                borderWidth: theme.border,
                borderColor: selected ? c.gold : c.mist,
                backgroundColor: selected ? alpha(c.gold, 0.1) : "transparent",
              }}
            >
              <Txt size={15} color={selected ? "light" : "pearl"} leading={1.2}>{topic.label}</Txt>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
