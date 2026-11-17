import { Animated, Pressable, View } from "react-native"
import { STRINGS } from "@/lib/cards"
import { useLoop } from "@/lib/motion"
import { useTheme } from "@/theme/ThemeContext"
import { alpha } from "@/theme/tokens"
import ReadingText from "./ReadingText"
import { Txt } from "./ui"

function Pulse({ width }: { width: `${number}%` }) {
  const { theme } = useTheme()
  const t = useLoop(1600, { yoyo: true })
  return (
    <Animated.View
      style={{ height: 15, width, borderRadius: 4, backgroundColor: theme.colors.veil, opacity: t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.45] }) }}
    />
  )
}

/** The reading section: status, Stop while streaming, the text, then any error. */
export default function AIReading({
  text,
  isWaiting,
  isStreaming,
  isDone,
  stopped,
  error,
  onStop,
}: {
  text: string
  isWaiting: boolean
  isStreaming: boolean
  isDone: boolean
  stopped: boolean
  error: string | null
  onStop: () => void
}) {
  const { theme } = useTheme()
  const c = theme.colors
  const status = isWaiting ? STRINGS.DRAWING : isStreaming ? (text ? STRINGS.READING_STREAMING : STRINGS.READING_THINKING) : ""
  return (
    <View style={{ gap: 16 }} accessibilityLiveRegion="polite">
      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <Txt face="display" size={28} leading={1.2} accessibilityRole="header">{STRINGS.READING_HEADING}</Txt>
        {status ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.gold }} />
            <Txt size={14} color="pearl">{status}</Txt>
          </View>
        ) : null}
        {isStreaming && (
          <Pressable
            accessibilityRole="button"
            onPress={onStop}
            style={({ pressed }) => ({
              marginLeft: "auto",
              minHeight: 44,
              justifyContent: "center",
              paddingHorizontal: 16,
              borderRadius: theme.radius.sm,
              borderWidth: theme.border,
              borderColor: c.mist,
              backgroundColor: pressed ? c.veil : "transparent",
            })}
          >
            <Txt face="ui" size={15} leading={1.2}>{STRINGS.STOP}</Txt>
          </Pressable>
        )}
      </View>

      {(isWaiting || (isStreaming && !text)) && (
        <View style={{ gap: 14, paddingVertical: 4 }}>
          {(["100%", "92%", "80%", "100%", "66%"] as const).map((w, i) => (
            <Pulse key={i} width={w} />
          ))}
        </View>
      )}

      {text ? <ReadingText text={text} streaming={isStreaming} /> : null}

      {isDone && !text && !stopped && <Txt face="italic" size={17} color="pearl">{STRINGS.READING_EMPTY}</Txt>}
      {stopped && <Txt face="italic" size={14} color="silver">{STRINGS.READING_STOPPED}</Txt>}
      {error && (
        <View
          accessibilityRole="alert"
          style={{ padding: 14, borderRadius: theme.radius.md, borderWidth: theme.border, borderColor: alpha(c.negative, 0.4), backgroundColor: alpha(c.negative, 0.1) }}
        >
          <Txt size={16}>{error}</Txt>
        </View>
      )}
    </View>
  )
}
