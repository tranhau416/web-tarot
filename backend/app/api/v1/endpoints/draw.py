"""
============================================================
Tarot Web App - Draw API Endpoint
backend/app/api/v1/endpoints/draw.py
============================================================

Endpoint:
  POST /api/v1/draw  — Rút bài Tarot với Quantum entropy

Compliance:
  - Yêu cầu header X-Adult-Confirmed: true
    (được enforce thêm ở middleware, nhưng cũng check ở đây)
"""

from __future__ import annotations

import json
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models import DrawLog, Session
from app.schemas.tarot import DrawRequest, DrawResponse
from app.services import interpretation_service, quantum_engine

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
)
async def draw_tarot(
    request_body: DrawRequest,
    request: Request,
    x_adult_confirmed: str = Header(
        default="",
        alias="X-Adult-Confirmed",
        description="Phải là 'true' để xác nhận đủ 18 tuổi",
    ),
    db: AsyncSession = Depends(get_db),
) -> DrawResponse:
    """
    Main Tarot draw endpoint.

    Flow:
      1. Validate X-Adult-Confirmed header (Compliance Gate)
      2. Xác định số lá bài cần rút
      3. Gọi quantum_engine.draw_cards()
      4. Gọi interpretation_service.interpret_spread()
      5. Tạo Session record trong DB
      6. Tạo DrawLog records cho mỗi card
      7. Trả về DrawResponse với disclaimer bắt buộc
    """

    # --- Bước 1: Compliance Gate (kiểm tra kép, middleware là tuyến phòng thủ đầu) ---
    if x_adult_confirmed.strip().lower() != "true":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "detail": (
                    "Age verification required. "
                    "You must confirm you are 18+ to use this service."
                ),
                "compliance_gate": "adult_verification",
            },
        )

    spread_type = request_body.spread_type

    # --- Bước 2: Xác định số lá bài ---
    num_cards = quantum_engine.get_spread_size(spread_type)
    logger.info(
        "Draw request: spread=%s, cards=%d, user=%s",
        spread_type, num_cards, request_body.user_id,
    )

    # --- Bước 3: Quantum draw ---
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
        )

    # --- Bước 4: Interpret spread ---
    interpretation = await interpretation_service.interpret_spread(
        draw_result=draw_result,
        db=db,
    )

    # --- Bước 4b: Stamp position labels onto each card ---
    position_labels = _get_position_labels(spread_type)
    for card in interpretation.cards:
        card.position_label = position_labels.get(card.position_index)

    # --- Bước 5: Tạo Session record ---
    session_id = uuid.uuid4()

    # Session cần user_id — None nếu anonymous (user_id column đã nullable)
    effective_user_id = request_body.user_id  # None = anonymous session

    db_session = Session(
        id=session_id,
        user_id=effective_user_id,
        spread_type=spread_type,
        intention=request_body.intention,
        status="completed",
        quantum_seed=draw_result.raw_bytes_hex,
        interpretation_result=interpretation.model_dump(),
        completed_at=datetime.now(timezone.utc),
    )
    db.add(db_session)

    # --- Bước 6: Tạo DrawLog records ---
    for card in interpretation.cards:
        timing_dict = card.timing.model_dump()
        draw_log = DrawLog(
            id=uuid.uuid4(),
            session_id=session_id,
            card_id=card.card_id,
            position_index=card.position_index,
            position_label=card.position_label,
            orientation=card.orientation,
            dignity_weight=card.dignity_weight,
            timing_output=timing_dict,
            raw_quantum_bytes=hex(card.raw_quantum_byte),
        )
        db.add(draw_log)

    await db.flush()  # Flush để check constraints; commit sẽ do get_db() xử lý

    logger.info(
        "Session %s completed: %s spread, source=%s",
        session_id, spread_type, interpretation.quantum_source,
    )

    # --- Bước 7: Trả về response ---
    return DrawResponse(
        session_id=session_id,
        interpretation=interpretation,
        disclaimer=LEGAL_DISCLAIMER,
    )


def _get_position_labels(spread_type: str) -> dict[int, str]:
    """Trả về nhãn vị trí theo loại spread."""
    labels: dict[str, dict[int, str]] = {
        "single": {0: "The Card"},
        "three_card": {
            0: "Past",
            1: "Present",
            2: "Future",
        },
        "horseshoe": {
            0: "Past",
            1: "Present",
            2: "Hidden Influences",
            3: "Obstacles",
            4: "External Influences",
            5: "Hopes & Fears",
            6: "Outcome",
        },
        "celtic_cross": {
            0: "Present Situation",
            1: "Crossing",
            2: "Root",
            3: "Past",
            4: "Crown",
            5: "Near Future",
            6: "Self",
            7: "Environment",
            8: "Hopes & Fears",
            9: "Outcome",
        },
    }
    return labels.get(spread_type, {})


@router.post("/ai-stream")
async def draw_and_stream(
    request_body: DrawRequest,
    x_adult_confirmed: str = Header(None, alias="X-Adult-Confirmed"),
    db: AsyncSession = Depends(get_db),
):
    """
    Draw cards AND stream Claude AI interpretation via SSE.

    SSE event format:
      data: {"type": "draw_result", "session_id": "...", "interpretation": {...}}\n\n
      data: {"type": "token", "text": "..."}\n\n
      data: {"type": "done"}\n\n
      data: {"type": "error", "message": "..."}\n\n
    """
    from fastapi.responses import StreamingResponse
    from app.services.ai_reader_service import stream_reading
    import orjson

    # Compliance gate
    if not x_adult_confirmed or x_adult_confirmed.lower() != "true":
        raise HTTPException(
            status_code=403,
            detail="Adult confirmation required. Set X-Adult-Confirmed: true header.",
        )

    # --- Run the same draw flow as /draw ---
    spread_type = request_body.spread_type
    num_cards = quantum_engine.get_spread_size(spread_type)

    draw_result = await quantum_engine.draw_cards(
        num_cards=num_cards,
        spread_type=spread_type,
        db=db,
    )
    interpretation = await interpretation_service.interpret_spread(
        draw_result=draw_result,
        db=db,
    )

    # Stamp position labels onto each card (required by ai_reader_service)
    position_labels = _get_position_labels(spread_type)
    for card_interp in interpretation.cards:
        card_interp.position_label = position_labels.get(card_interp.position_index)

    # Create session in DB (same pattern as /draw endpoint)
    session_id = uuid.uuid4()

    db_session = Session(
        id=session_id,
        user_id=request_body.user_id,
        spread_type=spread_type,
        intention=request_body.intention,
        status="completed",
        quantum_seed=draw_result.raw_bytes_hex,
        interpretation_result=interpretation.model_dump(),
        completed_at=datetime.now(timezone.utc),
    )
    db.add(db_session)

    for card_interp in interpretation.cards:
        draw_log = DrawLog(
            id=uuid.uuid4(),
            session_id=session_id,
            card_id=card_interp.card_id,
            position_index=card_interp.position_index,
            position_label=card_interp.position_label,
            orientation=card_interp.orientation,
            dignity_weight=card_interp.dignity_weight,
            timing_output=card_interp.timing.model_dump() if card_interp.timing else None,
            raw_quantum_bytes=hex(card_interp.raw_quantum_byte),
        )
        db.add(draw_log)

    await db.flush()

    draw_response = DrawResponse(
        session_id=str(session_id),
        interpretation=interpretation,
        disclaimer=LEGAL_DISCLAIMER,
    )

    async def event_stream():
        # 1. Send draw result first
        draw_data = {
            "type": "draw_result",
            "session_id": draw_response.session_id,
            "interpretation": draw_response.interpretation.model_dump(mode="json"),
            "disclaimer": draw_response.disclaimer,
        }
        yield b"data: " + orjson.dumps(draw_data) + b"\n\n"

        # 2. Stream Claude tokens
        try:
            async for token in stream_reading(interpretation, request_body.intention):
                token_data = {"type": "token", "text": token}
                yield b"data: " + orjson.dumps(token_data) + b"\n\n"
        except ValueError as e:
            error_data = {"type": "error", "message": str(e)}
            yield b"data: " + orjson.dumps(error_data) + b"\n\n"
            return
        except Exception as e:
            logger.error("Streaming error: %s", str(e))
            error_data = {"type": "error", "message": "Lỗi kết nối AI. Vui lòng thử lại."}
            yield b"data: " + orjson.dumps(error_data) + b"\n\n"
            return

        # 3. Done
        yield b"data: " + orjson.dumps({"type": "done"}) + b"\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )
