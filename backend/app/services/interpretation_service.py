"""
============================================================
Tarot Web App - Elemental Dignities & Decan Timing Engine
backend/app/services/interpretation_service.py
============================================================

Triển khai hai hệ thống diễn giải Tarot theo truyền thống Golden Dawn:

A. Elemental Dignities Matrix
   - Xác định mức độ "cộng hưởng" giữa các nguyên tố của các lá bài
   - Fire↔Air (bạn đồng minh): +1.0
   - Water↔Earth (bạn đồng minh): +1.0
   - Fire↔Water (đối kháng): -1.0
   - Air↔Earth (đối kháng): -1.0
   - Same element / Spirit / Unknown: 0.0

B. Decan Timing
   - Cardinal → Weeks (1-4 tuần)
   - Fixed → Months (1-4 tháng)
   - Mutable → Days (3-21 ngày)
   - None (Major Arcana) → Timeless
"""

from __future__ import annotations

import logging
from collections import Counter
from typing import Any, Optional

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.quantum_engine import DrawResult, DrawnCard

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# A. Elemental Dignities
# ---------------------------------------------------------------------------

# Golden Dawn Elemental Dignity Matrix
# Key: tuple(element_a, element_b) — lowercase
# Value: dignity score
# Pairs NOT in dict: neutral (same element = 0.0, Spirit/None = 0.0)
DIGNITY_MATRIX: dict[tuple[str, str], float] = {
    # Fire ↔ Air: allied (dignified)
    ("fire", "air"):   1.0,
    ("air",  "fire"):  1.0,
    # Water ↔ Earth: allied (dignified)
    ("water", "earth"): 1.0,
    ("earth", "water"): 1.0,
    # Fire ↔ Water: opposed (ill-dignified)
    ("fire",  "water"): -1.0,
    ("water", "fire"):  -1.0,
    # Air ↔ Earth: opposed (ill-dignified)
    ("air",  "earth"): -1.0,
    ("earth", "air"):  -1.0,
}


def calculate_dignity(element_a: Optional[str], element_b: Optional[str]) -> float:
    """
    Tính Elemental Dignity score giữa 2 nguyên tố.

    Returns:
        +1.0  = Dignified (allied elements)
         0.0  = Neutral (same, spirit, or unknown)
        -1.0  = Ill-Dignified (opposed elements)
    """
    if not element_a or not element_b:
        return 0.0

    a = element_a.lower().strip()
    b = element_b.lower().strip()

    if a == b:
        return 0.0  # Same element: neutral

    if a == "spirit" or b == "spirit":
        return 0.0  # Spirit: neutral với tất cả

    return DIGNITY_MATRIX.get((a, b), 0.0)


def calculate_spread_dignities(cards: list[DrawnCard]) -> list[float]:
    """
    Tính Elemental Dignity weight cho từng lá bài trong spread.

    Mỗi card nhận trọng số = trung bình dignity với TẤT CẢ các card kề nó.
    - Edge cards (đầu/cuối): chỉ 1 neighbor
    - Middle cards: 2 neighbors (trước và sau)

    Returns:
        list[float] — dignity weight cho từng card theo thứ tự position_index
    """
    n = len(cards)
    if n == 0:
        return []
    if n == 1:
        return [0.0]  # Không có neighbor → neutral

    weights = []
    for i, card in enumerate(cards):
        neighbors = []
        if i > 0:
            neighbors.append(cards[i - 1])
        if i < n - 1:
            neighbors.append(cards[i + 1])

        if not neighbors:
            weights.append(0.0)
            continue

        dignity_scores = [
            calculate_dignity(card.element, neighbor.element)
            for neighbor in neighbors
        ]
        avg_dignity = sum(dignity_scores) / len(dignity_scores)
        weights.append(avg_dignity)

    return weights


# ---------------------------------------------------------------------------
# B. Decan Timing
# ---------------------------------------------------------------------------

class TimingResult(BaseModel):
    """Kết quả tính Timing cho một lá bài."""

    card_name: str
    zodiac_mode: Optional[str] = None
    timing_unit: str
    timing_range: str   # VD: "1-4 weeks"
    notes: str


# Mapping zodiac_mode → timing parameters
TIMING_MAP: dict[str, dict[str, Any]] = {
    "cardinal": {
        "unit":  "weeks",
        "range": "1-4 weeks",
        "notes": "Cardinal signs represent beginnings and initiations. Events manifest within weeks.",
    },
    "fixed": {
        "unit":  "months",
        "range": "1-4 months",
        "notes": "Fixed signs represent persistence and stability. Events unfold over months.",
    },
    "mutable": {
        "unit":  "days",
        "range": "3-21 days",
        "notes": "Mutable signs represent change and transition. Events occur within days.",
    },
}


def calculate_timing(
    card_name: str,
    zodiac_mode: Optional[str],
    arcana: str,
) -> TimingResult:
    """
    Tính Timing prediction cho một lá bài dựa vào zodiac_mode.

    Args:
        card_name:   Tên lá bài
        zodiac_mode: "cardinal" | "fixed" | "mutable" | None
        arcana:      "major" | "minor"

    Returns:
        TimingResult
    """
    if arcana == "major" or not zodiac_mode:
        return TimingResult(
            card_name=card_name,
            zodiac_mode=None,
            timing_unit="timeless",
            timing_range="timeless",
            notes=(
                "Major Arcana cards represent archetypal forces beyond time. "
                "Their influence is not bound to a specific timeframe."
            ),
        )

    mode = zodiac_mode.lower().strip()
    timing_info = TIMING_MAP.get(mode)

    if not timing_info:
        return TimingResult(
            card_name=card_name,
            zodiac_mode=zodiac_mode,
            timing_unit="unknown",
            timing_range="unknown",
            notes=f"Unknown zodiac mode: {zodiac_mode!r}",
        )

    return TimingResult(
        card_name=card_name,
        zodiac_mode=zodiac_mode,
        timing_unit=timing_info["unit"],
        timing_range=timing_info["range"],
        notes=timing_info["notes"],
    )


def calculate_spread_timing(cards_data: list[dict]) -> list[TimingResult]:
    """
    Tính Timing cho toàn bộ spread.

    Args:
        cards_data: list[dict] — mỗi dict có keys:
                    card_name, zodiac_mode (Optional), arcana

    Returns:
        list[TimingResult]
    """
    results = []
    for card_data in cards_data:
        result = calculate_timing(
            card_name=card_data.get("card_name", "Unknown"),
            zodiac_mode=card_data.get("zodiac_mode"),
            arcana=card_data.get("arcana", "minor"),
        )
        results.append(result)
    return results


# ---------------------------------------------------------------------------
# C. Full Interpretation Result Models
# ---------------------------------------------------------------------------

class CardInterpretation(BaseModel):
    """Diễn giải đầy đủ cho một lá bài trong spread."""

    position_index: int
    card_id: int
    card_name: str
    suit: str
    arcana: str
    element: Optional[str] = None
    orientation: str
    zodiac_mode: Optional[str] = None
    astro_decan: Optional[str] = None
    numerology_value: Optional[int] = None
    dignity_weight: float
    timing: TimingResult
    keywords_upright: list[str] = []
    keywords_reversed: list[str] = []
    image_url: Optional[str] = None
    raw_quantum_byte: int
    position_label: Optional[str] = None


class InterpretationResult(BaseModel):
    """Kết quả diễn giải tổng hợp cho toàn bộ spread."""

    spread_type: str
    cards: list[CardInterpretation]
    overall_dignity_score: float    # trung bình dignity toàn spread
    dominant_element: str           # nguyên tố xuất hiện nhiều nhất
    quantum_source: str             # "anu_qrng" | "random_org"


# ---------------------------------------------------------------------------
# D. Full Interpretation Orchestrator
# ---------------------------------------------------------------------------

async def interpret_spread(
    draw_result: DrawResult,
    db: AsyncSession,
) -> InterpretationResult:
    """
    Diễn giải đầy đủ một spread: tính dignities + timing + metadata.

    Steps:
      1. Fetch đầy đủ card metadata từ DB cho mỗi DrawnCard
      2. Tính Elemental Dignities cho toàn bộ spread
      3. Tính Timing cho từng card
      4. Build InterpretationResult

    Args:
        draw_result: Kết quả từ quantum_engine.draw_cards()
        db:          AsyncSession (FastAPI dependency)

    Returns:
        InterpretationResult
    """
    from app.models import Card  # tránh circular import

    # --- Bước 1: Fetch card metadata từ DB ---
    card_ids = [dc.card_id for dc in draw_result.drawn_cards]
    result = await db.execute(
        select(Card).where(Card.id.in_(card_ids))
    )
    db_cards: dict[int, Card] = {c.id: c for c in result.scalars().all()}

    # --- Bước 2: Tính Elemental Dignities ---
    # Cần element từ DB (drawn_cards đã có element nhưng verify từ DB)
    # Merge element info
    for dc in draw_result.drawn_cards:
        if dc.card_id in db_cards:
            db_card = db_cards[dc.card_id]
            if db_card.element:
                dc.element = db_card.element

    dignity_weights = calculate_spread_dignities(draw_result.drawn_cards)

    # --- Bước 3: Tính Timing ---
    timing_inputs = []
    for dc in draw_result.drawn_cards:
        db_card = db_cards.get(dc.card_id)
        timing_inputs.append({
            "card_name":  dc.card_name,
            "zodiac_mode": db_card.zodiac_mode if db_card else None,
            "arcana":      db_card.arcana if db_card else "minor",
        })
    timing_results = calculate_spread_timing(timing_inputs)

    # --- Bước 4: Build CardInterpretation list ---
    card_interpretations = []
    elements_present = []

    for i, dc in enumerate(draw_result.drawn_cards):
        db_card = db_cards.get(dc.card_id)
        dignity = dignity_weights[i] if i < len(dignity_weights) else 0.0
        timing = timing_results[i]

        # Extract keywords từ metadata_json nếu có
        keywords_up: list[str] = []
        keywords_rev: list[str] = []
        if db_card and db_card.metadata_json:
            meta = db_card.metadata_json
            keywords_up  = meta.get("keywords_upright",  meta.get("keywords", []))
            keywords_rev = meta.get("keywords_reversed", [])

        card_interp = CardInterpretation(
            position_index=dc.position_index,
            card_id=dc.card_id,
            card_name=dc.card_name,
            suit=dc.suit,
            arcana=db_card.arcana if db_card else "minor",
            element=dc.element,
            orientation=dc.orientation,
            zodiac_mode=db_card.zodiac_mode if db_card else None,
            astro_decan=db_card.astro_decan if db_card else None,
            numerology_value=db_card.numerology_value if db_card else None,
            dignity_weight=dignity,
            timing=timing,
            keywords_upright=keywords_up,
            keywords_reversed=keywords_rev,
            image_url=db_card.image_url if db_card else None,
            raw_quantum_byte=dc.raw_quantum_byte,
        )
        card_interpretations.append(card_interp)

        if dc.element:
            elements_present.append(dc.element.lower())

    # --- Bước 5: Tính overall scores ---
    if dignity_weights:
        overall_dignity = sum(dignity_weights) / len(dignity_weights)
    else:
        overall_dignity = 0.0

    # Dominant element
    if elements_present:
        element_counter = Counter(elements_present)
        dominant_element = element_counter.most_common(1)[0][0]
    else:
        dominant_element = "unknown"

    return InterpretationResult(
        spread_type=draw_result.spread_type,
        cards=card_interpretations,
        overall_dignity_score=round(overall_dignity, 4),
        dominant_element=dominant_element,
        quantum_source=draw_result.quantum_source,
    )
