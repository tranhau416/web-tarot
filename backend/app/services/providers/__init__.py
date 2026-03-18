"""
Provider registry — tự động discover và quản lý LLM providers.

Thứ tự ưu tiên mặc định:
  1. GeminiProvider   (GOOGLE_API_KEY)
  2. ClaudeProvider   (ANTHROPIC_API_KEY)
  3. MockProvider     (luôn available — fallback)

Để thêm provider mới: tạo class kế thừa BaseLLMProvider,
rồi thêm instance vào _PROVIDER_ORDER dưới đây.
"""
from app.services.providers.base import BaseLLMProvider
from app.services.providers.gemini_provider import GeminiProvider
from app.services.providers.claude_provider import ClaudeProvider
from app.services.providers.mock_provider import MockProvider

# Thứ tự ưu tiên — thêm provider mới vào đây
_PROVIDER_ORDER: list[BaseLLMProvider] = [
    GeminiProvider(),
    ClaudeProvider(),
    # OpenAIProvider(),   # ← thêm ở đây khi cần
]

_MOCK = MockProvider()


class ProviderRegistry:
    """Registry quản lý danh sách providers theo thứ tự ưu tiên."""

    def get_available_providers(self) -> list[BaseLLMProvider]:
        """Trả về providers có API key, theo thứ tự ưu tiên."""
        return [p for p in _PROVIDER_ORDER if p.is_available()]

    @property
    def mock_provider(self) -> MockProvider:
        return _MOCK


# Singleton instance — dùng trực tiếp trong ai_reader_service.py
registry = ProviderRegistry()

__all__ = ["BaseLLMProvider", "ProviderRegistry", "registry"]
