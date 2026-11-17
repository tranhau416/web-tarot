import { Pressable, View } from "react-native"
import { SPREADS } from "@shared/constants"
import type { SpreadType } from "@shared/types"
import { STRINGS } from "@/lib/cards"
import { useTheme } from "@/theme/ThemeContext"
import { alpha } from "@/theme/tokens"
import { SpreadDiagram } from "./Marks"
import { Txt } from "./ui"

/** Four spreads as radio tiles, each with a mini diagram of its layout. */
export default function SpreadSelector({ selected, onChange }: { selected: SpreadType; onChange: (t: SpreadType) => void }) {
  const { theme } = useTheme()
  const c = theme.colors
  return (
    <View style={{ gap: 10 }}>
      <Txt face="semibold" size={16}>{STRINGS.SPREAD_LABEL}</Txt>
      <View accessibilityRole="radiogroup" accessibilityLabel={STRINGS.SPREAD_LABEL} style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
        {SPREADS.map((spread) => {
          const isSelected = selected === spread.type
          return (
            <Pressable
              key={spread.type}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${spread.name}. ${spread.description}`}
              onPress={() => onChange(spread.type)}
              style={{
                flexBasis: "47%",
                flexGrow: 1,
                gap: 10,
                padding: 14,
                borderRadius: theme.radius.lg - 4,
                borderWidth: isSelected ? Math.max(2, theme.border) : theme.border,
                borderColor: isSelected ? c.gold : c.mist,
                backgroundColor: isSelected ? alpha(c.gold, 0.08) : c.ink,
              }}
            >
              <SpreadDiagram type={spread.type} color={isSelected ? c.gold : alpha(c.silver, 0.6)} />
              <View style={{ gap: 2 }}>
                <Txt face="semibold" size={16}>{spread.name}</Txt>
                <Txt size={14} color="pearl" leading={1.35}>{spread.description}</Txt>
              </View>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
