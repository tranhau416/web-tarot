import { Animated, StyleSheet, useWindowDimensions, View } from "react-native"
import Svg, { Ellipse } from "react-native-svg"
import { useLoop, useReducedMotion } from "@/lib/motion"
import { useTheme } from "@/theme/ThemeContext"
import { Daisy, PixelHeart } from "./Marks"

/**
 * Background motion behind every screen, one kind per theme (same as the website's AmbientLayer):
 * twinkling stars (night), pixel hearts and sparkles rising (pixel), daisy petals falling (daisy).
 * Hidden entirely when the system asks for reduced motion.
 */

// Fixed positions so the layout is stable between renders: [left %, top %, size, offset ms, duration ms]
const STARS: [number, number, number, number, number][] = [
  [6, 12, 2, 0, 3400], [14, 38, 3, 1200, 4100], [22, 8, 2, 2100, 3000], [31, 26, 2, 600, 3800],
  [39, 62, 3, 1800, 4400], [47, 16, 2, 2600, 3200], [55, 44, 2, 300, 3600], [63, 9, 3, 1500, 4000],
  [71, 33, 2, 2900, 3300], [79, 58, 2, 900, 4200], [87, 20, 3, 2300, 3500], [94, 46, 2, 1100, 3900],
  [10, 74, 2, 2700, 4300], [27, 86, 3, 400, 3700], [52, 80, 2, 1600, 3100], [74, 90, 2, 2000, 4500],
]

// [left %, size, offset into the first lap ms, duration ms, heart?]
const RISERS: [number, number, number, number, boolean][] = [
  [5, 14, 0, 17000, true], [18, 10, 6000, 21000, false], [33, 12, 11000, 18000, true], [48, 9, 3000, 23000, false],
  [62, 13, 8000, 19000, true], [76, 10, 14000, 22000, false], [90, 15, 2000, 20000, true],
]

// [left %, size, offset into the first lap ms, duration ms, whole flower?]
const PETALS: [number, number, number, number, boolean][] = [
  [3, 12, 0, 19000, false], [15, 18, 7000, 23000, true], [28, 10, 3000, 17000, false], [41, 13, 12000, 21000, false],
  [55, 16, 5000, 25000, true], [68, 11, 9000, 18000, false], [80, 14, 1000, 22000, false], [92, 18, 13000, 26000, true],
]

function Star({ left, top, size, delay, duration, gold }: { left: number; top: number; size: number; delay: number; duration: number; gold: boolean }) {
  const { theme } = useTheme()
  const t = useLoop(duration, { phase: (delay % duration) / duration, yoyo: true })
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        borderRadius: size,
        backgroundColor: gold ? theme.colors.gold : theme.colors.light,
        opacity: t.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.9] }),
        transform: [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }],
      }}
    />
  )
}

function Riser({ left, size, delay, duration, heart, height }: { left: number; size: number; delay: number; duration: number; heart: boolean; height: number }) {
  const { theme } = useTheme()
  const t = useLoop(duration, { phase: delay / duration })
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: `${left}%`,
        top: height,
        opacity: t.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 0.85, 0.85, 0] }),
        transform: [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -height * 1.15] }) }],
      }}
    >
      {heart ? (
        <PixelHeart size={size} fill={theme.colors.gold} />
      ) : (
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
          <View style={{ position: "absolute", width: size / 5, height: size, backgroundColor: theme.colors.gold }} />
          <View style={{ position: "absolute", width: size, height: size / 5, backgroundColor: theme.colors.gold }} />
        </View>
      )}
    </Animated.View>
  )
}

function Petal({ left, size, delay, duration, flower, width, height }: { left: number; size: number; delay: number; duration: number; flower: boolean; width: number; height: number }) {
  const t = useLoop(duration, { phase: delay / duration })
  return (
    <Animated.View
      style={{
        position: "absolute",
        left: `${left}%`,
        top: -32,
        opacity: t.interpolate({ inputRange: [0, 0.08, 0.88, 1], outputRange: [0, 0.95, 0.95, 0] }),
        transform: [
          { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, height * 1.15] }) },
          { translateX: t.interpolate({ inputRange: [0, 1], outputRange: [0, width * 0.12] }) },
          { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "560deg"] }) },
        ],
      }}
    >
      {flower ? (
        <Daisy size={size} />
      ) : (
        <Svg width={size / 2.2} height={size} viewBox="0 0 10 22">
          <Ellipse cx={5} cy={11} rx={4} ry={10} fill="#FFFFFF" stroke="#C9D9B0" strokeWidth={1} />
        </Svg>
      )}
    </Animated.View>
  )
}

export default function AmbientLayer() {
  const { theme } = useTheme()
  const { width, height } = useWindowDimensions()
  const reduced = useReducedMotion()
  if (reduced) return null
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, { overflow: "hidden" }]}>
      {theme.id === "night" &&
        STARS.map(([left, top, size, delay, duration], i) => (
          <Star key={i} left={left} top={top} size={size} delay={delay} duration={duration} gold={i % 4 === 0} />
        ))}
      {theme.id === "pixel" &&
        RISERS.map(([left, size, delay, duration, heart], i) => (
          <Riser key={i} left={left} size={size} delay={delay} duration={duration} heart={heart} height={height} />
        ))}
      {theme.id === "daisy" &&
        PETALS.map(([left, size, delay, duration, flower], i) => (
          <Petal key={i} left={left} size={size} delay={delay} duration={duration} flower={flower} width={width} height={height} />
        ))}
    </View>
  )
}
