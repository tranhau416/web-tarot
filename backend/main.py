"""
============================================================
Tarot Web App - FastAPI Application Entry Point
backend/main.py
============================================================

Khởi động FastAPI app với:
  - CORS middleware (permissive cho dev)
  - Adult Confirmation Compliance Gate middleware
  - API v1 router (cards, draw, booking)
  - Health check endpoint
  - OpenAPI docs (Swagger UI + ReDoc)
"""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_v1_router
from app.core.middleware import AdultConfirmationMiddleware

# ---------------------------------------------------------------------------
# Logging Setup
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# FastAPI App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="🔮 Tarot Web API",
    description=(
        "## Quantum-powered Tarot reading with Elemental Dignities\n\n"
        "Sử dụng entropy lượng tử thật từ **ANU QRNG** (Australian National University "
        "Quantum Random Number Generator) để đảm bảo mỗi lần rút bài là hoàn toàn ngẫu nhiên.\n\n"
        "### Tính năng chính:\n"
        "- 🎴 Rút bài với Quantum entropy (ANU QRNG + Random.org fallback)\n"
        "- ⚗️ Elemental Dignities Matrix (Golden Dawn system)\n"
        "- 🌟 Decan Timing Engine (Cardinal/Fixed/Mutable)\n"
        "- 📅 Booking hệ thống tư vấn trực tiếp\n\n"
        "### Compliance:\n"
        "- Yêu cầu xác nhận tuổi 18+ (`X-Adult-Confirmed: true` header)\n"
        "- Tất cả kết quả chỉ mang tính giải trí, không phải tư vấn chuyên nghiệp\n"
    ),
    version="1.0.0",
    contact={
        "name": "Tarot Web App Team",
        "url": "https://github.com/tarot-web-app",
    },
    license_info={
        "name": "MIT",
    },
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# ---------------------------------------------------------------------------
# Middleware (thứ tự QUAN TRỌNG: middleware stack là LIFO)
# ---------------------------------------------------------------------------

# 1. CORS — phải ở ngoài cùng (first added = outermost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Compliance-Gate"],
)

# 2. Adult Confirmation Compliance Gate
app.add_middleware(AdultConfirmationMiddleware)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(api_v1_router)

# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------

@app.get(
    "/health",
    tags=["system"],
    summary="Health check",
    response_description="Service health status",
)
async def health_check() -> JSONResponse:
    """
    Kiểm tra trạng thái hoạt động của service.

    Trả về:
      - `status`: "healthy"
      - `service`: tên service
      - `version`: phiên bản hiện tại
    """
    return JSONResponse(
        content={
            "status": "healthy",
            "service": "Tarot Web API",
            "version": "1.0.0",
        }
    )


# ---------------------------------------------------------------------------
# Startup / Shutdown Events
# ---------------------------------------------------------------------------

@app.on_event("startup")
async def on_startup() -> None:
    logger.info("🔮 Tarot Web API v1.0.0 starting up...")
    logger.info("📖 API docs available at: /docs (Swagger) | /redoc (ReDoc)")


@app.on_event("shutdown")
async def on_shutdown() -> None:
    logger.info("🔮 Tarot Web API shutting down gracefully.")
