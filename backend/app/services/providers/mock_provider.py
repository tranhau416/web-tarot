"""Mock LLM provider — fallback cho development/demo."""
import asyncio
import logging
from typing import AsyncGenerator

from app.schemas.tarot import InterpretationResult
from app.services.providers.base import BaseLLMProvider

logger = logging.getLogger(__name__)

_MOCK_READING = """\
✦ Vũ trụ đang lắng nghe…

Nhìn vào những lá bài trước mặt, tôi cảm nhận một dòng năng lượng đang chảy — vừa quen thuộc, vừa đầy bí ẩn. Đây không phải ngẫu nhiên; mỗi lá đều được chọn bởi chính tần số của bạn lúc này.

**Từng lá bài nói gì?**

Lá bài đang hiện diện mang theo thông điệp rõ ràng: đây là thời điểm để bạn nhìn thẳng vào bên trong. Những gì bạn tìm kiếm ở ngoài kia — câu trả lời, sự xác nhận, hướng đi — thực ra đã nằm sẵn trong bạn từ lâu.

**Dòng chảy năng lượng**

Các nguyên tố trong bài trải này tương tác với nhau theo cách thú vị. Sức mạnh không đến từ một điểm duy nhất, mà từ sự cân bằng giữa các chiều kích khác nhau của cuộc sống bạn.

**Thông điệp chính**

Hãy tin vào quá trình. Mỗi bước đi — dù nhỏ — đều có ý nghĩa. Vũ trụ không vội vàng, và bạn cũng không cần phải vậy.

**Lời khuyên thực tế**

Trong những ngày tới, hãy dành ít nhất 10 phút mỗi sáng để ngồi yên lặng với chính mình. Quan sát — đừng phán xét. Câu trả lời sẽ tự đến.

**Về thời gian**

Năng lượng hiện tại cho thấy những chuyển biến sẽ bắt đầu rõ nét trong vài tuần tới. Hãy kiên nhẫn — hạt giống đã được gieo, chỉ cần thêm thời gian để nảy mầm.

✦ ✦ ✦

*(Đây là bản demo — thêm GOOGLE_API_KEY hoặc ANTHROPIC_API_KEY để nhận lời đọc bài thật)*\
"""


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
        for word in _MOCK_READING.split(" "):
            yield word + " "
            await asyncio.sleep(0.04)
