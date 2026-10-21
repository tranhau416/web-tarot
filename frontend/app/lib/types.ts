export type Orientation = "upright" | "reversed"
export type SpreadType = "single" | "three_card" | "celtic_cross" | "horseshoe"
export type Element = "fire" | "water" | "air" | "earth" | "spirit"

export interface TimingResult {
  card_name: string
  zodiac_mode: string | null
  timing_unit: string
  timing_range: string
  notes: string
  range_vi: string
  notes_vi: string
}

export interface CardInterpretation {
  position_index: number
  card_id: number
  card_name: string
  name_vi: string | null
  suit: string
  arcana: string
  element: Element | null
  orientation: Orientation
  zodiac_mode: string | null
  astro_decan: string | null
  astro_decan_vi: string | null
  numerology_value: number | null
  dignity_weight: number
  dignity_label_vi: string
  timing: TimingResult
  keywords_upright: string[]
  keywords_reversed: string[]
  keywords_upright_vi: string[]
  keywords_reversed_vi: string[]
  image_url: string | null
  raw_quantum_byte: number
  orientation_byte: number | null
  position_label?: string
  position_label_vi?: string
}

export interface InterpretationResult {
  spread_type: SpreadType
  cards: CardInterpretation[]
  overall_dignity_score: number
  dominant_element: string
  dominant_element_vi: string
  quantum_source: string
}

export interface DrawResponse {
  session_id: string
  interpretation: InterpretationResult
  disclaimer: string
}

export interface DrawRequest {
  spread_type: SpreadType
  intention?: string
  user_id?: string
}


export interface Card {
  id: number
  card_number: number
  name: string
  name_vi: string | null
  suit: string
  arcana: string
  element: Element | null
  astro_decan: string | null
  zodiac_mode: string | null
  numerology_value: number | null
  image_url: string | null
  metadata_json: Record<string, unknown> | null
}
