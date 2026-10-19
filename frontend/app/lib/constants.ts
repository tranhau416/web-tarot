/** localStorage key for adult confirmation */
export const STORAGE_KEYS = {
  ADULT_CONFIRMED: "tarot_adult_confirmed",
} as const;

/** Base delay (ms) before first card flips */
export const CARD_FLIP_DELAY_BASE = 200;

/** Incremental delay (ms) between each card flip */
export const CARD_FLIP_DELAY_INTERVAL = 300;

/** Nhãn hiển thị cho nguồn entropy trả về từ backend */
export const QUANTUM_SOURCE_LABELS: Record<string, string> = {
  anu_qrng: "ANU Quantum RNG",
  random_org: "Random.org",
  os_entropy: "OS entropy (dự phòng)",
};
