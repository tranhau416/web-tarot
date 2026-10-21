"""
============================================================
Tarot Web App - Draw API Endpoint
backend/app/api/v1/endpoints/draw.py
============================================================

Endpoints:
  POST /api/v1/draw            — Rút bài Tarot với Quantum entropy (JSON)
  POST /api/v1/draw/ai-stream  — Rút bài + stream lời đọc AI (SSE)

Compliance:
  - Yêu cầu header X-Adult-Confirmed: true
    (được enforce ở middleware, và kiểm tra lại ở đây — defense in depth)
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

import orjson
from fastapi import APIRouter, Depends, Header, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.data.vi import position_vi
from app.models import DrawLog, Session, User
from app.schemas.tarot import DrawRequest, DrawResponse
from app.services import interpretation_service, quantum_engine
from app.services.ai_reader_service import stream_reading

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/draw", tags=["draw"])

# Disclaimer pháp lý bắt buộc
LEGAL_DISCLAIMER = (
    "⚠️ DISCLAIMER: Tarot readings are for entertainment purposes only. "
    "This service does not provide legal, financial, medical, or psychological advice. "
    "By using this service, you confirm that you are 18 years of age or older. "
    "Results are generated using quantum randomness and should not be used to make "
    "important life decisions. If you are experiencing a crisis, please contact "
    "appropriate professional services."
)

AGE_VERIFICATION_DETAIL = (
    "Age verification required. You must confirm you are 18+ to use this service."
)

POSITION_LABELS: dict[str, list[str]] = {
    "single": ["The Card"],
    "three_card": ["Past", "Present", "Future"],
    "horseshoe": [
        "Past", "Present", "Hidden Influences", "Obstacles",
        "External Influences", "Hopes & Fears", "Outcome",
    ],
    "celtic_cross": [
        "Present Situation", "Crossing", "Root", "Past", "Crown",
        "Near Future", "Self", "Environment", "Hopes & Fears", "Outcome",
    ],
}


def require_adult_confirmation(
    x_adult_confirmed: str = Header(
        default="",
        alias="X-Adult-Confirmed",
        description="Phải là 'true' để xác nhận đủ 18 tuổi",
    ),
) -> None:
    """Compliance Gate (lớp 2 — middleware là lớp 1)."""
    if x_adult_confirmed.strip().lower() != "true":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=AGE_VERIFICATION_DETAIL,
            headers={"X-Compliance-Gate": "adult_verification"},
        )


def _sse(payload: dict) -> bytes:
    return b"data: " + orjson.dumps(payload) + b"\n\n"


async def _perform_draw(request_body: DrawRequest, db: AsyncSession) -> DrawResponse:
    """
    Luồng rút bài dùng chung cho /draw và /draw/ai-stream.

      1. Validate user_id (nếu có)
      2. Quantum draw → 3. Interpret (dignities + timing) → 4. Gắn nhãn vị trí
      5. Lưu Session + DrawLog (flush; commit do caller / get_db)
    """
    if request_body.user_id is not None and await db.get(User, request_body.user_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User {request_body.user_id} not found.",
        )

    spread_type = request_body.spread_type
    num_cards = quantum_engine.get_spread_size(spread_type)
    logger.info(
        "Draw request: spread=%s, cards=%d, user=%s",
        spread_type, num_cards, request_body.user_id,
    )

    try:
        draw_result = await quantum_engine.draw_cards(
            num_cards=num_cards,
            spread_type=spread_type,
            db=db,
        )
    except RuntimeError as exc:
        logger.error("Quantum engine failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc

    interpretation = await interpretation_service.interpret_spread(
        draw_result=draw_result,
        db=db,
    )

    labels = POSITION_LABELS[spread_type]
    for card in interpretation.cards:
        card.position_label = labels[card.position_index]
        card.position_label_vi = position_vi(card.position_label, card.position_index)

    session_id = uuid.uuid4()
    db.add(Session(
        id=session_id,
        user_id=request_body.user_id,  # None = anonymous session
        spread_type=spread_type,
        intention=request_body.intention,
        status="completed",
        quantum_seed=draw_result.raw_bytes_hex,
        interpretation_result=interpretation.model_dump(mode="json"),
        completed_at=datetime.now(timezone.utc),
    ))
    for card in interpretation.cards:
        db.add(DrawLog(
            id=uuid.uuid4(),
            session_id=session_id,
            card_id=card.card_id,
            position_index=card.position_index,
            position_label=card.position_label,
            orientation=card.orientation,
            dignity_weight=card.dignity_weight,
            timing_output=card.timing.model_dump(),
            raw_quantum_bytes=f"{card.raw_quantum_byte:02x}{card.orientation_byte or 0:02x}",
        ))

    await db.flush()  # check constraints sớm

    logger.info(
        "Session %s completed: %s spread, source=%s",
        session_id, spread_type, interpretation.quantum_source,
    )

    return DrawResponse(
        session_id=session_id,
        interpretation=interpretation,
        disclaimer=LEGAL_DISCLAIMER,
    )


@router.post(
    "",
    response_model=DrawResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Perform a Tarot card reading",
    description=(
        "Rút bài Tarot sử dụng Quantum entropy từ ANU QRNG. "
        "Trả về kết quả diễn giải với Elemental Dignities và Decan Timing. "
        "**Yêu cầu header `X-Adult-Confirmed: true`** (Compliance Gate)."
    ),
    dependencies=[Depends(require_adult_confirmation)],
)
async def draw_tarot(
    request_body: DrawRequest,
    db: AsyncSession = Depends(get_db),
) -> DrawResponse:
    return await _perform_draw(request_body, db)


@router.post(
    "/ai-stream",
    summary="Draw cards and stream an AI reading (SSE)",
    description=(
        "Rút bài như `/draw`, rồi stream lời đọc bài tiếng Việt qua Server-Sent Events. "
        "**Yêu cầu header `X-Adult-Confirmed: true`**."
    ),
    dependencies=[Depends(require_adult_confirmation)],
    response_class=StreamingResponse,
)
async def draw_and_stream(
    request_body: DrawRequest,
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    """
    SSE event format:
      data: {"type": "draw_result", "session_id": "...", "interpretation": {...}, "disclaimer": "..."}
      data: {"type": "token", "text": "..."}            (lặp lại)
      data: {"type": "done"}
      data: {"type": "error", "message": "..."}         (thay cho done nếu lỗi)
    """
    draw_response = await _perform_draw(request_body, db)
    # Commit TRƯỚC khi stream: phiên đọc bài được lưu dù client ngắt giữa chừng,
    # và không phụ thuộc thời điểm FastAPI đóng dependency có yield.
    await db.commit()

    interpretation = draw_response.interpretation
    intention = request_body.intention

    async def event_stream():
        yield _sse({
            "type": "draw_result",
            "session_id": str(draw_response.session_id),
            "interpretation": interpretation.model_dump(mode="json"),
            "disclaimer": draw_response.disclaimer,
        })

        try:
            async for token in stream_reading(interpretation, intention):
                yield _sse({"type": "token", "text": token})
        except Exception as exc:
            logger.error("Streaming error (%s): %s", type(exc).__name__, exc)
            yield _sse({
                "type": "error",
                "message": "Lời đọc bài bị gián đoạn. Vui lòng thử lại.",
            })
            return

        yield _sse({"type": "done"})

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
