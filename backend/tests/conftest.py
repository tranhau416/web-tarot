"""
Pytest fixtures dùng chung.

Biến môi trường phải được đặt TRƯỚC khi import `app` (settings + engine
được tạo lúc import). Test API cần PostgreSQL:
  - DATABASE_URL (mặc định: DB `tarot_test` trên localhost)
  - REQUIRE_DB=1 → fail thay vì skip khi không kết nối được DB (dùng trong CI)
"""

import os

os.environ["APP_ENV"] = "test"  # NullPool: mỗi test có event loop riêng
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://tarot_user:tarot_pass@localhost:5432/tarot_test",
)
# Không gọi LLM thật trong test → luôn dùng mock provider
os.environ["GOOGLE_API_KEY"] = ""
os.environ["ANTHROPIC_API_KEY"] = ""

import httpx  # noqa: E402
import pytest  # noqa: E402

from app.services import quantum_engine  # noqa: E402
from app.services.providers import mock_provider  # noqa: E402


@pytest.fixture(autouse=True)
def offline_entropy(monkeypatch):
    """Không gọi ANU / Random.org trong test: cả hai nguồn lỗi ngay → OS entropy."""

    async def unavailable(n, client):
        raise RuntimeError("network disabled in tests")

    monkeypatch.setattr(quantum_engine, "_fetch_from_anu", unavailable)
    monkeypatch.setattr(quantum_engine, "_fetch_from_random_org", unavailable)
    monkeypatch.setattr(quantum_engine, "_source_unavailable_until", {})


@pytest.fixture(autouse=True)
def fast_mock_stream(monkeypatch):
    monkeypatch.setattr(mock_provider, "_TOKEN_DELAY_SECONDS", 0)


@pytest.fixture
async def db_ready():
    """Tạo schema + seed deck; skip (hoặc fail khi REQUIRE_DB=1) nếu không có Postgres."""
    from app.core.database import engine
    from app.core.init_db import init_db

    try:
        await init_db(engine)
    except (OSError, ConnectionError) as exc:  # asyncpg ném OSError khi không kết nối được
        if os.environ.get("REQUIRE_DB") == "1":
            raise
        pytest.skip(f"PostgreSQL not available: {exc}")
    yield engine


@pytest.fixture
async def client(db_ready):
    from main import app

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c
