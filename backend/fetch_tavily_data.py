"""
============================================================
Tarot Web App - Tavily Metadata Fetcher
backend/fetch_tavily_data.py
Agent 2: Data Engineer & Esoteric Researcher
============================================================

MỤC ĐÍCH:
  Dùng Tavily Search API để fetch metadata phong phú cho từng
  trong 78 lá bài Tarot (Rider-Waite-Smith).

CHẠY:
  cd backend
  python fetch_tavily_data.py            # đủ 78 lá (~2 phút)
  python fetch_tavily_data.py --limit 1  # thử pipeline với 1 lá

  python seed.py --file tarot_seed_data.json   # ghép metadata vào DB

OUTPUT:
  backend/tarot_seed_data.json (chỉ chứa metadata Tavily; các trường chiêm
  tinh/keywords lấy từ bộ bài chuẩn app/data/tarot_deck.py khi seed)
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from tavily import TavilyClient

from app.data.tarot_deck import TAROT_DECK

# ─── Load .env ─────────────────────────────────────────────────────────────────
# Tìm .env ở cùng thư mục với script này (backend/.env)
_ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
OUTPUT_FILE: Path = Path(__file__).parent / "tarot_seed_data.json"


# ─── 78 lá bài Tarot (Rider-Waite-Smith) — dùng chung bộ bài chuẩn ─────────────
TAROT_CARDS: List[Dict[str, Any]] = TAROT_DECK


# ─── Query Builder ─────────────────────────────────────────────────────────────

def build_search_query(card: Dict[str, Any]) -> str:
    """
    Tạo Tavily search query tối ưu cho từng lá bài.

    Major Arcana:
        "The Fool tarot card meaning upright reversed keywords astrology numerology"
    Minor Arcana:
        "Ace of Wands tarot meaning fire element upright reversed decan astrology"
    """
    name: str = card["name"]
    arcana: str = card["arcana"]
    element: Optional[str] = card.get("element")

    if arcana == "major":
        return (
            f"{name} tarot card meaning upright reversed "
            f"keywords astrology numerology"
        )
    else:
        # Minor arcana — thêm element để tăng chất lượng kết quả
        element_str = f"{element} element " if element else ""
        return (
            f"{name} tarot meaning {element_str}"
            f"upright reversed decan astrology"
        )


# ─── Fetch Function ────────────────────────────────────────────────────────────

async def fetch_card_data(
    client: TavilyClient,
    card: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Gọi Tavily Search API cho một lá bài, trả về dict chuẩn sẵn sàng
    lưu vào PostgreSQL (trường metadata_json).

    Parameters
    ----------
    client : TavilyClient
        Tavily client đã khởi tạo với API key.
    card : dict
        Thông tin lá bài từ TAROT_CARDS.

    Returns
    -------
    dict với schema:
        {
            "card_number": int,
            "name": str,
            "suit": str,
            "arcana": str,
            "element": str | None,
            "metadata_json": {
                "tavily_answer": str | None,
                "tavily_results": list[dict],
                "query_used": str
            }
        }
    """
    query = build_search_query(card)

    # Tavily client hiện tại là synchronous — wrap trong executor để
    # không block event loop khi gọi trong asyncio context.
    loop = asyncio.get_event_loop()
    response: Dict[str, Any] = await loop.run_in_executor(
        None,
        lambda: client.search(
            query=query,
            search_depth="advanced",
            max_results=5,
            include_answer=True,
        ),
    )

    # Parse response
    tavily_answer: Optional[str] = response.get("answer")
    tavily_results: List[Dict[str, Any]] = response.get("results", [])

    # Làm sạch results: chỉ giữ các trường cần thiết
    clean_results = [
        {
            "title":   r.get("title", ""),
            "url":     r.get("url", ""),
            "content": r.get("content", ""),
            "score":   r.get("score", 0.0),
        }
        for r in tavily_results
    ]

    return {
        "card_number": card["card_number"],
        "name":        card["name"],
        "suit":        card["suit"],
        "arcana":      card["arcana"],
        "element":     card.get("element"),
        "metadata_json": {
            "tavily_answer":  tavily_answer,
            "tavily_results": clean_results,
            "query_used":     query,
        },
    }


# ─── Main ──────────────────────────────────────────────────────────────────────

async def main(limit: Optional[int] = None) -> None:
    """
    Entry point chính: fetch metadata Tavily cho `limit` lá đầu tiên
    (mặc định: đủ 78 lá, có nghỉ giữa các request để tránh rate-limit).
    """
    if not TAVILY_API_KEY:
        raise ValueError(
            "TAVILY_API_KEY chưa được thiết lập.\n"
            "Hãy copy .env.example → .env và điền key vào."
        )

    client = TavilyClient(api_key=TAVILY_API_KEY)
    results: List[Dict[str, Any]] = []

    cards_to_fetch = TAROT_CARDS[:limit] if limit else TAROT_CARDS

    total = len(cards_to_fetch)
    print(f"[Tavily Fetcher] Bắt đầu fetch {total} lá bài...")
    print(f"[Tavily Fetcher] Output: {OUTPUT_FILE}\n")

    for idx, card in enumerate(cards_to_fetch, start=1):
        print(f"  [{idx:>2}/{total}] Fetching: {card['name']} ...", end=" ", flush=True)
        try:
            data = await fetch_card_data(client, card)
            results.append(data)
            answer_preview = (
                (data["metadata_json"]["tavily_answer"] or "")[:80].replace("\n", " ")
            )
            print(f"OK — answer: {answer_preview!r}")
        except Exception as exc:
            print(f"LỖI — {exc}")
            # Thêm placeholder để không mất thứ tự
            results.append(
                {
                    "card_number": card["card_number"],
                    "name":        card["name"],
                    "suit":        card["suit"],
                    "arcana":      card["arcana"],
                    "element":     card.get("element"),
                    "metadata_json": {
                        "tavily_answer":  None,
                        "tavily_results": [],
                        "query_used":     build_search_query(card),
                        "fetch_error":    str(exc),
                    },
                }
            )

        if idx < total:
            await asyncio.sleep(1.2)  # ~50 requests/phút cho Tavily free tier

    # Ghi file JSON
    OUTPUT_FILE.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\n[Tavily Fetcher] ✓ Đã lưu {len(results)} bản ghi → {OUTPUT_FILE}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Fetch metadata Tavily cho 78 lá Tarot.")
    parser.add_argument("--limit", type=int, default=None, help="Chỉ fetch N lá đầu tiên")
    args = parser.parse_args()
    asyncio.run(main(limit=args.limit))
