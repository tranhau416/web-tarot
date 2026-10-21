"""Build user prompt từ interpretation data."""
from app.schemas.tarot import InterpretationResult
from app.data.vi import (
    SPREAD_VI,
    dignity_vi,
    element_vi,
    position_vi,
    timing_vi,
)


def build_user_prompt(
    interpretation: InterpretationResult,
    intention: str | None,
) -> str:
    """
    Build user prompt từ interpretation data.

    Raises:
        ValueError: nếu interpretation.cards rỗng.
    """
    if not interpretation.cards:
        raise ValueError("Interpretation must contain at least one card")

    cards_text = ""
    for card in interpretation.cards:
        position = position_vi(card.position_label, card.position_index)
        if card.position_label:
            position = f"{position} ({card.position_label})"
        orientation_vi = "thuận" if card.orientation == "upright" else "ngược"
        name = f"{card.card_name} — {card.name_vi}" if card.name_vi else card.card_name
        if card.orientation == "upright":
            keywords = card.keywords_upright_vi or card.keywords_upright
        else:
            keywords = card.keywords_reversed_vi or card.keywords_reversed
        keywords_str = ", ".join(keywords[:5]) if keywords else "không có"
        astro = card.astro_decan_vi or card.astro_decan
        astro_str = f" | Chiêm tinh: {astro}" if astro else ""

        cards_text += (
            f"- **{position}**: {name} ({orientation_vi}) "
            f"| Nguyên tố: {element_vi(card.element)}{astro_str} "
            f"| Dignity: {card.dignity_weight:+.1f} ({dignity_vi(card.dignity_weight)}) "
            f"| Thời gian: {timing_vi(card.timing.timing_unit, card.timing.timing_range)} "
            f"| Từ khóa: {keywords_str}\n"
        )

    intention_text = (
        intention.strip() if intention and intention.strip() else "Không có câu hỏi cụ thể"
    )
    spread_text = SPREAD_VI.get(interpretation.spread_type, interpretation.spread_type)

    return (
        f"Câu hỏi của người hỏi: {intention_text}\n\n"
        f"Bài trải: {spread_text}\n"
        f"{cards_text}\n"
        f"Thông tin tổng thể:\n"
        f"- Nguyên tố thống trị: {element_vi(interpretation.dominant_element)}\n"
        f"- Điểm Elemental Dignity tổng: {interpretation.overall_dignity_score:+.2f} "
        f"(thang -1 suy yếu → +1 cộng hưởng)\n\n"
        "Hãy đọc bài theo cấu trúc (mỗi phần mở đầu bằng tiêu đề in đậm):\n"
        "1. Mở đầu (1-2 câu cảm nhận tổng thể)\n"
        "2. Từng lá bài (theo thứ tự vị trí)\n"
        "3. Dòng chảy giữa các lá (elemental dignities)\n"
        "4. Thông điệp chính\n"
        "5. Lời khuyên thực tế\n"
        "6. Về thời gian (timing)"
    )
