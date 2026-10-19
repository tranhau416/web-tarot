"""
============================================================
Tarot Web App - Application Settings (Pydantic v2)
backend/app/core/config.py
============================================================
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),  # .env.local overrides .env
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://tarot_user:tarot_pass@localhost:5432/tarot_db"
    # Tự tạo bảng + seed 78 lá khi khởi động nếu DB còn thiếu
    AUTO_INIT_DB: bool = True

    # Tavily
    TAVILY_API_KEY: str = ""

    # Anthropic Claude AI
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-opus-5-5"
    # low | medium | high | xhigh | max (tên riêng để không trùng biến CLAUDE_EFFORT của Claude Code)
    CLAUDE_READING_EFFORT: str = "medium"
    CLAUDE_MAX_TOKENS: int = 16000       # gồm cả token suy nghĩ (adaptive thinking)

    # Google Gemini AI
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # LLM Streaming
    STREAM_TIMEOUT_SECONDS: int = 90
    LLM_MAX_RETRIES: int = 1
    LLM_TEMPERATURE: float = 0.8         # chỉ áp dụng cho Gemini
    LLM_TOP_P: float = 0.9               # chỉ áp dụng cho Gemini
    LLM_MAX_OUTPUT_TOKENS: int = 8192    # Gemini (2.5 tính cả token suy nghĩ)

    # Quantum RNG
    ANU_QRNG_URL: str = "https://qrng.anu.edu.au/API/jsonI.php"
    # API mới (https://quantumnumbers.anu.edu.au) cần key — đặt kèm ANU_QRNG_URL tương ứng
    ANU_API_KEY: str = ""
    ENTROPY_TIMEOUT_SECONDS: float = 4.0

    # HTTP
    # Danh sách origin cho CORS, phân tách bằng dấu phẩy (dev: Next.js chạy port 3000)
    CORS_ORIGINS: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:3001,http://127.0.0.1:3001"
    )

    # App
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-this-in-production"

    @property
    def cors_origins(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
