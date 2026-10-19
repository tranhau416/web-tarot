"""
AI Reader Service - LLM-powered tarot interpretation via streaming

Provider priority (auto-fallback on failure) — xem app/services/providers:
  1. Google Gemini  (if GOOGLE_API_KEY is set)
  2. Anthropic Claude  (if ANTHROPIC_API_KEY is set)
  3. Mock stream  (fallback for development/demo)

Chỉ chuyển sang provider kế tiếp khi provider hiện tại lỗi TRƯỚC khi gửi token
nào. Nếu đã stream một phần rồi mới lỗi thì báo lỗi lên trên — ghép lời đọc
của provider khác vào sau sẽ làm nội dung bị lặp / lệch mạch.
"""
import asyncio
import logging
from typing import AsyncGenerator

from app.core.config import settings
from app.schemas.tarot import InterpretationResult
from app.services.prompts import SYSTEM_PROMPT
from app.services.providers import BaseLLMProvider, registry

logger = logging.getLogger(__name__)


class PartialStreamError(RuntimeError):
    """Provider lỗi sau khi đã gửi một phần nội dung cho client."""


async def _stream_with_retry(
    provider: BaseLLMProvider,
    interpretation: InterpretationResult,
    intention: str | None,
) -> AsyncGenerator[str, None]:
    """
    Stream từ một provider với retry (exponential backoff) khi lỗi trước token đầu tiên.

    Raises:
        PartialStreamError: lỗi sau khi đã yield ít nhất 1 token (không retry).
        Exception: lỗi cuối cùng sau khi hết lượt retry.
    """
    max_retries = settings.LLM_MAX_RETRIES
    last_error: Exception | None = None

    for attempt in range(max_retries + 1):
        token_count = 0
        try:
            async for token in provider.stream(interpretation, intention, SYSTEM_PROMPT):
                token_count += 1
                yield token
            logger.info("%s completed successfully (%d chunks)", provider.name, token_count)
            return
        except Exception as e:
            if token_count > 0:
                raise PartialStreamError(
                    f"{provider.name} failed after {token_count} chunks: {e}"
                ) from e
            last_error = e
            if attempt < max_retries:
                wait_time = 2 ** attempt  # 1s, 2s, ...
                logger.warning(
                    "%s attempt %d/%d failed: %s. Retrying in %ds...",
                    provider.name, attempt + 1, max_retries + 1, e, wait_time,
                )
                await asyncio.sleep(wait_time)

    assert last_error is not None
    raise last_error


async def stream_reading(
    interpretation: InterpretationResult,
    intention: str | None = None,
) -> AsyncGenerator[str, None]:
    """
    Stream a Vietnamese tarot reading.

    Raises:
        ValueError: interpretation không có lá nào.
        PartialStreamError: provider đứt giữa chừng sau khi đã gửi nội dung.
    """
    if not interpretation.cards:
        raise ValueError("Cannot generate reading: no cards in interpretation")

    providers = registry.get_available_providers()

    for provider in providers:
        try:
            async for token in _stream_with_retry(provider, interpretation, intention):
                yield token
            return
        except PartialStreamError:
            raise
        except Exception as e:
            logger.warning("Provider %s exhausted (%s). Trying next provider...", provider.name, e)

    if providers:
        logger.error(
            "All %d LLM provider(s) failed — falling back to mock reading", len(providers)
        )
    else:
        logger.warning("No LLM API key configured — using mock reading stream")

    async for token in registry.mock_provider.stream(interpretation, intention, SYSTEM_PROMPT):
        yield token
