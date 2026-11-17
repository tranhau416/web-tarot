import { useEffect, useRef, useState } from "react"
import { AccessibilityInfo, Animated, Easing, Platform } from "react-native"

/** Animated's native driver does not exist on web (used for the web preview build). */
export const NATIVE_DRIVER = Platform.OS !== "web"

/** The system "remove animations" setting; motion is skipped while it is on. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {})
    const sub = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced)
    return () => sub.remove()
  }, [])
  return reduced
}

/**
 * A value that runs 0 → 1 over `duration` ms forever (with `yoyo`: 0 → 1 → 0, eased).
 * `phase` (0–1) starts the first lap part-way, so staggered particles are on screen at once
 * instead of waiting for their turn. Stays at 0 when motion is reduced.
 */
export function useLoop(duration: number, { phase = 0, yoyo = false, enabled = true } = {}) {
  const value = useRef(new Animated.Value(phase)).current
  const reduced = useReducedMotion()
  useEffect(() => {
    if (!enabled || reduced) {
      value.setValue(0)
      return
    }
    const easing = yoyo ? Easing.inOut(Easing.sin) : Easing.linear
    const to = (toValue: number, ms: number) =>
      Animated.timing(value, { toValue, duration: ms, easing, useNativeDriver: NATIVE_DRIVER })
    const lap = yoyo
      ? Animated.sequence([to(1, duration / 2), to(0, duration / 2)])
      : Animated.sequence([to(1, duration), Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: NATIVE_DRIVER })])
    const loop = Animated.loop(lap)
    value.setValue(yoyo ? 0 : phase)
    // yoyo: stagger by waiting; linear: run the rest of the first lap from `phase`
    const first = yoyo ? Animated.delay(phase * duration) : Animated.sequence([to(1, duration * (1 - phase)), to(0, 0)])
    first.start(({ finished }) => finished && loop.start())
    return () => {
      first.stop()
      loop.stop()
    }
  }, [value, duration, phase, yoyo, enabled, reduced])
  return value
}
