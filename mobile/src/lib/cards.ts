import type { ImageSourcePropType } from "react-native"
import { CARD_BACK_IMAGE, SPREADS_BY_TYPE } from "@shared/constants"
import { STRINGS as WEB_STRINGS } from "@shared/strings"
import type { CardInterpretation, SpreadType } from "@shared/types"
import { CARD_IMAGES } from "./cardImages"

/** UI copy shared with the website; the lines about "this browser" read "this phone" here. */
export const STRINGS = {
  ...WEB_STRINGS,
  GATE_REMEMBERED: "Lựa chọn được ghi nhớ trên điện thoại này.",
  HISTORY_SUBTITLE: "Các lần đọc gần đây được lưu trên điện thoại này.",
  OPEN_HISTORY: "Mở lịch sử",
}

/** `/cards/00-the-fool.webp` (as the backend sends it) → the bundled image. */
export function cardImage(url: string | null | undefined): ImageSourcePropType | null {
  if (!url) return null
  return CARD_IMAGES[url.split("/").pop() ?? ""] ?? null
}

export const CARD_BACK = cardImage(CARD_BACK_IMAGE)

export function cardTitle(card: CardInterpretation): string {
  return card.name_vi || card.card_name
}

export function positionLabel(card: CardInterpretation, spreadType: SpreadType): string {
  return card.position_label_vi || SPREADS_BY_TYPE[spreadType].positions[card.position_index] || ""
}

export function harmonyLabel(score: number): string {
  if (score > 0.15) return STRINGS.HARMONY_STRONG
  if (score < -0.15) return STRINGS.HARMONY_TENSE
  return STRINGS.HARMONY_NEUTRAL
}

export function capitalize(text: string): string {
  return text ? text[0].toUpperCase() + text.slice(1) : text
}
