import { Text, View } from "react-native"
import { parseReading, type Inline } from "@/lib/readingText"
import { useTheme } from "@/theme/ThemeContext"
import { Txt } from "./ui"

function Line({ parts, cursor }: { parts: Inline[]; cursor?: boolean }) {
  const { theme } = useTheme()
  return (
    <Txt size={17} color="read" leading={1.75}>
      {parts.map((p, i) =>
        p.style ? (
          <Text
            key={i}
            style={{ fontFamily: p.style === "bold" ? theme.fonts.semibold : theme.fonts.italic, color: theme.colors.light }}
          >
            {p.text}
          </Text>
        ) : (
          p.text
        ),
      )}
      {cursor && <Text style={{ color: theme.colors.gold }}> ▍</Text>}
    </Txt>
  )
}

/** A reading: headings, gold diamond bullets, 17px text at 1.75 line height. */
export default function ReadingText({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const { theme } = useTheme()
  const blocks = parseReading(text)
  return (
    <View style={{ gap: 14 }}>
      {blocks.map((block, i) => {
        const last = streaming && i === blocks.length - 1
        if (block.type === "heading") {
          return (
            <Txt key={i} face="semibold" size={19} leading={1.35} accessibilityRole="header" style={{ paddingTop: 8 }}>
              {block.text}
            </Txt>
          )
        }
        if (block.type === "bullets") {
          return (
            <View key={i} style={{ gap: 12 }}>
              {block.items.map((item, j) => (
                <View key={j} style={{ flexDirection: "row", gap: 12 }}>
                  <View
                    style={{ width: 6, height: 6, marginTop: 12, backgroundColor: theme.colors.gold, transform: [{ rotate: "45deg" }] }}
                  />
                  <View style={{ flex: 1 }}>
                    <Line parts={item} cursor={last && j === block.items.length - 1} />
                  </View>
                </View>
              ))}
            </View>
          )
        }
        return <Line key={i} parts={block.parts} cursor={last} />
      })}
    </View>
  )
}
