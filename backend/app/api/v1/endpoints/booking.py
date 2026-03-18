"""
============================================================
Tarot Web App - Booking API Endpoint
backend/app/api/v1/endpoints/booking.py
============================================================

Endpoint:
  POST /api/v1/booking  — Gửi yêu cầu đặt lịch tư vấn Tarot

Hiện tại:
  - Log request và trả về response "pending"
  - Chưa tích hợp calendar (Google Calendar, Calendly, v.v.)
  - TODO: Tích hợp email notification (SendGrid / SMTP)
"""

from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, status

from app.schemas.tarot import BookingRequest, BookingResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/booking", tags=["booking"])


@router.post(
    "",
    response_model=BookingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Request a Tarot consultation booking",
    description=(
        "Gửi yêu cầu đặt lịch tư vấn Tarot trực tiếp. "
        "Request sẽ được ghi log và gửi về trạng thái `pending`. "
        "Đội ngũ sẽ liên hệ trong vòng 24h để xác nhận lịch hẹn."
    ),
)
async def create_booking(request_body: BookingRequest) -> BookingResponse:
    """
    Nhận yêu cầu đặt lịch tư vấn Tarot.

    Flow hiện tại:
      1. Validate request
      2. Generate booking_id
      3. Log toàn bộ thông tin
      4. Trả về BookingResponse với status="pending"

    TODO (Phase 2):
      - Tích hợp Google Calendar / Calendly API
      - Gửi email xác nhận cho client
      - Gửi email thông báo cho admin
      - Lưu vào DB bảng bookings
    """
    booking_id = f"BKG-{uuid.uuid4().hex[:8].upper()}"

    logger.info(
        "New booking request: id=%s | name=%s | email=%s | timezone=%s | preferred=%s",
        booking_id,
        request_body.name,
        request_body.email,
        request_body.timezone,
        request_body.preferred_time,
    )

    if request_body.message:
        logger.info("Booking message: %s", request_body.message[:200])

    return BookingResponse(
        booking_id=booking_id,
        status="pending",
        message=(
            f"Thank you, {request_body.name}! "
            f"Your booking request ({booking_id}) has been received. "
            f"We will contact you at {request_body.email} within 24 hours "
            f"to confirm your consultation appointment."
        ),
    )
