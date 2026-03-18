/** localStorage key for adult confirmation */
export const STORAGE_KEYS = {
  ADULT_CONFIRMED: "tarot_adult_confirmed",
} as const;

/** Base delay (ms) before first card flips */
export const CARD_FLIP_DELAY_BASE = 200;

/** Incremental delay (ms) between each card flip */
export const CARD_FLIP_DELAY_INTERVAL = 300;
