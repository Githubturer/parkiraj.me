from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_db_and_tables
from app.api.api import api_router

app = FastAPI(
    title="Parkiraj.me API",
    description="Backend API for parking marketplace application",
    version="1.0.0"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.on_event("startup")
async def on_startup():
    """Create database tables on startup."""
    await create_db_and_tables()


@app.get("/")
async def root():
    """Root endpoint."""
    return {"message": "Welcome to Parkiraj.me API"}


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}