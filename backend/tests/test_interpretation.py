import pytest

from app.services.interpretation_service import (
    calculate_dignity,
    calculate_spread_dignities,
    calculate_timing,
)
from app.services.quantum_engine import DrawnCard


@pytest.mark.parametrize(
    ("a", "b", "expected"),
    [
        ("fire", "fire", 1.0),
        ("fire", "air", 1.0),
        ("water", "earth", 1.0),
        ("fire", "water", -1.0),
        ("air", "earth", -1.0),
        ("fire", "earth", 0.0),
        ("air", "water", 0.0),
        ("spirit", "spirit", 0.0),
        ("fire", None, 0.0),
        ("FIRE ", "Air", 1.0),
    ],
)
def test_calculate_dignity(a, b, expected):
    assert calculate_dignity(a, b) == expected
    assert calculate_dignity(b, a) == expected


def _card(i, element):
    return DrawnCard(
        position_index=i, card_id=i + 1, card_name=f"c{i}", suit="wands",
        element=element, orientation="upright", raw_quantum_byte=0, orientation_byte=0,
    )


def test_spread_dignities_average_neighbours():
    cards = [_card(0, "fire"), _card(1, "air"), _card(2, "earth")]
    # fire: [fire-air=+1]; air: [air-fire=+1, air-earth=-1] → 0; earth: [earth-air=-1]
    assert calculate_spread_dignities(cards) == [1.0, 0.0, -1.0]
    assert calculate_spread_dignities([_card(0, "fire")]) == [0.0]
    assert calculate_spread_dignities([]) == []


@pytest.mark.parametrize(
    ("zodiac_mode", "arcana", "element", "unit", "range_"),
    [
        ("cardinal", "minor", "fire", "weeks", "1-4 weeks"),
        ("fixed", "minor", "water", "months", "1-4 months"),
        ("mutable", "minor", "air", "days", "3-21 days"),
        (None, "minor", "fire", "season", "within the coming spring"),
        (None, "minor", "earth", "season", "within the coming winter"),
        (None, "major", "fire", "timeless", "timeless"),
        ("cardinal", "major", "fire", "timeless", "timeless"),
    ],
)
def test_calculate_timing(zodiac_mode, arcana, element, unit, range_):
    result = calculate_timing("X", zodiac_mode, arcana, element)
    assert result.timing_unit == unit
    assert result.timing_range == range_


@pytest.mark.parametrize(
    ("zodiac_mode", "arcana", "element", "range_vi", "notes_fragment"),
    [
        ("cardinal", "minor", "fire", "trong khoảng 1–4 tuần", "Thống lĩnh"),
        ("fixed", "minor", "water", "trong khoảng 1–4 tháng", "Kiên định"),
        ("mutable", "minor", "air", "trong khoảng 3–21 ngày", "Linh hoạt"),
        (None, "minor", "earth", "trong mùa đông sắp tới", "hạt giống"),
        (None, "major", "fire", "vượt ngoài khung thời gian cụ thể", "Ẩn Chính"),
    ],
)
def test_timing_vietnamese(zodiac_mode, arcana, element, range_vi, notes_fragment):
    result = calculate_timing("X", zodiac_mode, arcana, element)
    assert result.range_vi == range_vi
    assert notes_fragment in result.notes_vi
