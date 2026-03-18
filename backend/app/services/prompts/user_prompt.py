"""Build user prompt từ interpretation data."""
from app.schemas.tarot import InterpretationResult


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
        position = card.position_label or f"Vị trí {card.position_index + 1}"
        orientation_vi = "thuận" if card.orientation == "upright" else "ngược"
        element_vi = card.element or "không xác định"
        keywords = (
            card.keywords_upright
            if card.orientation == "upright"
            else card.keywords_reversed
        )
        keywords_str = ", ".join(keywords[:5]) if keywords else "không có"
        timing_str = card.timing.timing_range if card.timing else "không xác định"

        cards_text += (
            f"- **{position}**: {card.card_name} ({orientation_vi}) "
            f"| Nguyên tố: {element_vi} "
            f"| Dignity: {card.dignity_weight:+.1f} "
            f"| Thời gian: {timing_str} "
            f"| Từ khóa: {keywords_str}\n"
        )

    intention_text = (
        intention.strip() if intention and intention.strip() else "Không có câu hỏi cụ thể"
    )

    return (
        f"Câu hỏi của người hỏi: {intention_text}\n\n"
        f"Bài trải ({interpretation.spread_type}):\n"
        f"{cards_text}\n"
        f"Thông tin tổng thể:\n"
        f"- Nguyên tố thống trị: {interpretation.dominant_element}\n"
        f"- Điểm Elemental Dignity tổng: {interpretation.overall_dignity_score:+.2f}\n\n"
        "Hãy đọc bài theo cấu trúc:\n"
        "1. Mở đầu (1-2 câu cảm nhận tổng thể)\n"
        "2. Từng lá bài (theo thứ tự vị trí)\n"
        "3. Dòng chảy giữa các lá (elemental dignities)\n"
        "4. Thông điệp chính\n"
        "5. Lời khuyên thực tế\n"
        "6. Về thời gian (timing)"
    )
