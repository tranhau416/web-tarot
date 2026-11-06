"""
============================================================
Tarot Web App - Compliance Gate Middleware
backend/app/core/middleware.py
============================================================

AdultConfirmationMiddleware:
  - Chặn POST /api/v1/draw và mọi sub-path (/api/v1/draw/ai-stream, ...)
    nếu thiếu header X-Adult-Confirmed: true
  - Trả về 403 Forbidden với body JSON chuẩn
  - Các endpoint khác không bị ảnh hưởng

Tại sao middleware thay vì chỉ check trong endpoint?
  - Defense in depth: 2 lớp kiểm tra
  - Có thể extend sau này (rate limiting, logging, audit trail)
  - Tách rõ concerns: middleware xử lý compliance, endpoint xử lý business logic
"""

from __future__ import annotations

import logging

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)

# Endpoints yêu cầu xác nhận tuổi: (method, path prefix)
ADULT_CONFIRMED_REQUIRED_PREFIXES = (
    ("POST", "/api/v1/draw"),
)


def requires_adult_confirmation(method: str, path: str) -> bool:
    path = path.rstrip("/")
    return any(
        method == m and (path == prefix or path.startswith(prefix + "/"))
        for m, prefix in ADULT_CONFIRMED_REQUIRED_PREFIXES
    )


class AdultConfirmationMiddleware(BaseHTTPMiddleware):
    """
    Compliance Gate: Kiểm tra xác nhận tuổi 18+ cho các endpoint nhạy cảm.

    Nếu request thiếu header `X-Adult-Confirmed: true`, middleware sẽ:
      1. Log cảnh báo
      2. Trả về 403 Forbidden với thông báo rõ ràng
      3. Không forward request xuống handler

    Tất cả endpoint khác đều được pass-through bình thường.
    """

    def __init__(self, app: ASGIApp) -> None:
        super().__init__(app)

    async def dispatch(self, request: Request, call_next) -> Response:
        # Kiểm tra xem endpoint này có yêu cầu adult confirmation không
        method = request.method.upper()
        path = request.url.path

        if requires_adult_confirmation(method, path):
            adult_header = request.headers.get("X-Adult-Confirmed", "").strip().lower()

            if adult_header != "true":
                logger.warning(
                    "Compliance gate triggered: %s %s | IP: %s | Header value: %r",
                    method,
                    path,
                    request.client.host if request.client else "unknown",
                    adult_header or "(missing)",
                )
                return JSONResponse(
                    status_code=403,
                    content={
                        "detail": (
                            "Age verification required. "
                            "You must confirm you are 18+ to use this service."
                        ),
                        "compliance_gate": "adult_verification",
                    },
                    headers={
                        "X-Compliance-Gate": "adult_verification",
                        "Content-Type": "application/json",
                    },
                )

        # Pass-through cho tất cả requests hợp lệ
        response = await call_next(request)
        return response
