/**
 * Centralized UI strings — preparation for future i18n.
 * All hardcoded user-facing text lives here.
 */
export const STRINGS = {
  // LegalGate
  LEGAL_GATE_TITLE: "Sacred Space",
  LEGAL_GATE_SUBTITLE: "An archetypal space for reflection & self-discovery",
  LEGAL_GATE_CHECK_AGE: "I confirm I am 18 years of age or older",
  LEGAL_GATE_CHECK_ENTERTAINMENT: "I understand this is for entertainment purposes only",
  LEGAL_GATE_ENTER: "Enter the Sacred Space",
  LEGAL_GATE_CONSENT_REMEMBERED: "Your consent is remembered in this browser.",

  // Hero
  HERO_TITLE: "Sacred Tarot",
  HERO_SUBTITLE: "Quantum-powered readings — mỗi lá bài được chọn bởi entropy lượng tử thực sự.",

  // IntentionInput
  INTENTION_LABEL: "Ý định của bạn (tùy chọn)",
  INTENTION_PLACEHOLDER: "Bạn muốn hỏi điều gì với những lá bài?",

  // DrawButton
  DRAW_BUTTON_IDLE: "Draw from the Void",
  DRAW_BUTTON_LOADING: "Reading the Quantum Field…",
  DRAW_BUTTON_ARIA_IDLE: "Rút bài từ vũ trụ",
  DRAW_BUTTON_ARIA_LOADING: "Đang rút bài từ lượng tử",

  // AIReading
  AI_READING_TITLE: "Lời Đọc Bài",
  AI_READING_STREAMING: "đang đọc…",
  AI_READING_LOADING: "Đang rút bài và kết nối với vũ trụ…",
  AI_READING_EMPTY: "Vũ trụ im lặng lần này. Hãy thử lại với một câu hỏi khác.",
  AI_READING_ERROR_UNKNOWN: "Đã xảy ra lỗi không xác định.",

  // CardReveal
  CARD_SELECT_ARIA: (cardName: string) => `Chọn lá ${cardName}`,
  CARD_UPRIGHT: "Upright",
  CARD_REVERSED: "Reversed",

  // page.tsx
  DOMINANT_ELEMENT_LABEL: "Nguyên tố thống trị",
  ELEMENTAL_DIGNITY_LABEL: "Elemental Dignity",
  QUANTUM_SOURCE_LABEL: "Nguồn entropy",
  DRAW_AGAIN: "✦ Rút bài lại",
  ERROR_DISMISS: "✕",
  ERROR_RETRY: "Thử lại",
  LOADING_CONNECTING: "Đang kết nối với vũ trụ…",

  // Error boundary
  ERROR_BOUNDARY_TITLE: "Something went wrong",
  ERROR_BOUNDARY_DEFAULT: "An unexpected error occurred in the sacred space.",
  ERROR_BOUNDARY_RESET: "Try again",
} as const;
