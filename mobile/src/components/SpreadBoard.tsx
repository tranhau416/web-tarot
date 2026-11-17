import { memo, useEffect, useRef, useState } from "react"
import { Animated, Easing, Image, Platform, Pressable, View } from "react-native"
import * as Haptics from "expo-haptics"
import { CARD_FLIP_DELAY_BASE, CARD_FLIP_DELAY_INTERVAL, SPREADS_BY_TYPE } from "@shared/constants"
import { CARD_W, SPREAD_LAYOUTS, slotStyle } from "@shared/spreadLayouts"
import type { CardInterpretation, SpreadType } from "@shared/types"
import { CARD_BACK, cardImage, cardTitle, positionLabel, STRINGS } from "@/lib/cards"
import { NATIVE_DRIVER, useLoop, useReducedMotion } from "@/lib/motion"
import { useTheme } from "@/theme/ThemeContext"
import { alpha } from "@/theme/tokens"
import { Pill, Txt } from "./ui"

/** Cards in one row (one or three): names go under each card instead of a legend. */
export function isRowSpread(spreadType: SpreadType): boolean {
  return SPREAD_LAYOUTS[spreadType].slots.every((slot) => slot.y === 0)
}

/** Upright / reversed in words and an arrow, never colour alone. */
export function OrientationTag({ reversed }: { reversed: boolean }) {
  const { theme } = useTheme()
  const color = reversed ? theme.colors.reversed : theme.colors.upright
  return (
    <Pill border={alpha(color, 0.55)}>
      <Txt size={13} leading={1.3} style={{ color }}>{reversed ? "↓" : "↑"}</Txt>
      <Txt face="medium" size={13} leading={1.3} style={{ color }}>{reversed ? STRINGS.REVERSED : STRINGS.UPRIGHT}</Txt>
    </Pill>
  )
}

/** Drawn face for a card without an image. */
function DrawnFace({ card }: { card: CardInterpretation }) {
  const { theme } = useTheme()
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 6, backgroundColor: theme.colors.veil }}>
      <Txt size={18} color="gold">✦</Txt>
      <Txt size={13} color="pearl" style={{ textAlign: "center" }}>{cardTitle(card)}</Txt>
    </View>
  )
}

interface CardSlotProps {
  index: number
  card: CardInterpretation | null
  label: string
  crossing: boolean
  style: ReturnType<typeof slotStyle>
  isSelected: boolean
  onSelect: (index: number) => void
}

/**
 * One position on the board. While drawing: a face-down card dealt in and breathing.
 * When the card arrives: it flips (scaleX through zero, swapping faces at the edge) after a
 * staggered delay, reversed cards upside down.
 */
const CardSlot = memo(function CardSlot({ index, card, label, crossing, style, isSelected, onSelect }: CardSlotProps) {
  const { theme } = useTheme()
  const c = theme.colors
  const reduced = useReducedMotion()
  const [showFace, setShowFace] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)
  const deal = useRef(new Animated.Value(card ? 1 : 0)).current
  const flip = useRef(new Animated.Value(1)).current
  const breathe = useLoop(1800, { phase: (index * 0.12) % 1, yoyo: true, enabled: !card })

  useEffect(() => {
    Animated.timing(deal, {
      toValue: 1,
      duration: reduced ? 0 : 550,
      delay: reduced ? 0 : index * 70,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1),
      useNativeDriver: NATIVE_DRIVER,
    }).start()
  }, [deal, index, reduced])

  useEffect(() => {
    if (!card) return
    const timer = setTimeout(() => {
      if (reduced) {
        setShowFace(true)
        return
      }
      Animated.timing(flip, { toValue: 0, duration: 230, easing: Easing.in(Easing.quad), useNativeDriver: NATIVE_DRIVER }).start(() => {
        setShowFace(true)
        if (Platform.OS !== "web") Haptics.selectionAsync().catch(() => {})
        Animated.timing(flip, { toValue: 1, duration: 260, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE_DRIVER }).start()
      })
    }, CARD_FLIP_DELAY_BASE + index * CARD_FLIP_DELAY_INTERVAL)
    return () => clearTimeout(timer)
  }, [card, index, flip, reduced])

  const reversed = card?.orientation === "reversed"
  const image = card ? cardImage(card.image_url) : null
  const radius = theme.hardShadow ? 0 : 9
  const faceUp = card && showFace

  const body = (
    <Animated.View
      style={{
        flex: 1,
        opacity: deal,
        transform: [
          { translateY: deal.interpolate({ inputRange: [0, 1], outputRange: [-24, 0] }) },
          { scale: deal.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) },
          { scaleX: flip },
        ],
      }}
    >
      <Animated.View
        style={{
          flex: 1,
          borderRadius: radius,
          overflow: "hidden",
          borderWidth: faceUp ? Math.max(1.5, theme.border) : theme.border,
          borderColor: faceUp ? (isSelected ? c.gold : alpha(reversed ? c.reversed : c.upright, 0.55)) : c.mist,
          backgroundColor: c.ink,
          opacity: card ? 1 : breathe.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
        }}
      >
        {faceUp ? (
          image && !imageFailed ? (
            <Image
              source={image}
              onError={() => setImageFailed(true)}
              resizeMode="cover"
              style={{ width: "100%", height: "100%", transform: reversed ? [{ rotate: "180deg" }] : undefined }}
            />
          ) : (
            <DrawnFace card={card} />
          )
        ) : (
          <Image source={CARD_BACK ?? undefined} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
        )}
      </Animated.View>
      <View
        style={{
          position: "absolute",
          top: 4,
          left: 4,
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: alpha(c.void, 0.85),
          transform: crossing ? [{ rotate: "-90deg" }] : undefined,
        }}
      >
        <Txt face="semibold" size={12} leading={1.2}>{String(index + 1)}</Txt>
      </View>
    </Animated.View>
  )

  const position = {
    position: "absolute" as const,
    ...style,
    zIndex: crossing ? 2 : 1,
    transform: crossing ? [{ rotate: "90deg" }] : undefined,
  }

  if (!card) {
    return (
      <View style={position} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {body}
      </View>
    )
  }
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${index + 1}. ${label}: ${cardTitle(card)}, ${reversed ? STRINGS.REVERSED : STRINGS.UPRIGHT}`}
      onPress={() => onSelect(index)}
      style={[position, isSelected && { borderRadius: radius + 3, borderWidth: 2, borderColor: c.gold, margin: -3, padding: 1 }]}
    >
      {body}
    </Pressable>
  )
})

/** The board: every card in its spread's real geometry (Celtic Cross, horseshoe…). */
export default function SpreadBoard({
  spreadType,
  cards,
  selectedIndex,
  onSelect,
}: {
  spreadType: SpreadType
  cards: CardInterpretation[] | null
  selectedIndex: number | null
  onSelect: (index: number) => void
}) {
  const layout = SPREAD_LAYOUTS[spreadType]
  const positions = SPREADS_BY_TYPE[spreadType].positions
  return (
    <View style={{ width: "100%", maxWidth: layout.maxWidth, alignSelf: "center", aspectRatio: layout.width / layout.height }}>
      {layout.slots.map((slot, i) => (
        <CardSlot
          key={i}
          index={i}
          card={cards?.[i] ?? null}
          label={cards?.[i] ? positionLabel(cards[i], spreadType) : positions[i]}
          crossing={Boolean(slot.crossing)}
          style={slotStyle(layout, slot)}
          isSelected={selectedIndex === i}
          onSelect={onSelect}
        />
      ))}
    </View>
  )
}

function Skeleton({ width }: { width: number | `${number}%` }) {
  const { theme } = useTheme()
  const t = useLoop(1600, { yoyo: true })
  return (
    <Animated.View
      style={{ height: 14, width, borderRadius: 4, backgroundColor: theme.colors.veil, opacity: t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.5] }) }}
    />
  )
}

/** Position, name and orientation under each card, aligned with the board's columns. */
export function SpreadCaptions({ spreadType, cards, onSelect }: { spreadType: SpreadType; cards: CardInterpretation[] | null; onSelect: (i: number) => void }) {
  const layout = SPREAD_LAYOUTS[spreadType]
  const positions = SPREADS_BY_TYPE[spreadType].positions
  const cardPct = (CARD_W / layout.width) * 100
  const gapPct = layout.slots.length > 1 ? ((layout.slots[1].x - CARD_W) / layout.width) * 100 : 0
  return (
    <View style={{ width: "100%", maxWidth: layout.maxWidth, alignSelf: "center", flexDirection: "row", columnGap: `${gapPct}%` }}>
      {positions.map((pos, i) => {
        const card = cards?.[i]
        return (
          <Pressable
            key={pos}
            disabled={!card}
            onPress={() => onSelect(i)}
            accessibilityRole={card ? "button" : undefined}
            style={{ width: `${cardPct}%`, gap: 4 }}
          >
            <Txt size={13} color="silver" leading={1.3}>{card ? positionLabel(card, spreadType) : pos}</Txt>
            {card ? (
              <>
                <Txt face="semibold" size={15} leading={1.3}>{cardTitle(card)}</Txt>
                <OrientationTag reversed={card.orientation === "reversed"} />
              </>
            ) : (
              <Skeleton width="80%" />
            )}
          </Pressable>
        )
      })}
    </View>
  )
}

/** Position → card list for spreads of seven or ten cards; also the easiest way to pick a card. */
export function SpreadLegend({ spreadType, cards, onSelect }: { spreadType: SpreadType; cards: CardInterpretation[] | null; onSelect: (i: number) => void }) {
  const { theme } = useTheme()
  const c = theme.colors
  const positions = SPREADS_BY_TYPE[spreadType].positions
  return (
    <View style={{ gap: 8 }}>
      {positions.map((pos, i) => {
        const card = cards?.[i]
        return (
          <Pressable
            key={pos + i}
            disabled={!card}
            onPress={() => onSelect(i)}
            accessibilityRole={card ? "button" : undefined}
            style={({ pressed }) => ({
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderRadius: theme.radius.md - 2,
              borderWidth: theme.border,
              borderColor: card ? c.mist : alpha(c.mist, 0.6),
              backgroundColor: pressed ? c.veil : card ? c.ink : "transparent",
            })}
          >
            <View
              style={{ width: 28, height: 28, borderRadius: 14, borderWidth: theme.border, borderColor: c.mist, alignItems: "center", justifyContent: "center" }}
            >
              <Txt face="semibold" size={13} color="pearl" leading={1.2}>{String(i + 1)}</Txt>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Txt size={14} color="silver" leading={1.3}>{card ? positionLabel(card, spreadType) : pos}</Txt>
              {card ? <Txt face="semibold" size={16} leading={1.3} numberOfLines={1}>{cardTitle(card)}</Txt> : <Skeleton width={112} />}
            </View>
            {card && <OrientationTag reversed={card.orientation === "reversed"} />}
          </Pressable>
        )
      })}
    </View>
  )
}
