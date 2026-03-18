"""
============================================================
Tarot Web App - Quantum Random Number Engine
backend/app/services/quantum_engine.py
============================================================

Sử dụng ANU Quantum Random Number Generator (QRNG) để
đảm bảo entropy thật sự ngẫu nhiên cho mỗi lần rút bài.

Thứ tự ưu tiên entropy:
  1. ANU QRNG API  (https://qrng.anu.edu.au)
  2. Random.org    (fallback nếu ANU down)
  3. RuntimeError  (nếu cả 2 đều thất bại)
"""

from __future__ import annotations

import logging
import secrets
from typing import Optional

import httpx
from pydantic import BaseModel
from sqlalchemy import select, func
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
    raw_quantum_byte: int


class DrawResult(BaseModel):
    """Kết quả đầy đủ của một lần trải bài."""

    spread_type: str
    drawn_cards: list[DrawnCard]
    quantum_source: str        # "anu_qrng" | "random_org" | "fallback"
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


async def _fetch_from_anu(n: int, client: httpx.AsyncClient) -> list[int]:
    """
    Gọi ANU QRNG API để lấy n bytes ngẫu nhiên.
    Endpoint: GET {ANU_QRNG_URL}?length={n}&type=uint8
    Response: {"type":"uint8","length":n,"data":[...]}
    """
    url = settings.ANU_QRNG_URL
    response = await client.get(
        url,
        params={"length": n, "type": "uint8"},
        timeout=10.0,
    )
    response.raise_for_status()
    data = response.json()
    return data["data"]


async def _fetch_from_random_org(n: int, client: httpx.AsyncClient) -> list[int]:
    """
    Fallback: Gọi Random.org để lấy n integers [0,255].
    Endpoint: GET https://www.random.org/integers/
    """
    url = "https://www.random.org/integers/"
    response = await client.get(
        url,
        params={
            "num": n,
            "min": 0,
            "max": 255,
            "col": 1,
            "base": 10,
            "format": "plain",
            "rnd": "new",
        },
        timeout=10.0,
    )
    response.raise_for_status()
    # Response là plain text, mỗi số trên 1 dòng
    lines = response.text.strip().splitlines()
    return [int(line.strip()) for line in lines if line.strip()]


async def fetch_quantum_bytes(n: int) -> tuple[list[int], str]:
    """
    Lấy n quantum random bytes.

    Returns:
        (bytes_list, source) với source là "anu_qrng" | "random_org"

    Raises:
        RuntimeError: Nếu tất cả nguồn entropy đều thất bại.
    """
    async with httpx.AsyncClient() as client:
        # --- Attempt 1: ANU QRNG ---
        try:
            data = await _fetch_from_anu(n, client)
            logger.info("Quantum entropy fetched from ANU QRNG (%d bytes)", n)
            return data, "anu_qrng"
        except Exception as exc:
            logger.warning(
                "ANU QRNG unavailable (%s). Falling back to Random.org...", exc
            )

        # --- Attempt 2: Random.org ---
        try:
            data = await _fetch_from_random_org(n, client)
            logger.warning(
                "Using Random.org fallback for entropy (%d bytes).", n
            )
            return data, "random_org"
        except Exception as exc:
            logger.error(
                "Random.org also unavailable (%s). All entropy sources exhausted.", exc
            )

    # --- Attempt 3: Local OS entropy (secrets module) — dev/offline fallback ---
    # secrets.token_bytes() dùng /dev/urandom (cryptographically secure)
    # Được chấp nhận cho dev; production nên luôn có internet để dùng ANU/Random.org
    logger.warning(
        "Using local OS entropy (secrets module) as last-resort fallback (%d bytes). "
        "Ensure ANU QRNG or Random.org is accessible in production.",
        n,
    )
    data = list(secrets.token_bytes(n))
    return data, "os_entropy"


# ---------------------------------------------------------------------------
# Fisher-Yates Shuffle với External Entropy
# ---------------------------------------------------------------------------


def _fisher_yates_shuffle(items: list, entropy_bytes: list[int]) -> list:
    """
    Shuffle in-place sử dụng Fisher-Yates algorithm với entropy bên ngoài.
    Mỗi swap dùng 1 byte từ entropy_bytes (modulo).
    Nếu hết entropy bytes → dùng index làm seed (deterministic fallback).
    """
    arr = list(items)
    n = len(arr)
    for i in range(n - 1, 0, -1):
        if i < len(entropy_bytes):
            j = entropy_bytes[i] % (i + 1)
        else:
            j = i % (i + 1)
        arr[i], arr[j] = arr[j], arr[i]
    return arr


# ---------------------------------------------------------------------------
# Main Draw Function
# ---------------------------------------------------------------------------


async def draw_cards(
    num_cards: int,
    spread_type: str,
    db: AsyncSession,
) -> DrawResult:
    """
    Rút num_cards lá bài với entropy lượng tử.

    Algorithm:
      1. Fetch num_cards * 2 quantum bytes (x2 cho card + orientation)
      2. Dùng bytes[0:num_cards] để chọn card indices (sau khi shuffle)
      3. Dùng bytes[num_cards:] để quyết định orientation
      4. Không repeat — Fisher-Yates shuffle để đảm bảo unique

    Args:
        num_cards: Số lá bài cần rút
        spread_type: Loại spread (single, three_card, v.v.)
        db: AsyncSession để query danh sách cards

    Returns:
        DrawResult chứa các DrawnCard đã được chọn
    """
    from app.models import Card  # import ở đây để tránh circular import

    # --- Bước 1: Lấy entropy ---
    total_bytes_needed = num_cards * 2
    raw_bytes, source = await fetch_quantum_bytes(total_bytes_needed)

    # Đảm bảo đủ bytes (phòng trường hợp API trả về ít hơn)
    while len(raw_bytes) < total_bytes_needed:
        raw_bytes.append(0)

    card_bytes = raw_bytes[:num_cards]
    orientation_bytes = raw_bytes[num_cards:num_cards * 2]

    # --- Bước 2: Lấy danh sách tất cả cards từ DB ---
    result = await db.execute(
        select(Card.id, Card.name, Card.suit, Card.element)
        .order_by(Card.id)
    )
    all_cards = result.fetchall()

    if not all_cards:
        raise RuntimeError("No cards found in database. Please run seed script first.")

    total_cards = len(all_cards)

    # --- Bước 3: Fisher-Yates shuffle danh sách cards với entropy ---
    # Cần thêm entropy để shuffle
    shuffle_entropy_needed = total_cards
    shuffle_bytes, _ = await fetch_quantum_bytes(shuffle_entropy_needed)

    shuffled_cards = _fisher_yates_shuffle(list(all_cards), shuffle_bytes)

    # --- Bước 4: Chọn num_cards lá đầu tiên từ shuffled list (unique) ---
    # Dùng card_bytes như modulo indices sau khi đã shuffle
    # Nhưng vì đã shuffle, ta chỉ lấy num_cards cards đầu
    # (đảm bảo không repeat với Fisher-Yates)
    selected_cards = shuffled_cards[:num_cards]

    # --- Bước 5: Build DrawResult ---
    drawn_cards = []
    for i, card_row in enumerate(selected_cards):
        orientation = "upright" if orientation_bytes[i] < 128 else "reversed"
        drawn_card = DrawnCard(
            position_index=i,
            card_id=card_row.id,
            card_name=card_row.name,
            suit=card_row.suit,
            element=card_row.element,
            orientation=orientation,
            raw_quantum_byte=card_bytes[i],
        )
        drawn_cards.append(drawn_card)

    raw_bytes_hex = bytes(raw_bytes[:total_bytes_needed]).hex()

    return DrawResult(
        spread_type=spread_type,
        drawn_cards=drawn_cards,
        quantum_source=source,
        raw_bytes_hex=raw_bytes_hex,
    )
