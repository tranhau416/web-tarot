import { useState } from "react"
import { Image, Modal, Pressable, ScrollView, View } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { ELEMENT_VI, QUANTUM_SOURCE_LABELS, SUIT_VI, ZODIAC_MODE_VI } from "@shared/constants"
import type { CardInterpretation, InterpretationResult } from "@shared/types"
import { capitalize, cardImage, cardTitle, positionLabel, STRINGS } from "@/lib/cards"
import { useTheme } from "@/theme/ThemeContext"
import { alpha } from "@/theme/tokens"
import { OrientationTag } from "./SpreadBoard"
import { Btn, Pill, Txt } from "./ui"

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 2 }}>
      <Txt face="semibold" size={15} color="pearl">{label}</Txt>
      {children}
    </View>
  )
}

/** One card in detail: meaning first, technical numbers folded away at the end. */
function InterpretationPanel({ card, interpretation }: { card: CardInterpretation; interpretation: InterpretationResult }) {
  const { theme } = useTheme()
  const c = theme.colors
  const [showTech, setShowTech] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const reversed = card.orientation === "reversed"
  const keywords = reversed
    ? card.keywords_reversed_vi.length ? card.keywords_reversed_vi : card.keywords_reversed
    : card.keywords_upright_vi.length ? card.keywords_upright_vi : card.keywords_upright
  const tone = reversed ? c.reversed : c.upright
  const element = card.element ? ELEMENT_VI[card.element] : null
  const zodiac = card.zodiac_mode ? ZODIAC_MODE_VI[card.zodiac_mode] ?? card.zodiac_mode : null
  const astro = card.astro_decan_vi || card.astro_decan
  const image = cardImage(card.image_url)
  const w = card.dignity_weight
  const tech: [string, string][] = [
    ["Elemental dignity", `${w >= 0 ? "+" : ""}${w.toFixed(2)}`],
    [STRINGS.ENTROPY_SOURCE, QUANTUM_SOURCE_LABELS[interpretation.quantum_source] ?? interpretation.quantum_source],
    ["Byte chọn lá", String(card.raw_quantum_byte)],
    ...(card.orientation_byte !== null ? [["Byte chiều lá", String(card.orientation_byte)] as [string, string]] : []),
  ]

  return (
    <View style={{ gap: 22 }}>
      <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
        {image && !imageFailed && (
          <View style={{ width: 100, aspectRatio: 3 / 5, borderRadius: theme.hardShadow ? 0 : 10, overflow: "hidden", borderWidth: 1.5, borderColor: alpha(tone, 0.55) }}>
            <Image
              source={image}
              onError={() => setImageFailed(true)}
              accessibilityLabel={card.card_name}
              style={{ width: "100%", height: "100%", transform: reversed ? [{ rotate: "180deg" }] : undefined }}
            />
          </View>
        )}
        <View style={{ flex: 1, gap: 4 }}>
          <Txt size={14} color="silver">{`${card.position_index + 1} · ${positionLabel(card, interpretation.spread_type)}`}</Txt>
          <Txt face="display" size={30} leading={1.15} accessibilityRole="header">{cardTitle(card)}</Txt>
          {card.name_vi ? <Txt size={15} color="pearl">{card.card_name}</Txt> : null}
          <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 6 }}>
            <OrientationTag reversed={reversed} />
            <Txt size={14} color="pearl">{`${SUIT_VI[card.suit] ?? card.suit}${element ? ` · ${element}` : ""}`}</Txt>
          </View>
        </View>
      </View>

      {keywords.length > 0 && (
        <Row label={reversed ? STRINGS.MEANING_REVERSED : STRINGS.MEANING_UPRIGHT}>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {keywords.map((kw) => (
              <Pill key={kw} border={alpha(tone, 0.35)} fill={alpha(tone, 0.1)} style={{ paddingHorizontal: 12, paddingVertical: 6 }}>
                <Txt size={15} leading={1.25}>{kw}</Txt>
              </Pill>
            ))}
          </View>
        </Row>
      )}

      <Row label={STRINGS.TIMING}>
        <Txt size={16}>{`${capitalize(card.timing.range_vi || card.timing.timing_range)}.`}</Txt>
        {card.timing.notes_vi ? <Txt size={16} color="pearl">{card.timing.notes_vi}</Txt> : null}
      </Row>
      {interpretation.cards.length > 1 && (
        <Row label={STRINGS.NEIGHBOURS}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Txt size={12} leading={2} style={{ color: w > 0 ? c.positive : w < 0 ? c.negative : c.silver }}>
              {w > 0 ? "▲" : w < 0 ? "▼" : "●"}
            </Txt>
            <Txt size={16} style={{ flex: 1 }}>{`${capitalize(card.dignity_label_vi)}.`}</Txt>
          </View>
        </Row>
      )}
      {(astro || zodiac) && (
        <Row label={STRINGS.ASTROLOGY}>
          <Txt size={16}>
            {astro}
            {zodiac ? <Txt size={16} color="pearl">{`${astro ? " · " : ""}Cung ${zodiac.toLowerCase()}`}</Txt> : null}
          </Txt>
        </Row>
      )}

      <View style={{ borderWidth: theme.border, borderColor: c.mist, borderRadius: theme.radius.md - 2 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showTech }}
          onPress={() => setShowTech((v) => !v)}
          style={{ minHeight: 44, justifyContent: "center", paddingHorizontal: 14 }}
        >
          <Txt face="ui" size={15} color="pearl">{`${showTech ? "▾" : "▸"} ${STRINGS.TECHNICAL}`}</Txt>
        </Pressable>
        {showTech && (
          <View style={{ paddingHorizontal: 14, paddingBottom: 14, gap: 4 }}>
            {tech.map(([k, v]) => (
              <View key={k} style={{ flexDirection: "row", gap: 16 }}>
                <Txt size={14} color="silver" style={{ width: 130 }}>{k}</Txt>
                <Txt size={14} style={{ flex: 1, fontVariant: ["tabular-nums"] }}>{v}</Txt>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  )
}

/** Bottom sheet with one card's detail and previous / next; Android back closes it. */
export default function CardSheet({
  card,
  interpretation,
  onClose,
  onPrev,
  onNext,
}: {
  card: CardInterpretation | null
  interpretation: InterpretationResult | null
  onClose: () => void
  onPrev?: () => void
  onNext?: () => void
}) {
  const { theme } = useTheme()
  const c = theme.colors
  const insets = useSafeAreaInsets()
  const open = Boolean(card && interpretation)
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: c.scrim }}>
        <Pressable accessibilityLabel={STRINGS.CLOSE} onPress={onClose} style={{ flex: 1 }} />
        <View
          style={{
            maxHeight: "88%",
            backgroundColor: c.ink,
            borderTopLeftRadius: theme.hardShadow ? 0 : 22,
            borderTopRightRadius: theme.hardShadow ? 0 : 22,
            borderTopWidth: theme.border,
            borderColor: c.mist,
          }}
        >
          <View style={{ height: 52, alignItems: "center", justifyContent: "center", borderBottomWidth: theme.border, borderColor: c.mist }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: alpha(c.silver, 0.5) }} />
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={{ position: "absolute", right: 12, minHeight: 44, justifyContent: "center", paddingHorizontal: 8 }}
            >
              <Txt face="ui" size={16}>{STRINGS.CLOSE}</Txt>
            </Pressable>
          </View>
          <ScrollView style={{ flexGrow: 0, flexShrink: 1, minHeight: 0 }} contentContainerStyle={{ padding: 20 }}>
            {card && interpretation && <InterpretationPanel key={card.position_index} card={card} interpretation={interpretation} />}
          </ScrollView>
          <View
            style={{
              flexDirection: "row",
              gap: 10,
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: Math.max(20, insets.bottom + 8),
              borderTopWidth: theme.border,
              borderColor: c.mist,
            }}
          >
            <Btn kind="secondary" label={`← ${STRINGS.PREV_CARD}`} onPress={onPrev} disabled={!onPrev} style={{ flex: 1 }} height={48} />
            <Btn kind="secondary" label={`${STRINGS.NEXT_CARD} →`} onPress={onNext} disabled={!onNext} style={{ flex: 1 }} height={48} />
          </View>
        </View>
      </View>
    </Modal>
  )
}
