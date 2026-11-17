import { useEffect } from "react"
import { View } from "react-native"
import { DarkTheme, DefaultTheme, SplashScreen, Stack, ThemeProvider as NavigationThemeProvider } from "expo-router"
import { StatusBar } from "expo-status-bar"
import * as SystemUI from "expo-system-ui"
import { useFonts } from "expo-font"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Baloo2_600SemiBold } from "@expo-google-fonts/baloo-2/600SemiBold"
import { BeVietnamPro_400Regular } from "@expo-google-fonts/be-vietnam-pro/400Regular"
import { BeVietnamPro_400Regular_Italic } from "@expo-google-fonts/be-vietnam-pro/400Regular_Italic"
import { BeVietnamPro_500Medium } from "@expo-google-fonts/be-vietnam-pro/500Medium"
import { BeVietnamPro_600SemiBold } from "@expo-google-fonts/be-vietnam-pro/600SemiBold"
import { BeVietnamPro_700Bold } from "@expo-google-fonts/be-vietnam-pro/700Bold"
import { Fraunces_500Medium } from "@expo-google-fonts/fraunces/500Medium"
import { Nunito_400Regular } from "@expo-google-fonts/nunito/400Regular"
import { Nunito_400Regular_Italic } from "@expo-google-fonts/nunito/400Regular_Italic"
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold"
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold"
import { VT323_400Regular } from "@expo-google-fonts/vt323/400Regular"
import AmbientLayer from "@/components/AmbientLayer"
import LegalGate from "@/components/LegalGate"
import { ThemeProvider, useTheme } from "@/theme/ThemeContext"

SplashScreen.preventAutoHideAsync().catch(() => {})

function navigationTheme(dark: boolean, primary: string) {
  const base = dark ? DarkTheme : DefaultTheme
  return { ...base, colors: { ...base.colors, primary, background: "transparent", card: "transparent" } }
}

function Shell() {
  const { theme, ready } = useTheme()
  const [fontsLoaded, fontError] = useFonts({
    BeVietnamPro_400Regular,
    BeVietnamPro_400Regular_Italic,
    BeVietnamPro_500Medium,
    BeVietnamPro_600SemiBold,
    BeVietnamPro_700Bold,
    Fraunces_500Medium,
    Nunito_400Regular,
    Nunito_400Regular_Italic,
    Nunito_600SemiBold,
    Nunito_700Bold,
    VT323_400Regular,
    Baloo2_600SemiBold,
  })
  const loaded = ready && (fontsLoaded || Boolean(fontError))

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.void).catch(() => {})
  }, [theme])

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {})
  }, [loaded])

  if (!loaded) return null

  return (
    <View style={{ flex: 1, overflow: "hidden", backgroundColor: theme.colors.void }}>
      <StatusBar style={theme.dark ? "light" : "dark"} />
      <AmbientLayer />
      <LegalGate>
        {/* Transparent navigation background so the theme ground and the ambient layer show through */}
        <NavigationThemeProvider value={navigationTheme(theme.dark, theme.colors.gold)}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "fade",
              contentStyle: { backgroundColor: "transparent" },
            }}
          />
        </NavigationThemeProvider>
      </LegalGate>
    </View>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Shell />
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
