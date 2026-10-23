from types import SimpleNamespace

import pytest

from app.core.config import settings
from app.services import ai_reader_service
from app.services.interpretation_service import (
    CardInterpretation,
    InterpretationResult,
    TimingResult,
)
from app.services.prompts import build_user_prompt
from app.services.providers import registry
from app.services.providers.base import BaseLLMProvider
from app.services.providers.claude_provider import ClaudeProvider, ClaudeRefusalError
from app.services.providers.mock_provider import build_mock_reading


def _interpretation(orientation: str = "upright") -> InterpretationResult:
    card = CardInterpretation(
        position_index=0, card_id=1, card_name="The Fool", name_vi="Chàng Khờ",
        suit="major_arcana", arcana="major", element="air", orientation=orientation,
        astro_decan="Element of Air", dignity_weight=0.0,
        timing=TimingResult(card_name="The Fool", timing_unit="timeless",
                            timing_range="timeless", notes=""),
        keywords_upright=["new beginnings"], keywords_reversed=["recklessness"],
        raw_quantum_byte=1, orientation_byte=2, position_label="The Card",
    )
    return InterpretationResult(
        spread_type="single", cards=[card], overall_dignity_score=0.0,
        dominant_element="air", quantum_source="os_entropy",
    )


class FakeProvider(BaseLLMProvider):
    def __init__(self, label: str, fail_at: int | None = None):
        self.label, self.fail_at, self.calls = label, fail_at, 0

    @property
    def name(self) -> str:
        return self.label

    def is_available(self) -> bool:
        return True

    async def stream(self, interpretation, intention, system_prompt):
        self.calls += 1
        for i in range(3):
            if i == self.fail_at:
                raise RuntimeError("boom")
            yield f"{self.label}{i} "


async def _collect(intention=None) -> str:
    return "".join([t async for t in ai_reader_service.stream_reading(_interpretation(), intention)])


@pytest.fixture
def providers(monkeypatch):
    monkeypatch.setattr(settings, "LLM_MAX_RETRIES", 0)

    def use(*items):
        monkeypatch.setattr(registry, "get_available_providers", lambda: list(items))

    return use


async def test_falls_through_when_provider_fails_before_first_token(providers):
    providers(FakeProvider("A", fail_at=0), FakeProvider("B"))
    assert await _collect() == "B0 B1 B2 "


async def test_mid_stream_failure_raises_instead_of_splicing(providers):
    b = FakeProvider("B")
    providers(FakeProvider("A", fail_at=2), b)
    with pytest.raises(ai_reader_service.PartialStreamError):
        await _collect()
    assert b.calls == 0


async def test_retries_before_falling_through(providers, monkeypatch):
    monkeypatch.setattr(settings, "LLM_MAX_RETRIES", 1)
    monkeypatch.setattr(ai_reader_service.asyncio, "sleep", _no_sleep)
    a = FakeProvider("A", fail_at=0)
    providers(a)
    text = await _collect()
    assert a.calls == 2
    assert "Chàng Khờ" in text  # mock reading


async def _no_sleep(_seconds):
    return None


async def test_mock_reading_used_without_providers(providers):
    providers()
    text = await _collect("Tôi nên làm gì?")
    assert "Tôi nên làm gì?" in text
    assert "The Fool (Chàng Khờ)" in text
    assert "Bản đọc mẫu" in text


def test_mock_reading_uses_reversed_keywords():
    text = build_mock_reading(_interpretation("reversed"), None)
    assert "recklessness" in text
    assert "new beginnings" not in text


def test_user_prompt_includes_vietnamese_context():
    prompt = build_user_prompt(_interpretation(), "  Công việc?  ")
    assert "Câu hỏi của người hỏi: Công việc?" in prompt
    assert "Lá bài chính (The Card)" in prompt
    assert "The Fool — Chàng Khờ (thuận)" in prompt
    assert "Chiêm tinh: Element of Air" in prompt


def test_user_prompt_rejects_empty_spread():
    empty = _interpretation().model_copy(update={"cards": []})
    with pytest.raises(ValueError):
        build_user_prompt(empty, None)


class _FakeStream:
    def __init__(self, stop_reason: str):
        self.stop_reason = stop_reason

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    @property
    async def text_stream(self):
        for t in ["Xin ", "chào"]:
            yield t

    async def get_final_message(self):
        return SimpleNamespace(
            stop_reason=self.stop_reason,
            stop_details=SimpleNamespace(category="cyber"),
            model=settings.CLAUDE_MODEL,
        )


def _claude_with(stop_reason: str):
    captured: dict = {}

    def stream(**kwargs):
        captured.update(kwargs)
        return _FakeStream(stop_reason)

    provider = ClaudeProvider()
    provider._client = SimpleNamespace(beta=SimpleNamespace(messages=SimpleNamespace(stream=stream)))
    return provider, captured


async def test_claude_request_uses_current_api_shape(monkeypatch):
    monkeypatch.setattr(settings, "CLAUDE_READING_EFFORT", "medium")
    provider, captured = _claude_with("end_turn")
    text = "".join([t async for t in provider.stream(_interpretation(), None, "system")])

    assert text == "Xin chào"
    assert captured["model"] == settings.CLAUDE_MODEL
    assert captured["fallbacks"] == "default"
    assert captured["betas"] == ["server-side-fallback-2026-07-01"]
    assert captured["output_config"] == {"effort": "medium"}
    assert "temperature" not in captured and "top_p" not in captured


async def test_claude_refusal_raises():
    provider, _ = _claude_with("refusal")
    with pytest.raises(ClaudeRefusalError):
        async for _ in provider.stream(_interpretation(), None, "system"):
            pass
