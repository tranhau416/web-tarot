"""
============================================================
Tarot Web App - Quantum Random Number Engine
backend/app/services/quantum_engine.py
============================================================

Sử dụng ANU Quantum Random Number Generator (QRNG) để
đảm bảo entropy thật sự ngẫu nhiên cho mỗi lần rút bài.

Thứ tự ưu tiên entropy:
  1. ANU QRNG API  (https://qrng.anu.edu.au — hoặc API mới có ANU_API_KEY)
  2. Random.org    (fallback nếu ANU down)
  3. OS entropy    (secrets — fallback cuối, cryptographically secure)

Mỗi lượt rút chỉ gọi nguồn entropy MỘT lần. Nguồn nào lỗi sẽ bị bỏ qua trong
một khoảng cooldown để request sau không phải chờ timeout lại.
"""

from __future__ import annotations

import logging
import secrets
import time
from typing import Optional

import httpx
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Pydantic Models
# ---------------------------------------------------------------------------


class DrawnCard(BaseModel):
    """Một lá bài đã được rút trong spread."""

    position_index: int
    card_id: int
    card_name: str
    suit: str
    element: Optional[str] = None
    orientation: str  # "upright" | "reversed"
    raw_quantum_byte: int   # byte entropy đã chọn lá này
    orientation_byte: int   # byte entropy quyết định ngửa/ngược (<128 = upright)


class DrawResult(BaseModel):
    """Kết quả đầy đủ của một lần trải bài."""

    spread_type: str
    drawn_cards: list[DrawnCard]
    quantum_source: str        # "anu_qrng" | "random_org" | "os_entropy"
    raw_bytes_hex: str         # hex string của toàn bộ bytes đã dùng


# ---------------------------------------------------------------------------
# Spread Size Mapping
# ---------------------------------------------------------------------------


def get_spread_size(spread_type: str) -> int:
    """Trả về số lá bài cần rút cho mỗi loại spread."""
    sizes = {
        "single":       1,
        "three_card":   3,
        "celtic_cross": 10,
        "horseshoe":    7,
    }
    size = sizes.get(spread_type)
    if size is None:
        raise ValueError(
            f"Unknown spread_type: {spread_type!r}. "
            f"Valid types: {list(sizes.keys())}"
        )
    return size


# ---------------------------------------------------------------------------
# Quantum Entropy Fetching
# ---------------------------------------------------------------------------

# Bỏ qua nguồn vừa lỗi trong khoảng này (giây) — tránh mỗi request chờ timeout
_SOURCE_COOLDOWN_SECONDS = 60.0
_source_unavailable_until: dict[str, float] = {}


async def _fetch_from_anu(n: int, client: httpx.AsyncClient) -> list[int]:
    """
    Gọi ANU QRNG API để lấy n bytes ngẫu nhiên.
    Endpoint: GET {ANU_QRNG_URL}?length={n}&type=uint8
    Response: {"type":"uint8","length":n,"data":[...],"success":true}
    Nếu có ANU_API_KEY (API mới quantumnumbers.anu.edu.au) → gửi header x-api-key.
    """
    headers = {"x-api-key": settings.ANU_API_KEY} if settings.ANU_API_KEY else None
    response = await client.get(
        settings.ANU_QRNG_URL,
        params={"length": n, "type": "uint8"},
        headers=headers,
    )
    response.raise_for_status()
    payload = response.json()
    if payload.get("success") is False:
        raise RuntimeError(f"ANU QRNG refused request: {payload.get('message', payload)}")
    return payload["data"]


async def _fetch_from_random_org(n: int, client: httpx.AsyncClient) -> list[int]:
    """
    Fallback: Gọi Random.org để lấy n integers [0,255].
    Endpoint: GET https://www.random.org/integers/
    """
    response = await client.get(
        "https://www.random.org/integers/",
        params={
            "num": n,
            "min": 0,
            "max": 255,
            "col": 1,
            "base": 10,
            "format": "plain",
            "rnd": "new",
        },
    )
    response.raise_for_status()
    # Response là plain text, mỗi số trên 1 dòng
    return [int(line) for line in response.text.split()]


def _validate_bytes(data: object, n: int) -> list[int]:
    if not isinstance(data, list) or len(data) < n:
        raise ValueError(f"expected {n} values, got {data!r:.80}")
    values = [int(v) for v in data[:n]]
    if any(not 0 <= v <= 255 for v in values):
        raise ValueError("entropy values out of uint8 range")
    return values


async def fetch_quantum_bytes(n: int) -> tuple[list[int], str]:
    """
    Lấy n random bytes, ưu tiên nguồn lượng tử.

    Returns:
        (bytes_list, source) với source là "anu_qrng" | "random_org" | "os_entropy"
    """
    sources = (
        ("anu_qrng", _fetch_from_anu),
        ("random_org", _fetch_from_random_org),
    )
    async with httpx.AsyncClient(timeout=settings.ENTROPY_TIMEOUT_SECONDS) as client:
        for source, fetcher in sources:
            if time.monotonic() < _source_unavailable_until.get(source, 0.0):
                continue
            try:
                data = _validate_bytes(await fetcher(n, client), n)
                logger.info("Entropy fetched from %s (%d bytes)", source, n)
                return data, source
            except Exception as exc:
                _source_unavailable_until[source] = time.monotonic() + _SOURCE_COOLDOWN_SECONDS
                logger.warning(
                    "Entropy source %s unavailable (%s: %s) — skipping it for %ds",
                    source, type(exc).__name__, exc, _SOURCE_COOLDOWN_SECONDS,
                )

    # secrets.token_bytes() dùng CSPRNG của hệ điều hành — an toàn, chỉ không phải "lượng tử"
    logger.warning("Using local OS entropy as last-resort fallback (%d bytes)", n)
    return list(secrets.token_bytes(n)), "os_entropy"


# ---------------------------------------------------------------------------
# Unbiased card selection (partial Fisher–Yates + rejection sampling)
# ---------------------------------------------------------------------------

# Số byte dự phòng cho rejection sampling (xác suất loại 1 byte ≤ ~8.6% với 78 lá)
_SPARE_SELECTION_BYTES = 16


def _select_unique_indices(
    total: int,
    num_cards: int,
    entropy: list[int],
) -> tuple[list[int], list[int]]:
    """
    Chọn num_cards chỉ số khác nhau trong [0, total) bằng partial Fisher–Yates.

    Mỗi bước cần một số đều trong [0, m): byte b chỉ được nhận nếu
    b < 256 - 256 % m (loại bỏ modulo bias), rồi lấy b % m.
    Nếu hết entropy (cực hiếm) thì bổ sung từ secrets.

    Returns:
        (indices, accepted_bytes) — byte đã dùng để chọn từng lá.
    """
    pool = iter(entropy)
    positions = list(range(total))
    indices: list[int] = []
    accepted: list[int] = []

    for i in range(num_cards):
        m = total - i
        limit = 256 - (256 % m)
        while True:
            b = next(pool, None)
            if b is None:
                logger.warning("Selection entropy exhausted — topping up from OS entropy")
                b = secrets.randbelow(256)
            if b < limit:
                break
        j = i + (b % m)
        positions[i], positions[j] = positions[j], positions[i]
        indices.append(positions[i])
        accepted.append(b)

    return indices, accepted


# ---------------------------------------------------------------------------
# Main Draw Function
# ---------------------------------------------------------------------------


async def draw_cards(
    num_cards: int,
    spread_type: str,
    db: AsyncSession,
) -> DrawResult:
    """
    Rút num_cards lá bài (không lặp) với entropy lượng tử.

    Bố cục entropy (1 lần gọi API):
      bytes[0:num_cards]  → hướng lá (byte < 128 = upright)
      bytes[num_cards:]   → chọn lá (rejection sampling, có byte dự phòng)

    Raises:
        RuntimeError: nếu DB chưa đủ lá bài cho spread.
    """
    from app.models import Card  # import ở đây để tránh circular import

    result = await db.execute(
        select(Card.id, Card.name, Card.suit, Card.element).order_by(Card.id)
    )
    all_cards = result.fetchall()

    if len(all_cards) < num_cards:
        raise RuntimeError(
            f"Deck has only {len(all_cards)} cards but the spread needs {num_cards}. "
            "Run `python seed.py` to load the full 78-card deck."
        )

    total_bytes = num_cards * 2 + _SPARE_SELECTION_BYTES
    raw_bytes, source = await fetch_quantum_bytes(total_bytes)

    orientation_bytes = raw_bytes[:num_cards]
    indices, selection_bytes = _select_unique_indices(
        len(all_cards), num_cards, raw_bytes[num_cards:]
    )

    drawn_cards = []
    for position, (card_index, sel_byte, orient_byte) in enumerate(
        zip(indices, selection_bytes, orientation_bytes)
    ):
        card_row = all_cards[card_index]
        drawn_cards.append(DrawnCard(
            position_index=position,
            card_id=card_row.id,
            card_name=card_row.name,
            suit=card_row.suit,
            element=card_row.element,
            orientation="upright" if orient_byte < 128 else "reversed",
            raw_quantum_byte=sel_byte,
            orientation_byte=orient_byte,
        ))

    return DrawResult(
        spread_type=spread_type,
        drawn_cards=drawn_cards,
        quantum_source=source,
        raw_bytes_hex=bytes(raw_bytes).hex(),
    )
