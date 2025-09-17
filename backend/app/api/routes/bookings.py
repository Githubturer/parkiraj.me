from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.booking import Booking, BookingCreate, BookingRead, BookingUpdate
from app.models.listing import Listing
from typing import List

router = APIRouter()


@router.post("/", response_model=BookingRead)
async def create_booking(
    booking_data: BookingCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new booking request."""
    # Check if listing exists and is available
    statement = select(Listing).where(Listing.id == booking_data.listing_id)
    result = await session.exec(statement)
    listing = result.first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if not listing.is_available:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Listing is not available"
        )
    
    if listing.owner_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot book your own listing"
        )
    
    # Create booking
    db_booking = Booking(**booking_data.dict(), guest_id=current_user.id)
    session.add(db_booking)
    await session.commit()
    await session.refresh(db_booking)
    return db_booking


@router.get("/me/bookings", response_model=List[BookingRead])
async def read_user_bookings(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get all bookings made by the current user."""
    statement = select(Booking).where(Booking.guest_id == current_user.id)
    result = await session.exec(statement)
    bookings = result.all()
    return bookings


@router.get("/me/rents", response_model=List[BookingRead])
async def read_user_rents(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get all booking requests for listings owned by the current user."""
    # Join bookings with listings to find bookings for user's listings
    statement = select(Booking).join(Listing).where(Listing.owner_id == current_user.id)
    result = await session.exec(statement)
    bookings = result.all()
    return bookings


@router.patch("/{booking_id}", response_model=BookingRead)
async def update_booking_status(
    booking_id: int,
    booking_update: BookingUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update booking status (only by listing owner)."""
    # Get booking with listing info
    statement = select(Booking).join(Listing).where(
        and_(Booking.id == booking_id, Listing.owner_id == current_user.id)
    )
    result = await session.exec(statement)
    booking = result.first()
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found or not authorized"
        )
    
    # Update status
    if booking_update.status:
        booking.status = booking_update.status
    
    session.add(booking)
    await session.commit()
    await session.refresh(booking)
    return booking