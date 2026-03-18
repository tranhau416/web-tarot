# ============================================================
# Tarot Web App — Backend Dockerfile
# Multi-stage build: builder → runtime
# ============================================================

# ── Stage 1: Builder — cài dependencies ───────────────────
FROM python:3.13-slim AS builder

WORKDIR /app

# Cài build tools cần thiết cho một số packages (asyncpg, orjson)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements trước để tận dụng Docker layer cache
COPY requirements.txt .

# Cài packages vào /app/wheels để copy sang runtime stage
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt


# ── Stage 2: Runtime — image nhỏ gọn ─────────────────────
FROM python:3.13-slim AS runtime

WORKDIR /app

# Chỉ cài runtime lib (libpq), không cần gcc
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages từ builder stage
COPY --from=builder /install /usr/local

# Copy source code
COPY . .

# Tạo non-root user để chạy app (security best practice)
RUN groupadd -r tarot && useradd -r -g tarot tarot && \
    chown -R tarot:tarot /app
USER tarot

# Expose port
EXPOSE 8000

# Health check — kiểm tra mỗi 30s
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Entry point — chạy uvicorn
# --workers 2 cho production; dùng 1 worker nếu cần debug
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
