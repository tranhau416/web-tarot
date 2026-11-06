"""
Build ảnh lá bài (WebP) cho frontend từ bản scan Rider-Waite-Smith gốc.

Nguồn: https://github.com/mixvlad/TarotCards — thư mục tarot/rider-waite/720px
(scan bộ "Pam-A" 1909 của Pamela Colman Smith, phục chế bởi Steve-P.org,
public domain). Xem frontend/public/cards/CREDITS.txt.

Chạy:
  pip install pillow
  git clone --depth 1 --filter=blob:none --sparse https://github.com/mixvlad/TarotCards /tmp/tc
  git -C /tmp/tc sparse-checkout set tarot/rider-waite
  python scripts/build_card_images.py /tmp/tc/tarot/rider-waite/720px

Output: frontend/public/cards/<NN>-<slug>.webp (+ back.webp). Tên file khớp
`image_url` trong backend/app/data/tarot_deck.py (card_image_filename).
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "backend"))

from app.data.tarot_deck import TAROT_DECK, card_image_filename  # noqa: E402

OUTPUT_DIR = ROOT / "frontend" / "public" / "cards"
WIDTH = 360          # hiển thị tối đa ~180px CSS → đủ nét trên màn hình 2x
QUALITY = 80

_SUIT_PREFIX = {"wands": "Wands", "cups": "Cups", "swords": "Swords", "pentacles": "Pents"}


def source_filename(card: dict) -> str:
    """Tên file trong bộ scan: '00_Fool.jpg' … '21_World.jpg', 'Wands01.jpg' … 'Pents14.jpg'."""
    if card["arcana"] == "major":
        base = card["name"].removeprefix("The ").replace(" ", "_")
        return f"{card['card_number']:02d}_{base}.jpg"
    return f"{_SUIT_PREFIX[card['suit']]}{card['numerology_value']:02d}.jpg"


def convert(src: Path, dst: Path) -> int:
    with Image.open(src) as im:
        im = im.convert("RGB")
        height = round(im.height * WIDTH / im.width)
        im.resize((WIDTH, height), Image.Resampling.LANCZOS).save(
            dst, "WEBP", quality=QUALITY, method=6
        )
    return dst.stat().st_size


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("source_dir", type=Path, help="Thư mục tarot/rider-waite/720px")
    args = parser.parse_args()

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    total = 0
    for card in TAROT_DECK:
        src = args.source_dir / source_filename(card)
        if not src.exists():
            raise SystemExit(f"Thiếu file nguồn cho {card['name']}: {src}")
        total += convert(src, OUTPUT_DIR / card_image_filename(card))

    total += convert(args.source_dir / "Cover_Rare.jpg", OUTPUT_DIR / "back.webp")
    print(f"✓ {len(TAROT_DECK) + 1} ảnh → {OUTPUT_DIR} ({total / 1024 / 1024:.1f} MB)")


if __name__ == "__main__":
    main()
