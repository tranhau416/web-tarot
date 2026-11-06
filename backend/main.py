"""
============================================================
Tarot Web App - FastAPI Application Entry Point
backend/main.py
============================================================

Khởi động FastAPI app với:
  - Lifespan: tự tạo schema + seed 78 lá nếu DB còn thiếu (AUTO_INIT_DB)
  - CORS middleware (origin lấy từ CORS_ORIGINS)
  - Adult Confirmation Compliance Gate middleware
  - API v1 router (cards, draw)
  - Health check endpoint
  - OpenAPI docs (Swagger UI + ReDoc)
"""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.v1.router import api_v1_router
from app.core.config import settings
from app.core.database import engine
from app.core.init_db import init_db
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
# Lifespan (startup / shutdown)
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("🔮 Tarot Web API v1.0.0 starting up...")
    if settings.AUTO_INIT_DB:
        await init_db(engine)
    logger.info("📖 API docs available at: /docs (Swagger) | /redoc (ReDoc)")
    yield
    await engine.dispose()
    logger.info("🔮 Tarot Web API shutting down gracefully.")


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
        "- ✨ AI reading streaming (SSE) — Gemini / Claude / mock\n\n"
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
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Middleware (thứ tự QUAN TRỌNG: middleware add SAU CÙNG sẽ nằm NGOÀI CÙNG)
# ---------------------------------------------------------------------------

# 1. Adult Confirmation Compliance Gate (bên trong CORS)
app.add_middleware(AdultConfirmationMiddleware)

# 2. CORS — add sau cùng để ở ngoài cùng: response 403 của compliance gate
#    vẫn có header CORS, nên browser đọc được thông báo lỗi thay vì "CORS error".
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Compliance-Gate"],
)

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
