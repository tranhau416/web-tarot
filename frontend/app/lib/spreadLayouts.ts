import type { SpreadType } from "./types"

/**
 * Hình học của từng kiểu trải bài, tính theo đơn vị "chiều rộng một lá" (lá cao 5/3).
 * Dùng chung cho sơ đồ thu nhỏ ở SpreadSelector và bàn trải bài ở SpreadBoard,
 * theo đúng thứ tự vị trí của backend (POSITION_LABELS).
 */

export const CARD_W = 1
export const CARD_H = 5 / 3

export interface SlotGeometry {
  x: number
  y: number
  /** Lá "Thử thách cắt ngang" của Celtic Cross nằm ngang đè lên lá 1 */
  crossing?: boolean
}

export interface SpreadLayout {
  width: number
  height: number
  slots: SlotGeometry[]
  /** Bề rộng tối đa của bàn trải (px) để lá không quá to với ít lá */
  maxWidth: number
}

const GAP_X = 0.18
const GAP_Y = 0.14
const ROW = CARD_H + GAP_Y

function threeCard(): SpreadLayout {
  const step = CARD_W + GAP_X * 1.5
  return {
    width: step * 2 + CARD_W,
    height: CARD_H,
    slots: [0, 1, 2].map((i) => ({ x: i * step, y: 0 })),
    maxWidth: 440,
  }
}

/** Móng ngựa hình chữ U: đi xuống từ trái, chạm đáy ở lá 4, đi lên bên phải. */
function horseshoe(): SpreadLayout {
  const step = CARD_W + GAP_X
  const dip = CARD_H * 0.42
  const ys = [0, ROW, ROW + dip, ROW + dip * 1.6, ROW + dip, ROW, 0]
  const xs = [0, 0, 1, 2, 3, 4, 4].map((c) => c * step)
  return {
    width: step * 4 + CARD_W,
    height: ROW + dip * 1.6 + CARD_H,
    slots: xs.map((x, i) => ({ x, y: ys[i] })),
    maxWidth: 560,
  }
}

/**
 * Celtic Cross: thập tự (1 giữa, 2 cắt ngang, 3 dưới, 4 trái, 5 trên, 6 phải)
 * và cột "quyền trượng" 7→10 từ dưới lên ở bên phải.
 */
function celticCross(): SpreadLayout {
  const crossGap = 0.42 // đủ rộng để lá nằm ngang không chạm lá 4 và 6
  const colX = [0, CARD_W + crossGap, 2 * (CARD_W + crossGap)]
  const staffX = colX[2] + CARD_W + 0.55
  const height = 3 * ROW + CARD_H
  const centerY = (height - CARD_H) / 2
  const staffY = (k: number) => 3 * ROW - k * ROW // k = 0 là lá 7 (dưới cùng)
  return {
    width: staffX + CARD_W,
    height,
    slots: [
      { x: colX[1], y: centerY },
      { x: colX[1], y: centerY, crossing: true },
      { x: colX[1], y: centerY + ROW },
      { x: colX[0], y: centerY },
      { x: colX[1], y: centerY - ROW },
      { x: colX[2], y: centerY },
      { x: staffX, y: staffY(0) },
      { x: staffX, y: staffY(1) },
      { x: staffX, y: staffY(2) },
      { x: staffX, y: staffY(3) },
    ],
    maxWidth: 420,
  }
}

export const SPREAD_LAYOUTS: Record<SpreadType, SpreadLayout> = {
  single: { width: CARD_W, height: CARD_H, slots: [{ x: 0, y: 0 }], maxWidth: 190 },
  three_card: threeCard(),
  horseshoe: horseshoe(),
  celtic_cross: celticCross(),
}

/** Vị trí tuyệt đối (theo %) của một ô trong khung có tỉ lệ width:height của layout. */
export function slotStyle(layout: SpreadLayout, slot: SlotGeometry) {
  return {
    left: `${(slot.x / layout.width) * 100}%`,
    top: `${(slot.y / layout.height) * 100}%`,
    width: `${(CARD_W / layout.width) * 100}%`,
    height: `${(CARD_H / layout.height) * 100}%`,
  }
}
