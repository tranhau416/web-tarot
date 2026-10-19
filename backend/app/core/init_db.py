"""
============================================================
Tarot Web App - Database bootstrap (schema + card seed)
backend/app/core/init_db.py
============================================================

Dùng chung cho:
  - FastAPI lifespan (main.py): tự tạo bảng và đồng bộ bộ bài chuẩn 78 lá
    (app/data/tarot_deck.py là nguồn dữ liệu gốc), để `docker compose up` là
    chạy được ngay và DB cũ tự nhận dữ liệu mới (VD: image_url).
  - seed.py: seed thủ công / ghép metadata từ file JSON (VD: Tavily).

Postgres advisory lock đảm bảo nhiều uvicorn worker khởi động song song
không tạo bảng / ENUM trùng nhau.
"""

from __future__ import annotations

import logging
from typing import Any, Iterable

from sqlalchemy import func, literal_column, select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine

from app.data.tarot_deck import TAROT_DECK
from app.models import Base, Card

logger = logging.getLogger(__name__)

_INIT_LOCK_ID = 7_274_2026  # hằng số tuỳ ý cho pg_advisory_xact_lock

CARD_COLUMNS = (
    "card_number", "name", "name_vi", "suit", "arcana", "element",
    "astro_decan", "zodiac_mode", "numerology_value", "image_url", "metadata_json",
)


def merge_card_records(
    base: Iterable[dict[str, Any]],
    overrides: Iterable[dict[str, Any]],
) -> list[dict[str, Any]]:
    """
    Ghép dữ liệu bổ sung (VD: kết quả Tavily) lên bộ bài chuẩn theo `name`.

    - Trường top-level: chỉ ghi đè khi giá trị override khác None.
    - metadata_json: merge key-level (giữ keywords/astrology của bộ chuẩn).
    """
    merged = {c["name"]: {**c, "metadata_json": dict(c.get("metadata_json") or {})} for c in base}
    for item in overrides:
        name = item.get("name")
        if name not in merged:
            logger.warning("Bỏ qua lá không có trong bộ chuẩn: %r", name)
            continue
        target = merged[name]
        for key in CARD_COLUMNS:
            if key in ("name", "metadata_json"):
                continue
            if item.get(key) is not None:
                target[key] = item[key]
        target["metadata_json"].update(item.get("metadata_json") or {})
    return list(merged.values())


async def upsert_cards(conn: AsyncConnection, records: list[dict[str, Any]]) -> int:
    """
    INSERT ... ON CONFLICT (name) DO UPDATE — idempotent, sửa được dữ liệu cũ.

    - id cố định = card_number + 1 (1–78) cho lá mới; lá đã tồn tại giữ nguyên id
      (draw_logs tham chiếu tới nó).
    - metadata_json được merge (jsonb ||): key mới ghi đè, key cũ khác (VD: kết
      quả Tavily) được giữ lại.
    """
    rows = [
        {"id": record["card_number"] + 1, **{key: record.get(key) for key in CARD_COLUMNS}}
        for record in records
    ]
    stmt = pg_insert(Card.__table__).values(rows)
    stmt = stmt.on_conflict_do_update(
        index_elements=["name"],
        set_={
            key: stmt.excluded[key]
            for key in CARD_COLUMNS
            if key not in ("name", "metadata_json")
        }
        | {
            "metadata_json": literal_column(
                "COALESCE(cards.metadata_json, '{}'::jsonb) || excluded.metadata_json"
            ),
            "updated_at": func.now(),
        },
    )
    await conn.execute(stmt)
    # id được gán tay → đồng bộ sequence để INSERT không kèm id sau này không trùng
    await conn.execute(text(
        "SELECT setval(pg_get_serial_sequence('cards', 'id'), "
        "(SELECT COALESCE(MAX(id), 1) FROM cards))"
    ))
    return len(rows)


async def init_db(engine: AsyncEngine, sync_deck: bool = True) -> None:
    """Tạo schema (idempotent) và đồng bộ bộ bài chuẩn vào bảng `cards`."""
    async with engine.begin() as conn:
        await conn.execute(text(f"SELECT pg_advisory_xact_lock({_INIT_LOCK_ID})"))
        await conn.run_sync(Base.metadata.create_all)

        if not sync_deck:
            return

        before = (await conn.execute(select(func.count()).select_from(Card))).scalar_one()
        await upsert_cards(conn, TAROT_DECK)
        logger.info("Synced built-in tarot deck (%d → %d cards)", before, len(TAROT_DECK))
