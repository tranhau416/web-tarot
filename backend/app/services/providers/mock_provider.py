"""
Mock LLM provider — fallback cho development/demo.

Không gọi LLM, nhưng vẫn dựng lời đọc từ chính các lá đã rút (vị trí, hướng,
keywords, dignity, timing) để chế độ không có API key vẫn có nội dung thật.
"""
import asyncio
import logging
import re
from typing import AsyncGenerator

from app.schemas.tarot import InterpretationResult
from app.data.vi import (
    SPREAD_VI,
    dignity_vi,
    element_vi,
    position_vi,
    timing_vi,
)
from app.services.providers.base import BaseLLMProvider

logger = logging.getLogger(__name__)

_TOKEN_DELAY_SECONDS = 0.03

_ELEMENT_MOOD: dict[str, str] = {
    "fire": "ngọn lửa của ý chí và đam mê đang thôi thúc bạn hành động",
    "water": "dòng nước của cảm xúc và trực giác đang dẫn lối",
    "air": "luồng gió của lý trí và sự thật đang làm sáng tỏ mọi điều",
    "earth": "mặt đất vững chãi của thực tế và sự kiên nhẫn đang nâng đỡ bạn",
}


def _keywords(card) -> list[str]:
    """Keywords theo hướng lá, ưu tiên tiếng Việt."""
    if card.orientation == "upright":
        return card.keywords_upright_vi or card.keywords_upright
    return card.keywords_reversed_vi or card.keywords_reversed


def build_mock_reading(interpretation: InterpretationResult, intention: str | None) -> str:
    """Dựng lời đọc tiếng Việt dạng template từ dữ liệu spread."""
    cards = interpretation.cards
    question = intention.strip() if intention and intention.strip() else None
    dominant = interpretation.dominant_element
    mood = _ELEMENT_MOOD.get(dominant, "nhiều nguồn năng lượng đang đan xen")

    parts: list[str] = ["✦ Vũ trụ đang lắng nghe…", ""]
    opening = (
        f"Với câu hỏi “{question}”, " if question else "Trong khoảnh khắc tĩnh lặng này, "
    )
    parts.append(
        f"{opening}bài trải {SPREAD_VI.get(interpretation.spread_type, interpretation.spread_type)} "
        f"mở ra dưới ảnh hưởng của nguyên tố {element_vi(dominant)} — {mood}."
    )

    parts += ["", "**Từng lá bài nói gì?**", ""]
    for card in cards:
        upright = card.orientation == "upright"
        keywords = _keywords(card)
        name = f"{card.card_name} ({card.name_vi})" if card.name_vi else card.card_name
        meaning = ", ".join(keywords[:3]) if keywords else "một thông điệp cần lắng nghe thêm"
        stance = (
            "xuất hiện ở chiều thuận, năng lượng của lá được thể hiện trọn vẹn"
            if upright
            else "xuất hiện ở chiều ngược, năng lượng của lá đang bị dồn nén hoặc cần được nhìn lại"
        )
        parts.append(
            f"- **{position_vi(card.position_label, card.position_index)} — {name}**: "
            f"lá bài {stance}. Từ khóa nổi bật: *{meaning}*. "
            f"Lá này {dignity_vi(card.dignity_weight)}."
        )

    parts += ["", "**Dòng chảy năng lượng**", ""]
    score = interpretation.overall_dignity_score
    if len(cards) == 1:
        flow = "Một lá đơn lẻ nói thẳng vào trọng tâm — không có lá nào bên cạnh để pha loãng thông điệp."
    elif score > 0.25:
        flow = "Các nguyên tố trong bài trải cộng hưởng với nhau: những gì bạn đang xây dựng có nền móng hài hòa."
    elif score < -0.25:
        flow = "Các nguyên tố đang giằng co: có những mong muốn kéo bạn về các hướng khác nhau, cần chọn điều ưu tiên."
    else:
        flow = "Các nguyên tố đan xen trung tính: sức mạnh đến từ sự cân bằng hơn là một hướng duy nhất."
    parts.append(flow)

    focus = cards[-1]
    focus_keywords = _keywords(focus)
    focus_word = focus_keywords[0] if focus_keywords else "tiếng nói bên trong"
    focus_where = (
        f"Lá {focus.card_name} ở vị trí "
        f"{position_vi(focus.position_label, focus.position_index).lower()}"
    )
    parts += ["", "**Thông điệp chính**", ""]
    if focus.orientation == "upright":
        parts.append(f"{focus_where} gợi ý rằng điều quan trọng nhất lúc này là *{focus_word}*.")
    else:
        parts.append(
            f"{focus_where} nhắc bạn nhìn thẳng vào *{focus_word}* — "
            f"gọi tên được nó là bước đầu để chuyển hoá nó."
        )

    parts += ["", "**Lời khuyên thực tế**", ""]
    reversed_count = sum(1 for c in cards if c.orientation == "reversed")
    if reversed_count > len(cards) / 2:
        parts.append(
            "Nhiều lá ngược cho thấy năng lượng đang bị chặn lại. Hãy chậm lại, viết ra điều khiến bạn "
            "băn khoăn và chọn một việc nhỏ để gỡ nút thắt trước."
        )
    else:
        parts.append(
            "Năng lượng đang thuận chiều. Hãy chọn một bước cụ thể trong tuần này để biến ý định thành hành động."
        )

    timed = [c for c in cards if c.timing.timing_unit not in ("timeless", "unknown")]
    parts += ["", "**Về thời gian**", ""]
    if timed:
        t = timed[0]
        parts.append(
            f"Lá {t.card_name} cho thấy chuyển biến có thể đến "
            f"{timing_vi(t.timing.timing_unit, t.timing.timing_range)}."
        )
    else:
        parts.append(
            "Các lá Major Arcana chỉ ra những bài học vượt ngoài khung thời gian — "
            "mọi việc sẽ đến khi bạn sẵn sàng."
        )

    parts += [
        "",
        "✦ ✦ ✦",
        "",
        "*(Bản đọc mẫu tự động — thêm GOOGLE_API_KEY hoặc ANTHROPIC_API_KEY "
        "để nhận lời đọc chi tiết từ mô hình ngôn ngữ)*",
    ]
    return "\n".join(parts)


class MockProvider(BaseLLMProvider):
    """Mock streaming provider — luôn available, không cần API key."""

    @property
    def name(self) -> str:
        return "Mock"

    def is_available(self) -> bool:
        return True  # luôn sẵn sàng làm fallback

    async def stream(
        self,
        interpretation: InterpretationResult,
        intention: str | None,
        system_prompt: str,
    ) -> AsyncGenerator[str, None]:
        logger.warning("Using mock provider — no real LLM output")
        reading = build_mock_reading(interpretation, intention)
        # Giữ nguyên khoảng trắng / xuống dòng khi chia token
        for token in re.findall(r"\S+\s*|\s+", reading):
            yield token
            await asyncio.sleep(_TOKEN_DELAY_SECONDS)
