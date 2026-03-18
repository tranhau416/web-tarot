"""Abstract base class cho tất cả LLM providers."""
from abc import ABC, abstractmethod
from typing import AsyncGenerator

from app.schemas.tarot import InterpretationResult


class BaseLLMProvider(ABC):
    """Interface chung cho mọi LLM provider."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Tên provider (dùng cho logging)."""
        ...

    @abstractmethod
    def is_available(self) -> bool:
        """Kiểm tra provider có API key và sẵn sàng không."""
        ...

    @abstractmethod
    async def stream(
        self,
        interpretation: InterpretationResult,
        intention: str | None,
        system_prompt: str,
    ) -> AsyncGenerator[str, None]:
        """Stream response từ LLM. Yield từng chunk text."""
        ...
        yield  # pragma: no cover — cần để Python nhận diện async generator
