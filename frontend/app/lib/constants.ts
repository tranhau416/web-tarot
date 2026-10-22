import type { SpreadType } from "./types";

/** localStorage keys */
export const STORAGE_KEYS = {
  ADULT_CONFIRMED: "tarot_adult_confirmed",
  HISTORY: "tarot_history_v1",
} as const;

/** Base delay (ms) before first card flips */
export const CARD_FLIP_DELAY_BASE = 350;

/** Incremental delay (ms) between each card flip */
export const CARD_FLIP_DELAY_INTERVAL = 220;

/** Mặt sau lá bài ("Roses & Lilies", RWS 1909) — xem public/cards/CREDITS.txt */
export const CARD_BACK_IMAGE = "/cards/back.webp";

/** Nhãn hiển thị cho nguồn entropy trả về từ backend */
export const QUANTUM_SOURCE_LABELS: Record<string, string> = {
  anu_qrng: "ANU Quantum RNG",
  random_org: "Random.org",
  os_entropy: "Entropy hệ điều hành (dự phòng)",
};

export const ELEMENT_VI: Record<string, string> = {
  fire: "Lửa",
  water: "Nước",
  air: "Khí",
  earth: "Đất",
  spirit: "Tinh thần",
};

export const ZODIAC_MODE_VI: Record<string, string> = {
  cardinal: "Thống lĩnh",
  fixed: "Kiên định",
  mutable: "Linh hoạt",
};

export const SUIT_VI: Record<string, string> = {
  major_arcana: "Bộ Ẩn Chính",
  wands: "Bộ Gậy",
  cups: "Bộ Cốc",
  swords: "Bộ Kiếm",
  pentacles: "Bộ Tiền",
};

export interface SpreadDefinition {
  type: SpreadType;
  name: string;
  /** Dòng phụ dưới tên kiểu trải (đã gồm số lá khi tên chưa nói rõ) */
  description: string;
  /** Vietnamese position labels, same order as the backend's POSITION_LABELS */
  positions: string[];
}

export const SPREADS: SpreadDefinition[] = [
  {
    type: "single",
    name: "Một lá",
    description: "1 lá · trả lời nhanh",
    positions: ["Lá bài chính"],
  },
  {
    type: "three_card",
    name: "Ba lá",
    description: "Quá khứ · Hiện tại · Tương lai",
    positions: ["Quá khứ", "Hiện tại", "Tương lai"],
  },
  {
    type: "horseshoe",
    name: "Móng ngựa",
    description: "7 lá · hành trình của một vấn đề",
    positions: [
      "Quá khứ", "Hiện tại", "Ảnh hưởng tiềm ẩn", "Trở ngại",
      "Tác động bên ngoài", "Hy vọng & nỗi sợ", "Kết quả",
    ],
  },
  {
    type: "celtic_cross",
    name: "Celtic Cross",
    description: "10 lá · nhìn sâu vào tình huống",
    positions: [
      "Tình huống hiện tại", "Thử thách cắt ngang", "Gốc rễ", "Quá khứ", "Mục tiêu",
      "Tương lai gần", "Bản thân", "Môi trường xung quanh", "Hy vọng & nỗi sợ", "Kết quả",
    ],
  },
];

export const SPREADS_BY_TYPE = Object.fromEntries(SPREADS.map((s) => [s.type, s])) as Record<
  SpreadType,
  SpreadDefinition
>;

/** "Ba lá", "Celtic Cross · 10 lá" — tên kiểu trải kèm số lá khi tên chưa nói rõ */
export function spreadSummary(type: SpreadType): string {
  const spread = SPREADS_BY_TYPE[type];
  const count = spread.positions.length;
  return count > 3 ? `${spread.name} · ${count} lá` : spread.name;
}
