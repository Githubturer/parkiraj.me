from fastapi import APIRouter
from app.api.routes import auth, users, listings, bookings, websocket

api_router = APIRouter()

api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(listings.router, prefix="/listings", tags=["listings"])
api_router.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
api_router.include_router(websocket.router, prefix="/ws", tags=["websocket"])