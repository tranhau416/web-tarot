"""Anthropic Claude LLM provider."""
import asyncio
import logging
from typing import AsyncGenerator

from app.core.config import settings
from app.schemas.tarot import InterpretationResult
from app.services.providers.base import BaseLLMProvider
from app.services.prompts.user_prompt import build_user_prompt

logger = logging.getLogger(__name__)


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

    async def stream(
        self,
        interpretation: InterpretationResult,
        intention: str | None,
        system_prompt: str,
    ) -> AsyncGenerator[str, None]:
        from anthropic import APIStatusError, APIConnectionError

        client = self._get_client()
        user_prompt = build_user_prompt(interpretation, intention)

        logger.info("Streaming via %s (%s)", self.name, settings.CLAUDE_MODEL)

        try:
            async with asyncio.timeout(settings.STREAM_TIMEOUT_SECONDS):
                async with client.messages.stream(
                    model=settings.CLAUDE_MODEL,
                    max_tokens=settings.LLM_MAX_OUTPUT_TOKENS,
                    system=system_prompt,
                    messages=[{"role": "user", "content": user_prompt}],
                    temperature=settings.LLM_TEMPERATURE,
                ) as stream:
                    async for text in stream.text_stream:
                        yield text
        except asyncio.TimeoutError:
            logger.error(
                "%s timed out after %ds", self.name, settings.STREAM_TIMEOUT_SECONDS
            )
            raise
        except APIStatusError as e:
            logger.error(
                "%s API status error: %s %s", self.name, e.status_code, e.message
            )
            raise
        except APIConnectionError as e:
            logger.error("%s connection error: %s", self.name, str(e))
            raise
        except Exception as e:
            logger.error("%s error: %s - %s", self.name, type(e).__name__, e)
            raise
