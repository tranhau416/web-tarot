import { Animated, Image, View } from "react-native"
import { cardImage, STRINGS } from "@/lib/cards"
import { useLoop } from "@/lib/motion"
import { useTheme } from "@/theme/ThemeContext"
import { Daisy, PixelHeart } from "./Marks"

const FAN = [
  { file: "00-the-fool.webp", x: -78, y: 22, rotate: "-10deg", width: 92, phase: 0.25 },
  { file: "21-the-world.webp", x: 78, y: 22, rotate: "10deg", width: 92, phase: 0.65 },
  { file: "17-the-star.webp", x: 0, y: 4, rotate: "0deg", width: 104, phase: 0 },
]

const SPARKS = [
  { left: "8%", top: "12%", size: 22 },
  { left: "84%", top: "6%", size: 16 },
  { left: "80%", top: "80%", size: 14 },
  { left: "14%", top: "84%", size: 12 },
] as const

function FanCard({ file, x, y, rotate, width, phase, z }: (typeof FAN)[number] & { z: number }) {
  const { theme } = useTheme()
  const t = useLoop(6000, { phase, yoyo: true })
  const height = (width * 5) / 3
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: "50%",
        top: y,
        width,
        height,
        marginLeft: -width / 2 + x,
        zIndex: z,
        transform: [{ rotate }, { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) }],
        borderRadius: theme.hardShadow ? 0 : 8,
        borderWidth: theme.id === "daisy" ? 4 : theme.hardShadow ? 2 : 0,
        borderColor: theme.id === "daisy" ? "#FFFFFF" : theme.colors.mist,
        overflow: "hidden",
        backgroundColor: theme.colors.veil,
        elevation: theme.hardShadow ? 0 : 8,
        shadowColor: "#000",
        shadowOpacity: theme.dark ? 0.5 : 0.18,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 10 },
      }}
    >
      <Image source={cardImage(file) ?? undefined} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
    </Animated.View>
  )
}

function Sway({ children, phase }: { children: React.ReactNode; phase: number }) {
  const t = useLoop(5000, { phase, yoyo: true })
  return (
    <Animated.View style={{ transform: [{ rotate: t.interpolate({ inputRange: [0, 1], outputRange: ["-7deg", "7deg"] }) }] }}>
      {children}
    </Animated.View>
  )
}

function Blink({ children, phase }: { children: React.ReactNode; phase: number }) {
  const t = useLoop(1400, { phase, yoyo: true })
  return <Animated.View style={{ opacity: t.interpolate({ inputRange: [0, 1], outputRange: [1, 0.25] }) }}>{children}</Animated.View>
}

/** Three Rider-Waite-Smith cards fanned out, floating out of step; theme sparkles around them. */
export default function HeroFan() {
  const { theme } = useTheme()
  return (
    <View
      accessible
      accessibilityLabel={STRINGS.HERO_CAPTION}
      style={{ height: 200, marginHorizontal: -16, overflow: "hidden" }}
    >
      {FAN.map((card, i) => (
        <FanCard key={card.file} {...card} z={i === 2 ? 2 : 1} />
      ))}
      {theme.id !== "night" &&
        SPARKS.map((s, i) => (
          <View key={i} style={{ position: "absolute", left: s.left, top: s.top }}>
            {theme.id === "daisy" ? (
              <Sway phase={i * 0.26}><Daisy size={s.size + 14} /></Sway>
            ) : (
              <Blink phase={i * 0.32}><PixelHeart size={s.size} fill={theme.colors.gold} /></Blink>
            )}
          </View>
        ))}
    </View>
  )
}
