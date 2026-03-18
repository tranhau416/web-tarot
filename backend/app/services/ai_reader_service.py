"""
AI Reader Service - LLM-powered tarot interpretation via streaming

Provider priority (auto-fallback on failure):
  1. Google Gemini  (if GOOGLE_API_KEY is set)
  2. Anthropic Claude  (if ANTHROPIC_API_KEY is set)
  3. Mock stream  (fallback for development/demo)
"""
import asyncio
import logging
import threading
from typing import AsyncGenerator, Callable

from app.core.config import settings
from app.schemas.tarot import InterpretationResult

logger = logging.getLogger(__name__)

# Timeout và retry — đọc từ config (có thể override qua env var)
STREAM_TIMEOUT_SECONDS: int = settings.STREAM_TIMEOUT_SECONDS
_MAX_RETRIES: int = settings.LLM_MAX_RETRIES


# ---------------------------------------------------------------------------
# Singleton LLM Clients (connection pooling — tránh tạo lại mỗi request)
# ---------------------------------------------------------------------------

class _ClientRegistry:
    """Thread-safe lazy-init registry cho LLM clients."""

    _lock = threading.Lock()
    _gemini_client = None
    _anthropic_client = None

    @classmethod
    def get_gemini(cls):
        """Lazy-init Google Gemini client (singleton)."""
        if cls._gemini_client is None:
            with cls._lock:
                if cls._gemini_client is None:  # double-check locking
                    from google import genai
                    cls._gemini_client = genai.Client(
                        api_key=settings.GOOGLE_API_KEY
                    )
                    logger.info("Initialized Gemini client (singleton)")
        return cls._gemini_client

    @classmethod
    def get_anthropic(cls):
        """Lazy-init Anthropic client (singleton)."""
        if cls._anthropic_client is None:
            with cls._lock:
                if cls._anthropic_client is None:
                    from anthropic import AsyncAnthropic
                    cls._anthropic_client = AsyncAnthropic(
                        api_key=settings.ANTHROPIC_API_KEY
                    )
                    logger.info("Initialized Anthropic client (singleton)")
        return cls._anthropic_client

    @classmethod
    def reset(cls):
        """Reset tất cả clients — dùng cho testing."""
        with cls._lock:
            cls._gemini_client = None
            cls._anthropic_client = None


# ---------------------------------------------------------------------------
# Shared prompts
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = (
    "Bạn là một nhà chiêm tinh và đọc bài Tarot giàu kinh nghiệm, "
    "với phong cách huyền bí nhưng gần gũi, đồng cảm và thực tế. "
    "Bạn diễn giải bài Tarot bằng tiếng Việt, kết hợp:\n"
    "- Ý nghĩa truyền thống của từng lá (upright/reversed)\n"
    "- Elemental Dignities giữa các lá (dignity_weight)\n"
    "- Timing prediction (Cardinal/Fixed/Mutable)\n"
    "- Nguyên tố thống trị của spread\n"
    "Tone: thơ văn, ấm áp, không giáo điều. "
    'Không dùng từ "AI" hay "tôi là AI".'
)


def _build_user_prompt(
    interpretation: InterpretationResult,
    intention: str | None,
) -> str:
    """Build user prompt từ interpretation data. Raise nếu không có cards."""
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


# ---------------------------------------------------------------------------
# Mock fallback
# ---------------------------------------------------------------------------

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


async def _stream_mock() -> AsyncGenerator[str, None]:
    """Yield mock reading word-by-word to simulate streaming."""
    for word in _MOCK_READING.split(" "):
        yield word + " "
        await asyncio.sleep(0.04)


# ---------------------------------------------------------------------------
# Google Gemini provider
# ---------------------------------------------------------------------------

async def _stream_gemini(
    interpretation: InterpretationResult,
    intention: str | None,
) -> AsyncGenerator[str, None]:
    """Stream using Google Gemini API with timeout."""
    from google.genai import types as genai_types

    client = _ClientRegistry.get_gemini()  # singleton — không tạo lại mỗi request
    user_prompt = _build_user_prompt(interpretation, intention)

    config = genai_types.GenerateContentConfig(
        system_instruction=_SYSTEM_PROMPT,
        max_output_tokens=settings.LLM_MAX_OUTPUT_TOKENS,
        temperature=settings.LLM_TEMPERATURE,
        top_p=settings.LLM_TOP_P,
    )

    logger.info("Streaming tarot reading via Google Gemini (%s)", settings.GEMINI_MODEL)

    try:
        async with asyncio.timeout(STREAM_TIMEOUT_SECONDS):
            async for chunk in await client.aio.models.generate_content_stream(
                model=settings.GEMINI_MODEL,
                contents=user_prompt,
                config=config,
            ):
                if chunk.text:
                    yield chunk.text
    except asyncio.TimeoutError:
        logger.error("Gemini streaming timed out after %ds", STREAM_TIMEOUT_SECONDS)
        raise
    except Exception as e:
        logger.error("Gemini streaming error: %s - %s", type(e).__name__, str(e))
        raise


# ---------------------------------------------------------------------------
# Anthropic Claude provider
# ---------------------------------------------------------------------------

async def _stream_claude(
    interpretation: InterpretationResult,
    intention: str | None,
) -> AsyncGenerator[str, None]:
    """Stream using Anthropic Claude API with timeout."""
    from anthropic import APIStatusError, APIConnectionError

    client = _ClientRegistry.get_anthropic()  # singleton — không tạo lại mỗi request
    user_prompt = _build_user_prompt(interpretation, intention)

    logger.info("Streaming tarot reading via Anthropic Claude (%s)", settings.CLAUDE_MODEL)

    try:
        async with asyncio.timeout(STREAM_TIMEOUT_SECONDS):
            async with client.messages.stream(
                model=settings.CLAUDE_MODEL,
                max_tokens=settings.LLM_MAX_OUTPUT_TOKENS,
                system=_SYSTEM_PROMPT,
                messages=[{"role": "user", "content": user_prompt}],
                temperature=settings.LLM_TEMPERATURE,
            ) as stream:
                async for text in stream.text_stream:
                    yield text
    except asyncio.TimeoutError:
        logger.error("Claude streaming timed out after %ds", STREAM_TIMEOUT_SECONDS)
        raise
    except APIStatusError as e:
        logger.error("Anthropic API status error: %s %s", e.status_code, e.message)
        raise
    except APIConnectionError as e:
        logger.error("Anthropic connection error: %s", str(e))
        raise
    except Exception as e:
        logger.error("Claude streaming error: %s - %s", type(e).__name__, str(e))
        raise


# ---------------------------------------------------------------------------
# Retry wrapper
# ---------------------------------------------------------------------------

async def _stream_with_retry(
    provider_name: str,
    stream_fn: Callable[..., AsyncGenerator[str, None]],
    interpretation: InterpretationResult,
    intention: str | None,
) -> AsyncGenerator[str, None]:
    """
    Wrap một provider stream function với retry logic.

    Lưu ý quan trọng: nếu đã yield ít nhất 1 token rồi mới lỗi,
    KHÔNG retry vì client đã nhận partial data — retry sẽ gây trùng lặp.
    """
    last_error: Exception | None = None

    for attempt in range(_MAX_RETRIES + 1):
        token_count = 0
        try:
            async for token in stream_fn(interpretation, intention):
                token_count += 1
                yield token

            # Stream hoàn tất thành công
            logger.info(
                "%s completed successfully (%d chunks)", provider_name, token_count
            )
            return

        except Exception as e:
            last_error = e

            if token_count > 0:
                # Đã yield partial data → không retry, re-raise ngay
                logger.error(
                    "%s failed AFTER yielding %d chunks (no retry): %s",
                    provider_name,
                    token_count,
                    e,
                )
                raise

            if attempt < _MAX_RETRIES:
                wait_time = 2 ** attempt  # exponential backoff: 1s, 2s, ...
                logger.warning(
                    "%s attempt %d/%d failed: %s. Retrying in %ds...",
                    provider_name,
                    attempt + 1,
                    _MAX_RETRIES + 1,
                    e,
                    wait_time,
                )
                await asyncio.sleep(wait_time)
            else:
                logger.warning(
                    "%s exhausted all %d attempt(s): %s",
                    provider_name,
                    _MAX_RETRIES + 1,
                    e,
                )

    if last_error:
        raise last_error


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

async def stream_reading(
    interpretation: InterpretationResult,
    intention: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    Stream a Vietnamese tarot reading.

    Provider selection with auto-fallback:
      1. Google Gemini  → GOOGLE_API_KEY
      2. Anthropic Claude → ANTHROPIC_API_KEY
      3. Mock stream  → demo/development fallback

    Nếu provider 1 fail (sau retry) → tự động thử provider 2 → mock.
    """
    # Input validation sớm — fail fast trước khi gọi LLM
    if not interpretation.cards:
        raise ValueError("Cannot generate reading: no cards in interpretation")

    # Build danh sách providers khả dụng theo thứ tự ưu tiên
    providers: list[tuple[str, Callable]] = []

    if settings.GOOGLE_API_KEY:
        providers.append(("Gemini", _stream_gemini))
    if settings.ANTHROPIC_API_KEY:
        providers.append(("Claude", _stream_claude))

    # Thử từng provider với retry
    for provider_name, stream_fn in providers:
        try:
            async for token in _stream_with_retry(
                provider_name, stream_fn, interpretation, intention
            ):
                yield token
            return  # Thành công → thoát sớm
        except Exception as e:
            logger.warning(
                "Provider %s exhausted. Error: %s. Trying next provider...",
                provider_name,
                e,
            )
            continue

    # Tất cả LLM providers đều fail → Mock fallback
    if providers:
        logger.error(
            "All %d LLM provider(s) failed — falling back to mock reading",
            len(providers),
        )
    else:
        logger.warning("No LLM API key configured — using mock reading stream")

    async for token in _stream_mock():
        yield token
