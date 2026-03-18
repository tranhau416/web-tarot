"""Google Gemini LLM provider."""
import asyncio
import logging
from typing import AsyncGenerator

from app.core.config import settings
from app.schemas.tarot import InterpretationResult
from app.services.providers.base import BaseLLMProvider
from app.services.prompts.user_prompt import build_user_prompt

logger = logging.getLogger(__name__)


class GeminiProvider(BaseLLMProvider):
    """Google Gemini streaming provider."""

    def __init__(self) -> None:
        self._client = None

    @property
    def name(self) -> str:
        return "Gemini"

    def is_available(self) -> bool:
        return bool(settings.GOOGLE_API_KEY)

    def _get_client(self):
        """Lazy-init singleton client."""
        if self._client is None:
            from google import genai
            self._client = genai.Client(api_key=settings.GOOGLE_API_KEY)
            logger.info("Initialized Gemini client")
        return self._client

    async def stream(
        self,
        interpretation: InterpretationResult,
        intention: str | None,
        system_prompt: str,
    ) -> AsyncGenerator[str, None]:
        from google.genai import types as genai_types

        client = self._get_client()
        user_prompt = build_user_prompt(interpretation, intention)

        config = genai_types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=settings.LLM_MAX_OUTPUT_TOKENS,
            temperature=settings.LLM_TEMPERATURE,
            top_p=settings.LLM_TOP_P,
        )

        logger.info("Streaming via %s (%s)", self.name, settings.GEMINI_MODEL)

        try:
            async with asyncio.timeout(settings.STREAM_TIMEOUT_SECONDS):
                async for chunk in await client.aio.models.generate_content_stream(
                    model=settings.GEMINI_MODEL,
                    contents=user_prompt,
                    config=config,
                ):
                    if chunk.text:
                        yield chunk.text
        except asyncio.TimeoutError:
            logger.error(
                "%s timed out after %ds", self.name, settings.STREAM_TIMEOUT_SECONDS
            )
            raise
        except Exception as e:
            logger.error("%s error: %s - %s", self.name, type(e).__name__, e)
            raise
