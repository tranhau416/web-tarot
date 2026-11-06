"""
============================================================
Tarot Web App - Database Seeder
backend/seed.py
============================================================

MỤC ĐÍCH:
  Seed / cập nhật 78 lá bài Rider-Waite-Smith vào bảng `cards`.

  - Mặc định dùng bộ bài chuẩn có sẵn (app/data/tarot_deck.py):
    nguyên tố, decan Golden Dawn, zodiac mode, numerology, keywords, tên tiếng Việt.
  - `--file` (tuỳ chọn): ghép thêm dữ liệu từ JSON (VD: tarot_seed_data.json
    do fetch_tavily_data.py tạo) — metadata được merge, không mất keywords.

  Dùng INSERT ... ON CONFLICT (name) DO UPDATE nên chạy lại bao nhiêu lần
  cũng an toàn và sẽ sửa dữ liệu cũ/thiếu.

  Lưu ý: backend tự tạo bảng + đồng bộ bộ bài chuẩn mỗi lần khởi động,
  nên script này chủ yếu dùng để ghép metadata từ file JSON.

CHẠY:
  cd backend
  python seed.py                              # bộ bài chuẩn
  python seed.py --file tarot_seed_data.json  # + metadata Tavily
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path

# Đảm bảo import được package `app` khi chạy từ bất kỳ đâu
_BACKEND_DIR = Path(__file__).resolve().parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from sqlalchemy import func, select  # noqa: E402

from app.core.database import engine  # noqa: E402
from app.core.init_db import init_db, merge_card_records, upsert_cards  # noqa: E402
from app.data.tarot_deck import TAROT_DECK  # noqa: E402
from app.models import Card  # noqa: E402


async def main(json_file: str | None) -> None:
    records = TAROT_DECK
    if json_file:
        path = Path(json_file)
        if not path.is_absolute() and not path.exists():
            path = _BACKEND_DIR / path
        if not path.exists():
            raise SystemExit(f"[Seed] ✗ Không tìm thấy file: {path}")
        overrides = json.loads(path.read_text(encoding="utf-8"))
        print(f"[Seed] Ghép {len(overrides)} bản ghi từ {path}")
        records = merge_card_records(TAROT_DECK, overrides)

    # Tạo schema nếu cần (không đồng bộ tự động — ta upsert ngay bên dưới)
    await init_db(engine, sync_deck=False)

    async with engine.begin() as conn:
        written = await upsert_cards(conn, records)
        total = (await conn.execute(select(func.count()).select_from(Card))).scalar_one()

    await engine.dispose()

    print(f"[Seed] ✓ Upsert {written} lá bài")
    print(f"[Verify] Tổng số lá trong bảng `cards`: {total}")
    if total != len(TAROT_DECK):
        print(f"[Verify] ⚠ Mong đợi {len(TAROT_DECK)} lá — kiểm tra lại dữ liệu cũ trong DB.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed 78 lá Tarot vào PostgreSQL.")
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="File JSON (list card dict) để ghép thêm metadata, VD: tarot_seed_data.json",
    )
    args = parser.parse_args()
    asyncio.run(main(json_file=args.file))
