"""
============================================================
Tarot Web App - Cards API Endpoints
backend/app/api/v1/endpoints/cards.py
============================================================

Endpoints:
  GET /api/v1/cards          — Liệt kê tất cả cards (có filter)
  GET /api/v1/cards/{id}     — Chi tiết 1 card
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import Card

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/cards", tags=["cards"])


# ---------------------------------------------------------------------------
# Response Schema
# ---------------------------------------------------------------------------

class CardResponse(BaseModel):
    """Schema cho response của một lá bài."""

    id: int
    card_number: int
    name: str
    name_vi: Optional[str] = None
    suit: str
    arcana: str
    element: Optional[str] = None
    astro_decan: Optional[str] = None
    zodiac_mode: Optional[str] = None
    numerology_value: Optional[int] = None
    image_url: Optional[str] = None
    metadata_json: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.get("", response_model=List[CardResponse], summary="List all Tarot cards")
async def list_cards(
    suit: Optional[str] = Query(
        default=None,
        description="Filter by suit: major_arcana | wands | cups | swords | pentacles",
    ),
    arcana: Optional[str] = Query(
        default=None,
        description="Filter by arcana type: major | minor",
    ),
    limit: int = Query(default=78, ge=1, le=78, description="Max number of cards to return"),
    offset: int = Query(default=0, ge=0, description="Number of cards to skip"),
    db: AsyncSession = Depends(get_db),
) -> List[CardResponse]:
    """
    Lấy danh sách tất cả 78 lá bài Tarot.

    Hỗ trợ filter theo **suit** và **arcana**,
    và phân trang qua `limit` / `offset`.
    """
    stmt = select(Card)

    if suit:
        stmt = stmt.where(Card.suit == suit)
    if arcana:
        stmt = stmt.where(Card.arcana == arcana)

    stmt = stmt.order_by(Card.card_number).offset(offset).limit(limit)

    result = await db.execute(stmt)
    cards = result.scalars().all()

    return [CardResponse.model_validate(c) for c in cards]


@router.get("/{card_id}", response_model=CardResponse, summary="Get single Tarot card")
async def get_card(
    card_id: int,
    db: AsyncSession = Depends(get_db),
) -> CardResponse:
    """
    Lấy thông tin đầy đủ của một lá bài theo ID.

    Bao gồm toàn bộ **metadata_json** với keywords, dignities, decan, v.v.
    """
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalar_one_or_none()

    if not card:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Card with id={card_id} not found.",
        )

    return CardResponse.model_validate(card)
