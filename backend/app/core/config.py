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
    )

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://tarot_user:tarot_pass@localhost:5432/tarot_db"

    # Tavily
    TAVILY_API_KEY: str = ""

    # Anthropic Claude AI
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"

    # Google Gemini AI
    GOOGLE_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # LLM Streaming
    STREAM_TIMEOUT_SECONDS: int = 90
    LLM_MAX_RETRIES: int = 1
    LLM_TEMPERATURE: float = 0.8
    LLM_TOP_P: float = 0.9
    LLM_MAX_OUTPUT_TOKENS: int = 4096

    # Quantum RNG
    ANU_QRNG_URL: str = "https://qrng.anu.edu.au/API/jsonI.php"

    # App
    APP_ENV: str = "development"
    SECRET_KEY: str = "change-this-in-production"


settings = Settings()
