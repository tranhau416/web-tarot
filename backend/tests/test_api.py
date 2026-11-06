"""Test API end-to-end với PostgreSQL thật (xem conftest.db_ready)."""

import json
import uuid

import pytest
from sqlalchemy import func, select, text

from app.core.init_db import init_db, upsert_cards
from app.data.tarot_deck import TAROT_DECK
from app.models import Card, DrawLog

ADULT = {"X-Adult-Confirmed": "true"}


def _events(body: str) -> list[dict]:
    return [
        json.loads(chunk[len("data: "):])
        for chunk in body.split("\n\n")
        if chunk.startswith("data: ")
    ]


async def test_health(client):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"


async def test_cards_endpoint_serves_full_deck(client):
    res = await client.get("/api/v1/cards")
    cards = res.json()
    assert len(cards) == 78
    assert [c["id"] for c in cards] == list(range(1, 79))
    fool = (await client.get("/api/v1/cards/1")).json()
    assert fool["name"] == "The Fool"
    assert fool["image_url"] == "/cards/00-the-fool.webp"
    assert (await client.get("/api/v1/cards/999")).status_code == 404


@pytest.mark.parametrize(
    ("spread", "labels"),
    [
        ("single", ["The Card"]),
        ("three_card", ["Past", "Present", "Future"]),
        ("horseshoe", None),
        ("celtic_cross", None),
    ],
)
async def test_draw_returns_full_unique_spread(client, spread, labels):
    res = await client.post("/api/v1/draw", json={"spread_type": spread}, headers=ADULT)
    assert res.status_code == 201
    body = res.json()
    cards = body["interpretation"]["cards"]
    expected = {"single": 1, "three_card": 3, "horseshoe": 7, "celtic_cross": 10}[spread]

    assert len(cards) == expected
    assert len({c["card_id"] for c in cards}) == expected
    assert [c["position_index"] for c in cards] == list(range(expected))
    assert all(c["position_label"] for c in cards)
    if labels:
        assert [c["position_label"] for c in cards] == labels
    for c in cards:
        assert c["keywords_upright"] and c["keywords_reversed"]
        assert c["keywords_upright_vi"] and c["keywords_reversed_vi"]
        assert c["name_vi"] and c["position_label_vi"] and c["dignity_label_vi"]
        assert c["astro_decan_vi"] and c["timing"]["range_vi"] and c["timing"]["notes_vi"]
        assert c["image_url"].startswith("/cards/")
    assert body["interpretation"]["dominant_element_vi"] in {"Lửa", "Nước", "Khí", "Đất"}
    assert body["interpretation"]["quantum_source"] == "os_entropy"
    assert body["disclaimer"]


@pytest.mark.parametrize("path", ["/api/v1/draw", "/api/v1/draw/ai-stream"])
async def test_compliance_gate_blocks_without_header(client, path):
    res = await client.post(
        path,
        json={"spread_type": "single"},
        headers={"Origin": "http://localhost:3000"},
    )
    assert res.status_code == 403
    assert res.json()["compliance_gate"] == "adult_verification"
    # CORS header vẫn có để browser đọc được lỗi
    assert res.headers["access-control-allow-origin"] == "http://localhost:3000"


async def test_unknown_user_returns_404(client):
    res = await client.post(
        "/api/v1/draw",
        json={"spread_type": "single", "user_id": str(uuid.uuid4())},
        headers=ADULT,
    )
    assert res.status_code == 404


async def test_ai_stream_sends_draw_tokens_done_and_persists(client, db_ready):
    res = await client.post(
        "/api/v1/draw/ai-stream",
        json={"spread_type": "three_card", "intention": "Tình yêu?"},
        headers=ADULT,
    )
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("text/event-stream")

    events = _events(res.text)
    assert events[0]["type"] == "draw_result"
    assert events[-1]["type"] == "done"
    tokens = [e["text"] for e in events if e["type"] == "token"]
    reading = "".join(tokens)
    assert "Tình yêu?" in reading
    for card in events[0]["interpretation"]["cards"]:
        assert card["card_name"] in reading

    session_id = uuid.UUID(events[0]["session_id"])
    async with db_ready.connect() as conn:
        count = await conn.scalar(
            select(func.count()).select_from(DrawLog).where(DrawLog.session_id == session_id)
        )
    assert count == 3


async def test_deck_sync_keeps_extra_metadata(db_ready):
    async with db_ready.begin() as conn:
        await conn.execute(text(
            "UPDATE cards SET metadata_json = metadata_json || '{\"tavily_answer\": \"x\"}'::jsonb, "
            "image_url = NULL WHERE name = 'The Fool'"
        ))
    await init_db(db_ready)

    async with db_ready.connect() as conn:
        row = (await conn.execute(
            select(Card.image_url, Card.metadata_json).where(Card.name == "The Fool")
        )).one()
        total = await conn.scalar(select(func.count()).select_from(Card))
    assert total == 78
    assert row.image_url == "/cards/00-the-fool.webp"
    assert row.metadata_json["tavily_answer"] == "x"
    assert row.metadata_json["keywords_upright"]


async def test_upsert_is_idempotent(db_ready):
    async with db_ready.begin() as conn:
        await upsert_cards(conn, TAROT_DECK)
        await upsert_cards(conn, TAROT_DECK)
        ids = (await conn.execute(select(Card.id).order_by(Card.id))).scalars().all()
    assert ids == list(range(1, 79))
