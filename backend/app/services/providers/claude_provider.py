"""Anthropic Claude LLM provider."""
import asyncio
import logging
from typing import Any, AsyncGenerator

from app.core.config import settings
from app.schemas.tarot import InterpretationResult
from app.services.providers.base import BaseLLMProvider
from app.services.prompts.user_prompt import build_user_prompt

logger = logging.getLogger(__name__)

# Server-side refusal fallback: nếu safety classifier từ chối, API tự chạy lại
# request trên model được Anthropic khuyến nghị (cùng một stream).
_FALLBACK_BETA = "server-side-fallback-2026-07-01"


class ClaudeRefusalError(RuntimeError):
    """Toàn bộ chuỗi model đã từ chối trả lời (stop_reason == "refusal")."""


class ClaudeProvider(BaseLLMProvider):
    """Anthropic Claude streaming provider."""

    def __init__(self) -> None:
        self._client = None

    @property
    def name(self) -> str:
        return "Claude"

    def is_available(self) -> bool:
        return bool(settings.ANTHROPIC_API_KEY)

    def _get_client(self):
        """Lazy-init singleton client."""
        if self._client is None:
            from anthropic import AsyncAnthropic
            self._client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
            logger.info("Initialized Anthropic client")
        return self._client

    def _request_options(self) -> dict[str, Any]:
        # Lưu ý: model Claude hiện tại không nhận temperature/top_p (trả 400);
        # độ sâu suy nghĩ điều khiển qua output_config.effort.
        options: dict[str, Any] = {
            "betas": [_FALLBACK_BETA],
            "fallbacks": "default",
        }
        if settings.CLAUDE_READING_EFFORT:
            options["output_config"] = {"effort": settings.CLAUDE_READING_EFFORT}
        return options

    async def stream(
        self,
        interpretation: InterpretationResult,
        intention: str | None,
        system_prompt: str,
    ) -> AsyncGenerator[str, None]:
        from anthropic import APIConnectionError, APIStatusError

        client = self._get_client()
        user_prompt = build_user_prompt(interpretation, intention)

        logger.info("Streaming via %s (%s)", self.name, settings.CLAUDE_MODEL)

        try:
            async with asyncio.timeout(settings.STREAM_TIMEOUT_SECONDS):
                async with client.beta.messages.stream(
                    model=settings.CLAUDE_MODEL,
                    max_tokens=settings.CLAUDE_MAX_TOKENS,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}],
                    **self._request_options(),
                ) as stream:
                    async for text in stream.text_stream:
                        yield text
                    final = await stream.get_final_message()
        except asyncio.TimeoutError:
            logger.error(
                "%s timed out after %ds", self.name, settings.STREAM_TIMEOUT_SECONDS
            )
            raise
        except APIStatusError as e:
            logger.error(
                "%s API status error: %s %s (request_id=%s)",
                self.name, e.status_code, e.message, e.request_id,
            )
            raise
        except APIConnectionError as e:
            logger.error("%s connection error: %s", self.name, str(e))
            raise

        if final.stop_reason == "refusal":
            category = getattr(final.stop_details, "category", None)
            raise ClaudeRefusalError(f"Claude declined the reading (category={category})")
        if final.stop_reason == "max_tokens":
            logger.warning(
                "%s hit max_tokens=%d — reading may be truncated",
                self.name, settings.CLAUDE_MAX_TOKENS,
            )
        if final.model != settings.CLAUDE_MODEL:
            logger.info("%s reading served by fallback model %s", self.name, final.model)
