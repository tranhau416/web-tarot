import { useCallback, useState } from "react"
import { FlatList, Image, Pressable, View } from "react-native"
import { router, useFocusEffect } from "expo-router"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { spreadSummary } from "@shared/constants"
import AppBar from "@/components/AppBar"
import ReadingText from "@/components/ReadingText"
import { Btn, Surface, Txt } from "@/components/ui"
import { cardImage, STRINGS } from "@/lib/cards"
import { clearHistory, loadHistory, type HistoryEntry } from "@/lib/history"
import { useTheme } from "@/theme/ThemeContext"
import { alpha } from "@/theme/tokens"

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" })

function HistoryItem({ entry }: { entry: HistoryEntry }) {
  const { theme } = useTheme()
  const c = theme.colors
  const [open, setOpen] = useState(false)
  return (
    <Surface>
      <View style={{ padding: 18, gap: 14 }}>
        <View style={{ gap: 4 }}>
          <Txt size={14} color="silver">{`${DATE_FORMAT.format(new Date(entry.createdAt))} · ${spreadSummary(entry.spreadType)}`}</Txt>
          <Txt face="display" size={22} leading={1.3}>
            {entry.intention ? `“${entry.intention}”` : STRINGS.HISTORY_NO_QUESTION}
          </Txt>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {entry.cards.map((card, i) => {
            const reversed = card.orientation === "reversed"
            const image = cardImage(card.image_url)
            return (
              <View key={i} style={{ width: 64, gap: 4 }}>
                <View style={{ aspectRatio: 3 / 5, borderRadius: theme.hardShadow ? 0 : 7, overflow: "hidden", borderWidth: theme.border, borderColor: c.mist, backgroundColor: c.veil }}>
                  {image && (
                    <Image source={image} style={{ width: "100%", height: "100%", transform: reversed ? [{ rotate: "180deg" }] : undefined }} />
                  )}
                </View>
                <Txt size={13} leading={1.25}>{card.name_vi || card.name}</Txt>
                <Txt size={13} leading={1.25} style={{ color: reversed ? c.reversed : c.upright }}>
                  {reversed ? STRINGS.REVERSED : STRINGS.UPRIGHT}
                </Txt>
              </View>
            )
          })}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          onPress={() => setOpen((v) => !v)}
          style={{ minHeight: 44, justifyContent: "center", alignSelf: "flex-start" }}
        >
          <Txt face="ui" size={15} color="gold">{open ? STRINGS.HISTORY_HIDE : STRINGS.HISTORY_SHOW}</Txt>
        </Pressable>
        {open && <ReadingText text={entry.text} />}
      </View>
    </Surface>
  )
}

/** Finished readings saved on this phone. */
export default function HistoryScreen() {
  const { theme } = useTheme()
  const c = theme.colors
  const insets = useSafeAreaInsets()
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null)
  const [confirming, setConfirming] = useState(false)

  useFocusEffect(
    useCallback(() => {
      loadHistory().then(setEntries)
    }, []),
  )

  const handleClear = async () => {
    if (!confirming) {
      setConfirming(true)
      return
    }
    await clearHistory()
    setEntries([])
    setConfirming(false)
  }

  const back = () => (router.canGoBack() ? router.back() : router.replace("/"))

  return (
    <View style={{ flex: 1 }}>
      <AppBar onBrand={back} link={{ label: STRINGS.NAV_READ, onPress: back }} />
      <FlatList
        data={entries ?? []}
        keyExtractor={(e) => e.id}
        renderItem={({ item }) => <HistoryItem entry={item} />}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24, gap: 16 }}
        ListHeaderComponent={
          <View style={{ gap: 12, marginBottom: 4 }}>
            <Txt face="display" size={32} leading={1.2} accessibilityRole="header">{STRINGS.HISTORY_TITLE}</Txt>
            <Txt size={16} color="pearl">{STRINGS.HISTORY_SUBTITLE}</Txt>
            {entries && entries.length > 0 && (
              <Pressable
                accessibilityRole="button"
                onPress={handleClear}
                style={{
                  alignSelf: "flex-start",
                  minHeight: 44,
                  justifyContent: "center",
                  paddingHorizontal: 16,
                  borderRadius: theme.radius.sm,
                  borderWidth: theme.border,
                  borderColor: confirming ? alpha(c.negative, 0.6) : c.mist,
                  backgroundColor: confirming ? alpha(c.negative, 0.15) : "transparent",
                }}
              >
                <Txt face="ui" size={15}>{confirming ? STRINGS.HISTORY_CONFIRM_CLEAR : STRINGS.HISTORY_CLEAR}</Txt>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          entries ? (
            <Surface>
              <View style={{ padding: 24, gap: 18, alignItems: "center" }}>
                <Txt size={16} color="read" style={{ textAlign: "center" }}>{STRINGS.HISTORY_EMPTY}</Txt>
                <Btn label={STRINGS.DRAW} onPress={back} />
              </View>
            </Surface>
          ) : undefined
        }
      />
    </View>
  )
}
