"""
============================================================
Tarot Web App - Async Database Engine & Session Factory
backend/app/core/database.py
============================================================
"""

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.core.config import settings

# Tạo async engine — NullPool phù hợp cho môi trường serverless/test
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.APP_ENV == "development",
    pool_pre_ping=True,
    poolclass=NullPool if settings.APP_ENV == "test" else None,  # type: ignore
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db() -> AsyncSession:  # type: ignore[return]
    """FastAPI Dependency: yield một AsyncSession cho mỗi request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
