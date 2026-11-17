import { useCallback, useEffect, useRef, useState } from "react"
import { BackHandler, KeyboardAvoidingView, Platform, ScrollView, View, type ScrollViewInstance } from "react-native"
import { router } from "expo-router"
import * as Clipboard from "expo-clipboard"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { QUANTUM_SOURCE_LABELS, SPREADS_BY_TYPE, spreadSummary } from "@shared/constants"
import type { DrawResponse, SpreadType } from "@shared/types"
import AIReading from "@/components/AIReading"
import AppBar from "@/components/AppBar"
import CardSheet from "@/components/CardSheet"
import HeroFan from "@/components/HeroFan"
import IntentionInput from "@/components/IntentionInput"
import SpreadBoard, { SpreadCaptions, SpreadLegend, isRowSpread } from "@/components/SpreadBoard"
import SpreadSelector from "@/components/SpreadSelector"
import { Btn, Pill, Surface, Txt } from "@/components/ui"
import { cardTitle, harmonyLabel, positionLabel, STRINGS } from "@/lib/cards"
import { saveReading } from "@/lib/history"
import { useTarotReading } from "@/lib/useTarotReading"
import { useTheme } from "@/theme/ThemeContext"
import { alpha } from "@/theme/tokens"

const DATE_FORMAT = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" })

/** What "Copy" puts on the clipboard: question, cards by position, then the reading. */
function readingAsText(draw: DrawResponse, intention: string | undefined, text: string): string {
  const spreadType = draw.interpretation.spread_type
  const cards = draw.interpretation.cards
    .map((c) => {
      const orientation = c.orientation === "reversed" ? STRINGS.REVERSED : STRINGS.UPRIGHT
      return `${c.position_index + 1}. ${positionLabel(c, spreadType)}: ${cardTitle(c)} (${orientation.toLowerCase()})`
    })
    .join("\n")
  const header = intention ? `“${intention}”\n` : ""
  return `${header}${spreadSummary(spreadType)}\n${cards}\n\n${text.trim()}\n`
}

function Arrow({ color }: { color: string }) {
  return <Txt size={18} leading={1} style={{ color }}>→</Txt>
}

export default function Home() {
  const { theme } = useTheme()
  const c = theme.colors
  const insets = useSafeAreaInsets()
  const scroll = useRef<ScrollViewInstance>(null)
  const [intention, setIntention] = useState("")
  const [spreadType, setSpreadType] = useState<SpreadType>("three_card")
  const [selected, setSelected] = useState<number | null>(null)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [copied, setCopied] = useState(false)
  const { phase, request, draw, text, error, stopped, start, stop, reset } = useTarotReading()

  const cards = draw?.interpretation.cards ?? null
  const activeSpread = request?.spread_type ?? spreadType

  // Save to history once the reading is finished (also when the reader stopped it)
  useEffect(() => {
    if (phase === "done" && draw) saveReading(draw, request?.intention, text)
  }, [phase, draw, request, text])

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const begin = useCallback(
    (req: { spread_type: SpreadType; intention?: string }) => {
      setSelected(null)
      setStartedAt(new Date())
      scroll.current?.scrollTo({ y: 0, animated: false })
      start(req)
    },
    [start],
  )

  const newReading = useCallback(() => {
    reset()
    setSelected(null)
    setIntention("")
    scroll.current?.scrollTo({ y: 0, animated: false })
  }, [reset])

  // Android back on a reading returns to the form instead of leaving the app
  useEffect(() => {
    if (phase === "idle") return
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      newReading()
      return true
    })
    return () => sub.remove()
  }, [phase, newReading])

  const copy = async () => {
    if (!draw) return
    try {
      await Clipboard.setStringAsync(readingAsText(draw, request?.intention, text))
      setCopied(true)
    } catch {
      // clipboard unavailable — nothing to do
    }
  }

  const appBar = (
    <AppBar onBrand={phase === "idle" ? undefined : newReading} link={{ label: STRINGS.HISTORY, onPress: () => router.push("/history") }} />
  )

  if (phase === "idle") {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {appBar}
        <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, paddingBottom: 24, gap: 22 }} keyboardShouldPersistTaps="handled">
          <HeroFan />
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.gold }} />
              <Txt face="medium" size={14} color="pearl">{STRINGS.HERO_EYEBROW}</Txt>
            </View>
            <Txt face="display" size={36} leading={1.12} accessibilityRole="header">{STRINGS.HERO_TITLE}</Txt>
            <Txt size={16} color="pearl" leading={1.6}>{STRINGS.HERO_SUBTITLE}</Txt>
          </View>
          <Surface>
            <View style={{ padding: 16, gap: 22 }}>
              <IntentionInput value={intention} onChange={setIntention} />
              <SpreadSelector selected={spreadType} onChange={setSpreadType} />
            </View>
          </Surface>
          <Txt size={14} color="silver" leading={1.6} style={{ borderTopWidth: theme.border, borderColor: c.veil, paddingTop: 16 }}>
            {STRINGS.DISCLAIMER}
          </Txt>
        </ScrollView>
        {/* The draw button stays within thumb reach above the system bar */}
        <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: Math.max(16, insets.bottom + 8), backgroundColor: alpha(c.void, 0.96) }}>
          <Btn
            label={`${STRINGS.DRAW} · ${SPREADS_BY_TYPE[spreadType].name}`}
            height={56}
            icon={<Arrow color={c.onButton} />}
            onPress={() => begin({ spread_type: spreadType, intention: intention.trim() || undefined })}
          />
        </View>
      </KeyboardAvoidingView>
    )
  }

  const finished = Boolean(draw) && (phase === "done" || phase === "error")
  const detail = selected !== null ? cards?.[selected] ?? null : null

  return (
    <View style={{ flex: 1 }}>
      {appBar}
      <ScrollView ref={scroll} contentContainerStyle={{ padding: 16, paddingBottom: 32, gap: 24 }}>
        <View style={{ gap: 10 }}>
          <Txt size={14} color="silver">
            {spreadSummary(activeSpread)}
            {startedAt ? ` · ${DATE_FORMAT.format(startedAt)}` : ""}
          </Txt>
          <Txt face="display" size={28} leading={1.18} accessibilityRole="header">
            {request?.intention ? `“${request.intention}”` : STRINGS.RESULT_FALLBACK_TITLE}
          </Txt>
          {draw && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <Pill border={c.mist} fill={c.ink} style={{ paddingHorizontal: 12, paddingVertical: 5, gap: 8 }}>
                <Txt size={14} color="pearl" leading={1.3}>{STRINGS.DOMINANT_ELEMENT}</Txt>
                <Txt face="semibold" size={14} leading={1.3}>
                  {draw.interpretation.dominant_element_vi || draw.interpretation.dominant_element}
                </Txt>
              </Pill>
              {draw.interpretation.cards.length > 1 && (
                <Pill border={c.mist} fill={c.ink} style={{ paddingHorizontal: 12, paddingVertical: 5, gap: 8 }}>
                  <Txt size={14} color="pearl" leading={1.3}>{STRINGS.HARMONY}</Txt>
                  <Txt face="semibold" size={14} leading={1.3}>{harmonyLabel(draw.interpretation.overall_dignity_score)}</Txt>
                </Pill>
              )}
            </View>
          )}
        </View>

        {error && !draw ? (
          <View style={{ gap: 16, padding: 18, borderRadius: theme.radius.lg, borderWidth: theme.border, borderColor: alpha(c.negative, 0.4), backgroundColor: alpha(c.negative, 0.1) }}>
            <Txt size={16} accessibilityRole="alert">{error}</Txt>
            <View style={{ flexDirection: "row", gap: 10 }}>
              <Btn label={STRINGS.RETRY} onPress={() => request && begin(request)} style={{ flex: 1 }} />
              <Btn kind="secondary" label={STRINGS.BACK} onPress={newReading} style={{ flex: 1 }} />
            </View>
          </View>
        ) : (
          <>
            <View style={{ gap: 18 }}>
              <SpreadBoard key={draw?.session_id ?? "pending"} spreadType={activeSpread} cards={cards} selectedIndex={selected} onSelect={setSelected} />
              {isRowSpread(activeSpread) ? (
                <SpreadCaptions spreadType={activeSpread} cards={cards} onSelect={setSelected} />
              ) : (
                <SpreadLegend spreadType={activeSpread} cards={cards} onSelect={setSelected} />
              )}
              {draw && <Txt size={14} color="pearl" style={{ textAlign: "center" }}>{STRINGS.TAP_HINT}</Txt>}
            </View>
            <AIReading
              text={text}
              isWaiting={phase === "drawing"}
              isStreaming={phase === "reading"}
              isDone={phase === "done"}
              stopped={stopped}
              error={draw ? error : null}
              onStop={stop}
            />
          </>
        )}

        <View style={{ gap: 6, borderTopWidth: theme.border, borderColor: c.veil, paddingTop: 16 }}>
          <Txt size={14} color="silver" leading={1.6}>{STRINGS.DISCLAIMER}</Txt>
          {draw && (
            <Txt size={14} color="silver">
              {`${STRINGS.ENTROPY_SOURCE}: ${QUANTUM_SOURCE_LABELS[draw.interpretation.quantum_source] ?? draw.interpretation.quantum_source}`}
            </Txt>
          )}
        </View>
      </ScrollView>

      {finished && (
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: Math.max(16, insets.bottom + 8),
            borderTopWidth: theme.border,
            borderColor: theme.hardShadow ? c.mist : c.veil,
            backgroundColor: alpha(c.void, 0.97),
          }}
        >
          {phase === "error" ? (
            <Btn kind="secondary" label={STRINGS.RETRY} onPress={() => request && begin(request)} style={{ flex: 1 }} />
          ) : text ? (
            <Btn kind="secondary" label={copied ? `✓ ${STRINGS.COPIED}` : STRINGS.COPY_SHORT} onPress={copy} style={{ flex: 1 }} />
          ) : null}
          <Btn label={STRINGS.NEW_READING} onPress={newReading} style={{ flex: 1 }} />
        </View>
      )}

      <CardSheet
        card={detail}
        interpretation={draw?.interpretation ?? null}
        onClose={() => setSelected(null)}
        onPrev={selected !== null && selected > 0 ? () => setSelected(selected - 1) : undefined}
        onNext={selected !== null && cards && selected < cards.length - 1 ? () => setSelected(selected + 1) : undefined}
      />
    </View>
  )
}
