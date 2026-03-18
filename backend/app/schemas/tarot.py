"""
============================================================
Tarot Web App - Pydantic Request/Response Schemas
backend/app/schemas/tarot.py
============================================================
"""

from __future__ import annotations

from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from app.services.interpretation_service import InterpretationResult


# ---------------------------------------------------------------------------
# Draw Schemas
# ---------------------------------------------------------------------------

class DrawRequest(BaseModel):
    """Request body cho POST /api/v1/draw."""

    spread_type: Literal["single", "three_card", "celtic_cross", "horseshoe"] = "single"
    intention: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Câu hỏi hoặc ý định của người dùng",
    )
    user_id: Optional[UUID] = Field(
        default=None,
        description="UUID người dùng (None = anonymous session)",
    )


class DrawResponse(BaseModel):
    """Response body cho POST /api/v1/draw."""

    session_id: UUID
    interpretation: InterpretationResult
    disclaimer: str = Field(
        description="Disclaimer pháp lý bắt buộc",
    )
