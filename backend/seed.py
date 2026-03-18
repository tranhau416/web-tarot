"""
============================================================
Tarot Web App - Database Seeder
backend/seed.py
Agent 2: Data Engineer & Esoteric Researcher
============================================================

MỤC ĐÍCH:
  Đọc dữ liệu từ tarot_seed_data.json (hoặc mock_tarot_seed_data.json)
  và insert vào bảng `cards` trong PostgreSQL.

  Dùng INSERT ... ON CONFLICT (name) DO NOTHING để idempotent:
  Chạy nhiều lần không tạo duplicate.

CHẠY:
  cd backend
  python seed.py

  # Seed từ file mock (Phase 1 development):
  python seed.py --file mock_tarot_seed_data.json

YÊU CẦU TRƯỚC:
  1. PostgreSQL đang chạy
  2. createdb tarot_db  (hoặc DATABASE_URL trỏ đúng DB)
  3. pip install -r requirements.txt
  4. .env đã cấu hình DATABASE_URL
"""

from __future__ import annotations

import argparse
import asyncio
import json
import sys
from pathlib import Path
from typing import Any, Dict, List

from dotenv import load_dotenv
from sqlalchemy import func, select, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

# ─── Load .env ─────────────────────────────────────────────────────────────────
_ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

# Import settings & models từ app package
# Đảm bảo chạy script này từ thư mục backend/
# VD: cd backend && python seed.py
import os
_DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://tarot_user:tarot_pass@localhost:5432/tarot_db",
)

# Thêm backend/ vào sys.path để import app.models
_BACKEND_DIR = Path(__file__).parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from app.models import Base, Card  # noqa: E402


# ─── Engine Factory ────────────────────────────────────────────────────────────

def _create_engine(database_url: str):
    """Tạo async engine từ DATABASE_URL."""
    return create_async_engine(
        database_url,
        echo=False,          # Đặt True để debug SQL
        pool_pre_ping=True,
    )


def _make_session_factory(engine):
    """Tạo async session factory."""
    return sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )


# ─── Schema Creation (development helper) ─────────────────────────────────────

async def create_tables_if_needed(engine) -> None:
    """
    Tạo tất cả bảng nếu chưa tồn tại.

    LƯU Ý: Trong production dùng Alembic migration.
    Hàm này chỉ là tiện ích cho Phase 1 / development.
    """
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[Seed] ✓ Đảm bảo schema đã tồn tại (create_all idempotent)")


# ─── Seed Function ─────────────────────────────────────────────────────────────

async def seed_cards(json_path: str, database_url: str = _DATABASE_URL) -> int:
    """
    Đọc file JSON và insert vào bảng `cards`.

    Sử dụng INSERT ... ON CONFLICT (name) DO NOTHING:
      - Idempotent: chạy nhiều lần an toàn
      - Không ghi đè data đã tồn tại

    Parameters
    ----------
    json_path : str
        Đường dẫn tới file JSON chứa danh sách card dicts.
    database_url : str
        PostgreSQL connection string (asyncpg).

    Returns
    -------
    int
        Số bản ghi thực sự được insert.
    """
    json_file = Path(json_path)
    if not json_file.exists():
        raise FileNotFoundError(
            f"Không tìm thấy file seed: {json_file.resolve()}\n"
            "Hãy chạy fetch_tavily_data.py trước, "
            "hoặc dùng mock_tarot_seed_data.json."
        )

    print(f"[Seed] Đọc dữ liệu từ: {json_file.resolve()}")
    raw_data: List[Dict[str, Any]] = json.loads(json_file.read_text(encoding="utf-8"))
    print(f"[Seed] Tìm thấy {len(raw_data)} bản ghi trong file JSON")

    engine = _create_engine(database_url)
    AsyncSessionLocal = _make_session_factory(engine)

    # Tạo bảng nếu chưa có (safe cho dev)
    await create_tables_if_needed(engine)

    inserted_count = 0
    skipped_count = 0

    async with AsyncSessionLocal() as session:
        async with session.begin():
            for item in raw_data:
                # Map từ JSON dict sang Card columns
                values: Dict[str, Any] = {
                    "card_number":  item["card_number"],
                    "name":         item["name"],
                    "suit":         item["suit"],
                    "arcana":       item["arcana"],
                    "element":      item.get("element"),
                    "metadata_json": item.get("metadata_json"),
                    # Các trường dưới sẽ được bổ sung ở Phase 2
                    # khi có dữ liệu chiêm tinh đầy đủ hơn
                    "name_vi":          item.get("name_vi"),
                    "astro_decan":      item.get("astro_decan"),
                    "zodiac_mode":      item.get("zodiac_mode"),
                    "numerology_value": item.get("numerology_value"),
                    "image_url":        item.get("image_url"),
                }

                stmt = (
                    pg_insert(Card)
                    .values(**values)
                    .on_conflict_do_nothing(index_elements=["name"])
                )
                result = await session.execute(stmt)

                # rowcount > 0 nghĩa là đã insert thành công
                if result.rowcount and result.rowcount > 0:
                    inserted_count += 1
                else:
                    skipped_count += 1

        # Commit đã được gọi bởi context manager session.begin()

    await engine.dispose()

    print(f"[Seed] ✓ Insert thành công: {inserted_count} bản ghi")
    if skipped_count:
        print(f"[Seed] ↷ Bỏ qua (đã tồn tại): {skipped_count} bản ghi")

    return inserted_count


# ─── Verify Function ───────────────────────────────────────────────────────────

async def verify_seed(database_url: str = _DATABASE_URL) -> int:
    """
    Đếm số bản ghi hiện có trong bảng `cards` và in kết quả.

    Returns
    -------
    int
        Tổng số card records trong DB.
    """
    engine = _create_engine(database_url)
    AsyncSessionLocal = _make_session_factory(engine)

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(func.count()).select_from(Card))
        count: int = result.scalar_one()

    await engine.dispose()

    print(f"\n[Verify] Tổng số lá bài trong bảng `cards`: {count}")
    if count == 78:
        print("[Verify] ✓ Đủ 78 lá bài — bộ Tarot hoàn chỉnh!")
    elif count > 0:
        print(f"[Verify] ⚠ Mới có {count}/78 lá — còn thiếu {78 - count} lá.")
    else:
        print("[Verify] ✗ Bảng trống — hãy chạy seed_cards() trước.")

    return count


# ─── Main ──────────────────────────────────────────────────────────────────────

async def main(json_file: str) -> None:
    """
    Chạy toàn bộ pipeline: seed → verify.

    Parameters
    ----------
    json_file : str
        Đường dẫn file JSON seed (mặc định: tarot_seed_data.json).
    """
    print("=" * 60)
    print(" Tarot Web App — Database Seeder")
    print("=" * 60)
    print(f" Database: {_DATABASE_URL}")
    print(f" Seed file: {json_file}")
    print("=" * 60 + "\n")

    await seed_cards(json_path=json_file)
    await verify_seed()

    print("\n[Done] Seed hoàn tất.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Seed Tarot card data vào PostgreSQL."
    )
    parser.add_argument(
        "--file",
        type=str,
        default="tarot_seed_data.json",
        help=(
            "File JSON cần seed. Mặc định: tarot_seed_data.json\n"
            "Dùng mock_tarot_seed_data.json cho Phase 1 dev."
        ),
    )
    args = parser.parse_args()

    asyncio.run(main(json_file=args.file))
