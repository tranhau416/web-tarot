"""
============================================================
Tarot Web App - Tavily Metadata Fetcher
backend/fetch_tavily_data.py
Agent 2: Data Engineer & Esoteric Researcher
============================================================

MỤC ĐÍCH:
  Dùng Tavily Search API để fetch metadata phong phú cho từng
  trong 78 lá bài Tarot (Rider-Waite-Smith).

DEMO MODE (Phase 1):
  Mặc định chỉ fetch 1 lá bài mẫu: "The Fool"
  Để fetch đầy đủ 78 lá, tìm comment "# FULL MODE" và bỏ comment.

CHẠY:
  cd backend
  python fetch_tavily_data.py

OUTPUT:
  backend/tarot_seed_data.json
"""

from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from tavily import TavilyClient

# ─── Load .env ─────────────────────────────────────────────────────────────────
# Tìm .env ở cùng thư mục với script này (backend/.env)
_ENV_PATH = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)

TAVILY_API_KEY: str = os.getenv("TAVILY_API_KEY", "")
OUTPUT_FILE: Path = Path(__file__).parent / "tarot_seed_data.json"


# ─── 78 lá bài Tarot (Rider-Waite-Smith) ──────────────────────────────────────
# card_number: 0–77 (theo thứ tự truyền thống)
# suit       : major_arcana | wands | cups | swords | pentacles
# arcana     : major | minor
# element    : fire | water | air | earth | spirit | None
TAROT_CARDS: List[Dict[str, Any]] = [
    # ── Major Arcana (0–21) ───────────────────────────────────────────────
    {"card_number": 0,  "name": "The Fool",           "suit": "major_arcana", "arcana": "major", "element": "spirit"},
    {"card_number": 1,  "name": "The Magician",        "suit": "major_arcana", "arcana": "major", "element": "spirit"},
    {"card_number": 2,  "name": "The High Priestess",  "suit": "major_arcana", "arcana": "major", "element": "water"},
    {"card_number": 3,  "name": "The Empress",         "suit": "major_arcana", "arcana": "major", "element": "earth"},
    {"card_number": 4,  "name": "The Emperor",         "suit": "major_arcana", "arcana": "major", "element": "fire"},
    {"card_number": 5,  "name": "The Hierophant",      "suit": "major_arcana", "arcana": "major", "element": "earth"},
    {"card_number": 6,  "name": "The Lovers",          "suit": "major_arcana", "arcana": "major", "element": "air"},
    {"card_number": 7,  "name": "The Chariot",         "suit": "major_arcana", "arcana": "major", "element": "water"},
    {"card_number": 8,  "name": "Strength",            "suit": "major_arcana", "arcana": "major", "element": "fire"},
    {"card_number": 9,  "name": "The Hermit",          "suit": "major_arcana", "arcana": "major", "element": "earth"},
    {"card_number": 10, "name": "Wheel of Fortune",    "suit": "major_arcana", "arcana": "major", "element": "spirit"},
    {"card_number": 11, "name": "Justice",             "suit": "major_arcana", "arcana": "major", "element": "air"},
    {"card_number": 12, "name": "The Hanged Man",      "suit": "major_arcana", "arcana": "major", "element": "water"},
    {"card_number": 13, "name": "Death",               "suit": "major_arcana", "arcana": "major", "element": "water"},
    {"card_number": 14, "name": "Temperance",          "suit": "major_arcana", "arcana": "major", "element": "fire"},
    {"card_number": 15, "name": "The Devil",           "suit": "major_arcana", "arcana": "major", "element": "earth"},
    {"card_number": 16, "name": "The Tower",           "suit": "major_arcana", "arcana": "major", "element": "fire"},
    {"card_number": 17, "name": "The Star",            "suit": "major_arcana", "arcana": "major", "element": "air"},
    {"card_number": 18, "name": "The Moon",            "suit": "major_arcana", "arcana": "major", "element": "water"},
    {"card_number": 19, "name": "The Sun",             "suit": "major_arcana", "arcana": "major", "element": "fire"},
    {"card_number": 20, "name": "Judgement",           "suit": "major_arcana", "arcana": "major", "element": "fire"},
    {"card_number": 21, "name": "The World",           "suit": "major_arcana", "arcana": "major", "element": "earth"},

    # ── Suit of Wands (Fire) — card_number 22–35 ────────────────────────
    {"card_number": 22, "name": "Ace of Wands",         "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 23, "name": "Two of Wands",         "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 24, "name": "Three of Wands",       "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 25, "name": "Four of Wands",        "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 26, "name": "Five of Wands",        "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 27, "name": "Six of Wands",         "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 28, "name": "Seven of Wands",       "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 29, "name": "Eight of Wands",       "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 30, "name": "Nine of Wands",        "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 31, "name": "Ten of Wands",         "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 32, "name": "Page of Wands",        "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 33, "name": "Knight of Wands",      "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 34, "name": "Queen of Wands",       "suit": "wands", "arcana": "minor", "element": "fire"},
    {"card_number": 35, "name": "King of Wands",        "suit": "wands", "arcana": "minor", "element": "fire"},

    # ── Suit of Cups (Water) — card_number 36–49 ────────────────────────
    {"card_number": 36, "name": "Ace of Cups",          "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 37, "name": "Two of Cups",          "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 38, "name": "Three of Cups",        "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 39, "name": "Four of Cups",         "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 40, "name": "Five of Cups",         "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 41, "name": "Six of Cups",          "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 42, "name": "Seven of Cups",        "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 43, "name": "Eight of Cups",        "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 44, "name": "Nine of Cups",         "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 45, "name": "Ten of Cups",          "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 46, "name": "Page of Cups",         "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 47, "name": "Knight of Cups",       "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 48, "name": "Queen of Cups",        "suit": "cups", "arcana": "minor", "element": "water"},
    {"card_number": 49, "name": "King of Cups",         "suit": "cups", "arcana": "minor", "element": "water"},

    # ── Suit of Swords (Air) — card_number 50–63 ────────────────────────
    {"card_number": 50, "name": "Ace of Swords",        "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 51, "name": "Two of Swords",        "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 52, "name": "Three of Swords",      "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 53, "name": "Four of Swords",       "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 54, "name": "Five of Swords",       "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 55, "name": "Six of Swords",        "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 56, "name": "Seven of Swords",      "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 57, "name": "Eight of Swords",      "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 58, "name": "Nine of Swords",       "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 59, "name": "Ten of Swords",        "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 60, "name": "Page of Swords",       "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 61, "name": "Knight of Swords",     "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 62, "name": "Queen of Swords",      "suit": "swords", "arcana": "minor", "element": "air"},
    {"card_number": 63, "name": "King of Swords",       "suit": "swords", "arcana": "minor", "element": "air"},

    # ── Suit of Pentacles (Earth) — card_number 64–77 ───────────────────
    {"card_number": 64, "name": "Ace of Pentacles",     "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 65, "name": "Two of Pentacles",     "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 66, "name": "Three of Pentacles",   "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 67, "name": "Four of Pentacles",    "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 68, "name": "Five of Pentacles",    "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 69, "name": "Six of Pentacles",     "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 70, "name": "Seven of Pentacles",   "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 71, "name": "Eight of Pentacles",   "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 72, "name": "Nine of Pentacles",    "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 73, "name": "Ten of Pentacles",     "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 74, "name": "Page of Pentacles",    "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 75, "name": "Knight of Pentacles",  "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 76, "name": "Queen of Pentacles",   "suit": "pentacles", "arcana": "minor", "element": "earth"},
    {"card_number": 77, "name": "King of Pentacles",    "suit": "pentacles", "arcana": "minor", "element": "earth"},
]

# Tạo lookup dict: card_number → card info (tiện dùng khi cần)
TAROT_CARDS_BY_NUMBER: Dict[int, Dict[str, Any]] = {
    c["card_number"]: c for c in TAROT_CARDS
}


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

async def main() -> None:
    """
    Entry point chính.

    ► DEMO MODE (Phase 1):
        Chỉ fetch lá bài The Fool để kiểm tra pipeline.

    ► FULL MODE (78 lá):
        Comment dòng `cards_to_fetch = [TAROT_CARDS[0]]`
        Bỏ comment dòng `cards_to_fetch = TAROT_CARDS`
        và dòng `await asyncio.sleep(1.2)` để tránh rate-limit Tavily.
    """
    if not TAVILY_API_KEY:
        raise ValueError(
            "TAVILY_API_KEY chưa được thiết lập.\n"
            "Hãy copy .env.example → .env và điền key vào."
        )

    client = TavilyClient(api_key=TAVILY_API_KEY)
    results: List[Dict[str, Any]] = []

    # ── DEMO MODE: chỉ fetch 1 lá mẫu ───────────────────────────────────────
    cards_to_fetch = [TAROT_CARDS[0]]  # The Fool

    # ── FULL MODE: bỏ comment dòng dưới để fetch đủ 78 lá ───────────────────
    # cards_to_fetch = TAROT_CARDS

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

        # ── FULL MODE rate-limit guard: bỏ comment dòng dưới ────────────────
        # if idx < total:
        #     await asyncio.sleep(1.2)  # ~50 requests/phút cho Tavily free tier

    # Ghi file JSON
    OUTPUT_FILE.write_text(
        json.dumps(results, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\n[Tavily Fetcher] ✓ Đã lưu {len(results)} bản ghi → {OUTPUT_FILE}")


if __name__ == "__main__":
    asyncio.run(main())
