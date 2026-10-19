"""
============================================================
Tarot Web App - Built-in 78-card Rider-Waite-Smith deck
backend/app/data/tarot_deck.py
============================================================

Nguồn dữ liệu chuẩn để seed bảng `cards` (không cần Tavily / internet).

Tương ứng chiêm tinh theo hệ Golden Dawn:
  - Major Arcana: nguyên tố / hành tinh / cung hoàng đạo tương ứng
    (VD: The Emperor = Aries → Fire). Major luôn "timeless" khi tính timing.
  - Pip 2–10: mỗi lá ứng với 1 decan (10°) — 2/3/4 = cung Cardinal,
    5/6/7 = cung Fixed, 8/9/10 = cung Mutable của nguyên tố bộ bài.
  - Court cards: Knight (Fire of suit) → cung Mutable, Queen (Water of suit)
    → cung Cardinal, King (Air of suit) → cung Fixed; mỗi lá trải 30°
    từ 20° cung trước đến 20° cung chính.
  - Ace & Page: gốc rễ của nguyên tố, không có decan → timing theo mùa.

Dùng `build_deck()` để lấy list[dict] sẵn sàng insert vào bảng `cards`.
"""

from __future__ import annotations

from typing import Any, Optional

# ---------------------------------------------------------------------------
# Major Arcana
# ---------------------------------------------------------------------------

# (name, name_vi, element, astrology attribution, keywords_upright, keywords_reversed)
_MAJORS: list[tuple[str, str, str, str, list[str], list[str]]] = [
    ("The Fool", "Chàng Khờ", "air", "Element of Air",
     ["new beginnings", "innocence", "spontaneity", "free spirit", "leap of faith"],
     ["recklessness", "naivety", "hesitation", "poor judgment"]),
    ("The Magician", "Nhà Ảo Thuật", "air", "Mercury",
     ["manifestation", "willpower", "skill", "resourcefulness", "inspired action"],
     ["manipulation", "untapped potential", "trickery", "scattered energy"]),
    ("The High Priestess", "Nữ Tư Tế", "water", "Moon",
     ["intuition", "inner wisdom", "mystery", "the subconscious"],
     ["hidden agendas", "ignored intuition", "secrets", "withdrawal"]),
    ("The Empress", "Hoàng Hậu", "earth", "Venus",
     ["abundance", "nurturing", "fertility", "sensuality", "creativity"],
     ["dependence", "creative block", "smothering", "self-neglect"]),
    ("The Emperor", "Hoàng Đế", "fire", "Aries",
     ["authority", "structure", "stability", "leadership", "discipline"],
     ["domination", "rigidity", "control issues", "lack of discipline"]),
    ("The Hierophant", "Giáo Hoàng", "earth", "Taurus",
     ["tradition", "spiritual guidance", "institutions", "shared values"],
     ["rebellion", "unconventional paths", "dogma", "restriction"]),
    ("The Lovers", "Tình Nhân", "air", "Gemini",
     ["love", "union", "harmony", "aligned values", "meaningful choice"],
     ["disharmony", "misalignment", "imbalance", "difficult choice"]),
    ("The Chariot", "Cỗ Xe Chiến", "water", "Cancer",
     ["determination", "willpower", "victory", "control", "momentum"],
     ["lack of direction", "aggression", "obstacles", "loss of control"]),
    ("Strength", "Sức Mạnh", "fire", "Leo",
     ["courage", "compassion", "inner strength", "patience", "gentle influence"],
     ["self-doubt", "insecurity", "raw emotion", "weakness"]),
    ("The Hermit", "Ẩn Sĩ", "earth", "Virgo",
     ["introspection", "solitude", "inner guidance", "soul-searching"],
     ["isolation", "loneliness", "withdrawal", "lost direction"]),
    ("Wheel of Fortune", "Bánh Xe Số Phận", "fire", "Jupiter",
     ["cycles", "destiny", "turning point", "good luck", "change"],
     ["bad luck", "resistance to change", "setbacks", "repeating cycles"]),
    ("Justice", "Công Lý", "air", "Libra",
     ["fairness", "truth", "cause and effect", "accountability", "balance"],
     ["injustice", "dishonesty", "avoiding accountability", "bias"]),
    ("The Hanged Man", "Người Treo Ngược", "water", "Element of Water",
     ["surrender", "pause", "new perspective", "letting go"],
     ["stalling", "indecision", "resistance", "needless sacrifice"]),
    ("Death", "Cái Chết", "water", "Scorpio",
     ["endings", "transformation", "transition", "release", "renewal"],
     ["resistance to change", "stagnation", "fear of endings", "decay"]),
    ("Temperance", "Tiết Độ", "fire", "Sagittarius",
     ["balance", "moderation", "patience", "purpose", "harmony"],
     ["imbalance", "excess", "impatience", "discord"]),
    ("The Devil", "Ác Quỷ", "earth", "Capricorn",
     ["attachment", "temptation", "materialism", "shadow self", "bondage"],
     ["release", "breaking free", "reclaiming power", "detachment"]),
    ("The Tower", "Tòa Tháp", "fire", "Mars",
     ["sudden upheaval", "revelation", "chaos", "awakening", "collapse of illusions"],
     ["averting disaster", "fear of change", "delayed collapse", "inner upheaval"]),
    ("The Star", "Ngôi Sao", "air", "Aquarius",
     ["hope", "renewal", "faith", "inspiration", "serenity"],
     ["despair", "discouragement", "lack of faith", "disconnection"]),
    ("The Moon", "Mặt Trăng", "water", "Pisces",
     ["illusion", "intuition", "fear", "the subconscious", "uncertainty"],
     ["clarity emerging", "released fear", "confusion", "repressed emotion"]),
    ("The Sun", "Mặt Trời", "fire", "Sun",
     ["joy", "success", "vitality", "positivity", "warmth"],
     ["temporary sadness", "overconfidence", "blocked joy", "delays"]),
    ("Judgement", "Phán Xét", "fire", "Element of Fire",
     ["rebirth", "inner calling", "reckoning", "absolution", "awakening"],
     ["self-doubt", "harsh self-judgment", "ignoring the call", "regret"]),
    ("The World", "Thế Giới", "earth", "Saturn",
     ["completion", "fulfillment", "integration", "accomplishment", "travel"],
     ["incompletion", "lack of closure", "delays", "shortcuts"]),
]

# ---------------------------------------------------------------------------
# Minor Arcana
# ---------------------------------------------------------------------------

_RANKS: list[tuple[str, str]] = [
    ("Ace", "Át"), ("Two", "Hai"), ("Three", "Ba"), ("Four", "Bốn"),
    ("Five", "Năm"), ("Six", "Sáu"), ("Seven", "Bảy"), ("Eight", "Tám"),
    ("Nine", "Chín"), ("Ten", "Mười"), ("Page", "Tiểu Đồng"),
    ("Knight", "Hiệp Sĩ"), ("Queen", "Nữ Hoàng"), ("King", "Vua"),
]

_ZODIAC = [
    "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
    "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
]

_SUITS: dict[str, dict[str, Any]] = {
    "wands": {
        "name": "Wands", "name_vi": "Gậy", "element": "fire",
        "signs": {"cardinal": "Aries", "fixed": "Leo", "mutable": "Sagittarius"},
        # Hành tinh cai quản decan cho lá 2 → 10 (thứ tự Chaldean, Golden Dawn)
        "decan_planets": ["Mars", "Sun", "Venus", "Saturn", "Jupiter", "Mars",
                          "Mercury", "Moon", "Saturn"],
    },
    "cups": {
        "name": "Cups", "name_vi": "Cốc", "element": "water",
        "signs": {"cardinal": "Cancer", "fixed": "Scorpio", "mutable": "Pisces"},
        "decan_planets": ["Venus", "Mercury", "Moon", "Mars", "Sun", "Venus",
                          "Saturn", "Jupiter", "Mars"],
    },
    "swords": {
        "name": "Swords", "name_vi": "Kiếm", "element": "air",
        "signs": {"cardinal": "Libra", "fixed": "Aquarius", "mutable": "Gemini"},
        "decan_planets": ["Moon", "Saturn", "Jupiter", "Venus", "Mercury", "Moon",
                          "Jupiter", "Mars", "Sun"],
    },
    "pentacles": {
        "name": "Pentacles", "name_vi": "Tiền", "element": "earth",
        "signs": {"cardinal": "Capricorn", "fixed": "Taurus", "mutable": "Virgo"},
        "decan_planets": ["Jupiter", "Mars", "Sun", "Mercury", "Moon", "Saturn",
                          "Sun", "Venus", "Mercury"],
    },
}

# Keywords theo thứ tự _RANKS: (upright, reversed)
_MINOR_KEYWORDS: dict[str, list[tuple[list[str], list[str]]]] = {
    "wands": [
        (["inspiration", "new venture", "creative spark", "potential"],
         ["delays", "lack of motivation", "false start"]),
        (["planning", "future vision", "decisions", "discovery"],
         ["fear of the unknown", "poor planning", "playing it safe"]),
        (["expansion", "foresight", "progress", "opportunities abroad"],
         ["setbacks", "limited vision", "delays"]),
        (["celebration", "homecoming", "harmony", "milestones"],
         ["instability", "lack of support", "transition"]),
        (["competition", "conflict", "rivalry", "tension"],
         ["avoiding conflict", "inner conflict", "resolution"]),
        (["victory", "recognition", "success", "public acclaim"],
         ["ego", "fall from grace", "lack of recognition"]),
        (["perseverance", "defending your position", "challenge", "standing firm"],
         ["overwhelm", "giving up", "exhaustion"]),
        (["swift action", "movement", "rapid change", "news"],
         ["delays", "frustration", "slowing down"]),
        (["resilience", "persistence", "boundaries", "last stand"],
         ["paranoia", "fatigue", "defensiveness"]),
        (["burden", "responsibility", "overcommitment", "hard work"],
         ["release", "delegation", "burnout"]),
        (["enthusiasm", "exploration", "free spirit", "discovery"],
         ["lack of direction", "procrastination", "hasty ideas"]),
        (["energy", "passion", "adventure", "boldness"],
         ["recklessness", "haste", "scattered energy"]),
        (["confidence", "warmth", "determination", "charisma"],
         ["jealousy", "insecurity", "demanding"]),
        (["visionary leadership", "boldness", "entrepreneurship", "honor"],
         ["impulsiveness", "arrogance", "unrealistic expectations"]),
    ],
    "cups": [
        (["new love", "emotional awakening", "compassion", "intuition"],
         ["emotional blockage", "repressed feelings", "emptiness"]),
        (["partnership", "mutual attraction", "connection", "unity"],
         ["disconnection", "imbalance", "breakup"]),
        (["friendship", "celebration", "community", "joy"],
         ["overindulgence", "gossip", "isolation"]),
        (["apathy", "contemplation", "reevaluation", "missed opportunity"],
         ["renewed interest", "acceptance", "moving on"]),
        (["grief", "loss", "regret", "disappointment"],
         ["acceptance", "forgiveness", "moving forward"]),
        (["nostalgia", "childhood memories", "innocence", "reunion"],
         ["living in the past", "idealized memories", "moving on"]),
        (["choices", "illusion", "fantasy", "wishful thinking"],
         ["clarity", "decisiveness", "reality check"]),
        (["walking away", "seeking meaning", "letting go", "withdrawal"],
         ["fear of change", "aimless drifting", "staying too long"]),
        (["contentment", "wishes fulfilled", "satisfaction", "gratitude"],
         ["dissatisfaction", "smugness", "materialism"]),
        (["harmony", "family", "emotional fulfillment", "happiness"],
         ["broken family", "disconnection", "misaligned values"]),
        (["creative opportunity", "curiosity", "intuitive messages", "sensitivity"],
         ["emotional immaturity", "creative block", "insecurity"]),
        (["romance", "charm", "idealism", "following the heart"],
         ["moodiness", "unrealistic expectations", "jealousy"]),
        (["compassion", "emotional security", "intuition", "nurturing"],
         ["codependence", "emotional overwhelm", "martyrdom"]),
        (["emotional balance", "diplomacy", "wisdom", "calm control"],
         ["manipulation", "moodiness", "emotional volatility"]),
    ],
    "swords": [
        (["clarity", "breakthrough", "truth", "new idea"],
         ["confusion", "miscommunication", "clouded judgment"]),
        (["difficult decision", "stalemate", "indecision", "avoidance"],
         ["overwhelm", "confusion", "information overload"]),
        (["heartbreak", "sorrow", "grief", "painful truth"],
         ["recovery", "forgiveness", "releasing pain"]),
        (["rest", "recovery", "contemplation", "retreat"],
         ["restlessness", "burnout", "stagnation"]),
        (["conflict", "defeat", "winning at all costs", "tension"],
         ["reconciliation", "making amends", "lingering resentment"]),
        (["transition", "moving on", "leaving behind", "rite of passage"],
         ["unfinished business", "resistance to change", "feeling stuck"]),
        (["deception", "strategy", "stealth", "getting away with something"],
         ["confession", "coming clean", "conscience"]),
        (["restriction", "self-imposed limits", "feeling trapped", "victim mentality"],
         ["release", "new perspective", "self-acceptance"]),
        (["anxiety", "worry", "nightmares", "despair"],
         ["hope", "reaching out", "releasing fear"]),
        (["painful ending", "rock bottom", "betrayal", "crisis"],
         ["recovery", "regeneration", "resisting the inevitable"]),
        (["curiosity", "new ideas", "vigilance", "thirst for knowledge"],
         ["gossip", "deception", "hasty words"]),
        (["ambition", "drive", "fast thinking", "assertiveness"],
         ["impulsiveness", "aggression", "burnout"]),
        (["clear boundaries", "independence", "honesty", "perceptiveness"],
         ["coldness", "bitterness", "harsh judgment"]),
        (["intellectual authority", "truth", "clarity", "ethics"],
         ["manipulation", "tyranny", "abuse of power"]),
    ],
    "pentacles": [
        (["new opportunity", "prosperity", "manifestation", "abundance"],
         ["missed opportunity", "poor planning", "scarcity"]),
        (["balance", "adaptability", "juggling priorities", "flexibility"],
         ["overwhelm", "disorganization", "financial strain"]),
        (["teamwork", "craftsmanship", "collaboration", "learning"],
         ["lack of teamwork", "mediocrity", "disregard for skill"]),
        (["security", "saving", "control", "conservation"],
         ["greed", "possessiveness", "letting go of control"]),
        (["hardship", "financial loss", "isolation", "worry"],
         ["recovery", "spiritual help", "improvement"]),
        (["generosity", "charity", "giving and receiving", "sharing"],
         ["debt", "strings attached", "one-sided giving"]),
        (["patience", "long-term vision", "investment", "perseverance"],
         ["impatience", "lack of reward", "poor investment"]),
        (["diligence", "mastery", "skill development", "dedication"],
         ["perfectionism", "lack of focus", "repetitive work"]),
        (["independence", "luxury", "self-sufficiency", "financial security"],
         ["overworking", "superficiality", "dependence"]),
        (["legacy", "wealth", "family", "long-term success"],
         ["family disputes", "financial failure", "instability"]),
        (["ambition", "diligence", "new skill", "manifestation"],
         ["procrastination", "lack of progress", "missed lessons"]),
        (["hard work", "routine", "reliability", "methodical progress"],
         ["laziness", "boredom", "stagnation"]),
        (["nurturing", "practicality", "financial security", "groundedness"],
         ["self-neglect", "work-life imbalance", "smothering"]),
        (["abundance", "security", "discipline", "business acumen"],
         ["greed", "stubbornness", "materialism"]),
    ],
}

_DECAN_DEGREES = ["0°–10°", "10°–20°", "20°–30°"]

# Court card → (zodiac_mode, Golden Dawn elemental title)
_COURT_MODES: dict[str, tuple[Optional[str], str]] = {
    "Page":   (None,       "Earth"),
    "Knight": ("mutable",  "Fire"),
    "Queen":  ("cardinal", "Water"),
    "King":   ("fixed",    "Air"),
}

_ELEMENT_TITLE = {"fire": "Fire", "water": "Water", "air": "Air", "earth": "Earth"}


def _previous_sign(sign: str) -> str:
    return _ZODIAC[(_ZODIAC.index(sign) - 1) % 12]


def _minor_astrology(suit_key: str, rank_index: int) -> tuple[Optional[str], Optional[str]]:
    """Trả về (zodiac_mode, astro_decan) cho một lá Minor Arcana."""
    suit = _SUITS[suit_key]
    rank = _RANKS[rank_index][0]
    element_title = _ELEMENT_TITLE[suit["element"]]

    if rank == "Ace":
        return None, f"Root of {element_title}"

    if 1 <= rank_index <= 9:  # Two → Ten
        pip = rank_index - 1                    # 0..8
        mode = ("cardinal", "fixed", "mutable")[pip // 3]
        sign = suit["signs"][mode]
        planet = suit["decan_planets"][pip]
        return mode, f"{planet} in {sign} ({_DECAN_DEGREES[pip % 3]})"

    mode, title = _COURT_MODES[rank]
    if mode is None:  # Page
        return None, f"{title} of {element_title}"
    sign = suit["signs"][mode]
    return mode, f"20° {_previous_sign(sign)} – 20° {sign}"


def build_deck() -> list[dict[str, Any]]:
    """
    Build list 78 lá bài (dict) theo đúng cột của bảng `cards`.

    card_number: 0–21 Major, 22–35 Wands, 36–49 Cups, 50–63 Swords, 64–77 Pentacles.
    """
    deck: list[dict[str, Any]] = []

    for number, (name, name_vi, element, attribution, up, rev) in enumerate(_MAJORS):
        deck.append({
            "card_number": number,
            "name": name,
            "name_vi": name_vi,
            "suit": "major_arcana",
            "arcana": "major",
            "element": element,
            "astro_decan": attribution,
            "zodiac_mode": None,
            "numerology_value": number,
            "image_url": None,
            "metadata_json": {
                "keywords_upright": up,
                "keywords_reversed": rev,
                "astrology": {"attribution": attribution},
            },
        })

    number = len(_MAJORS)
    for suit_key, suit in _SUITS.items():
        for rank_index, (rank, rank_vi) in enumerate(_RANKS):
            zodiac_mode, astro_decan = _minor_astrology(suit_key, rank_index)
            up, rev = _MINOR_KEYWORDS[suit_key][rank_index]
            deck.append({
                "card_number": number,
                "name": f"{rank} of {suit['name']}",
                "name_vi": f"{rank_vi} {suit['name_vi']}",
                "suit": suit_key,
                "arcana": "minor",
                "element": suit["element"],
                "astro_decan": astro_decan,
                "zodiac_mode": zodiac_mode,
                "numerology_value": rank_index + 1,   # Ace=1 … King=14
                "image_url": None,
                "metadata_json": {
                    "keywords_upright": up,
                    "keywords_reversed": rev,
                    "astrology": {"decan": astro_decan, "zodiac_mode": zodiac_mode},
                },
            })
            number += 1

    return deck


TAROT_DECK: list[dict[str, Any]] = build_deck()
TAROT_DECK_BY_NAME: dict[str, dict[str, Any]] = {c["name"]: c for c in TAROT_DECK}
