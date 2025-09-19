from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from .config import settings

# Async engine for database operations
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=True,
    future=True
)


async def get_session() -> AsyncSession:
    """Dependency to get database session."""
    async with AsyncSession(async_engine) as session:
        yield session


async def create_db_and_tables():
    """Create database tables."""
    async with async_engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)