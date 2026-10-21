import re
from collections import Counter

import pytest

from app.core.init_db import merge_card_records
from app.data.tarot_deck import TAROT_DECK, TAROT_DECK_BY_NAME
from app.data.vi import KEYWORDS_VI, astro_vi


def test_deck_has_78_unique_cards():
    assert len(TAROT_DECK) == 78
    assert len({c["name"] for c in TAROT_DECK}) == 78
    assert [c["card_number"] for c in TAROT_DECK] == list(range(78))
    assert Counter(c["suit"] for c in TAROT_DECK) == {
        "major_arcana": 22, "wands": 14, "cups": 14, "swords": 14, "pentacles": 14,
    }


def test_every_card_has_keywords_and_vietnamese_name():
    for card in TAROT_DECK:
        meta = card["metadata_json"]
        assert meta["keywords_upright"], card["name"]
        assert meta["keywords_reversed"], card["name"]
        assert card["name_vi"], card["name"]
        assert card["element"] in {"fire", "water", "air", "earth"}


@pytest.mark.parametrize(
    ("name", "zodiac_mode", "astro_decan", "numerology"),
    [
        ("Two of Wands", "cardinal", "Mars in Aries (0°–10°)", 2),
        ("Six of Cups", "fixed", "Sun in Scorpio (10°–20°)", 6),
        ("Ten of Swords", "mutable", "Sun in Gemini (20°–30°)", 10),
        ("Seven of Pentacles", "fixed", "Saturn in Taurus (20°–30°)", 7),
        ("Knight of Wands", "mutable", "20° Scorpio – 20° Sagittarius", 12),
        ("Queen of Cups", "cardinal", "20° Gemini – 20° Cancer", 13),
        ("King of Pentacles", "fixed", "20° Aries – 20° Taurus", 14),
        ("Page of Swords", None, "Earth of Air", 11),
        ("Ace of Cups", None, "Root of Water", 1),
        ("The Emperor", None, "Aries", 4),
    ],
)
def test_golden_dawn_attributions(name, zodiac_mode, astro_decan, numerology):
    card = TAROT_DECK_BY_NAME[name]
    assert card["zodiac_mode"] == zodiac_mode
    assert card["astro_decan"] == astro_decan
    assert card["numerology_value"] == numerology


def test_columns_fit_database_limits():
    for card in TAROT_DECK:
        assert len(card["name"]) <= 100
        assert len(card["name_vi"]) <= 150
        assert len(card["astro_decan"] or "") <= 50


def test_merge_keeps_base_metadata_and_overrides_fields():
    merged = merge_card_records(
        TAROT_DECK,
        [
            {
                "name": "The Fool",
                "element": None,  # None không ghi đè
                "image_url": "https://example.com/fool.jpg",
                "metadata_json": {"tavily_answer": "A new journey"},
            },
            {"name": "Not A Card", "metadata_json": {"x": 1}},
        ],
    )
    fool = next(c for c in merged if c["name"] == "The Fool")
    assert len(merged) == 78
    assert fool["element"] == "air"
    assert fool["image_url"] == "https://example.com/fool.jpg"
    assert fool["metadata_json"]["tavily_answer"] == "A new journey"
    assert fool["metadata_json"]["keywords_upright"]
    # Không làm thay đổi bộ bài gốc
    assert "tavily_answer" not in TAROT_DECK_BY_NAME["The Fool"]["metadata_json"]


def test_every_keyword_has_vietnamese_translation():
    for card in TAROT_DECK:
        meta = card["metadata_json"]
        for en in meta["keywords_upright"] + meta["keywords_reversed"]:
            assert en in KEYWORDS_VI, f"{card['name']}: {en!r}"
        assert len(meta["keywords_upright_vi"]) == len(meta["keywords_upright"])
        assert len(meta["keywords_reversed_vi"]) == len(meta["keywords_reversed"])


@pytest.mark.parametrize(
    ("en", "vi"),
    [
        ("Mars in Aries (0°–10°)", "Sao Hỏa trong Bạch Dương (0°–10°)"),
        ("20° Scorpio – 20° Sagittarius", "20° Bọ Cạp – 20° Nhân Mã"),
        ("Root of Water", "Gốc rễ của Nước"),
        ("Earth of Fire", "Đất của Lửa"),
        ("Element of Air", "Nguyên tố Khí"),
        ("Mercury", "Sao Thủy"),
    ],
)
def test_astro_vi(en, vi):
    assert astro_vi(en) == vi


def test_no_english_left_in_astro_vi():
    english = re.compile(r"\b(Sun|Moon|Mars|Venus|Mercury|Jupiter|Saturn|Aries|Leo|Pisces|Fire|Water|Air|Earth|in|of)\b")
    for card in TAROT_DECK:
        assert not english.search(card["metadata_json"]["astro_vi"]), card["name"]
