from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.listing import Listing, ListingCreate, ListingRead, ListingUpdate
from typing import List, Optional
from decimal import Decimal

router = APIRouter()


@router.post("/", response_model=ListingRead)
async def create_listing(
    listing_data: ListingCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Create a new listing."""
    db_listing = Listing(**listing_data.dict(), owner_id=current_user.id)
    session.add(db_listing)
    await session.commit()
    await session.refresh(db_listing)
    return db_listing


@router.get("/", response_model=List[ListingRead])
async def read_listings(
    session: AsyncSession = Depends(get_session),
    region: Optional[str] = Query(None, description="Filter by city or state"),
    min_price: Optional[Decimal] = Query(None, description="Minimum price per day"),
    max_price: Optional[Decimal] = Query(None, description="Maximum price per day"),
    vehicle_type: Optional[str] = Query(None, description="Filter by vehicle type"),
    long_term: Optional[bool] = Query(None, description="Filter for long-term rentals"),
    short_term: Optional[bool] = Query(None, description="Filter for short-term rentals"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100)
):
    """Get all listings with optional filters."""
    statement = select(Listing).where(Listing.is_available == True)
    
    # Apply filters
    if region:
        statement = statement.where(
            (Listing.city.ilike(f"%{region}%")) | 
            (Listing.state.ilike(f"%{region}%"))
        )
    
    if min_price is not None:
        statement = statement.where(Listing.price_per_day >= min_price)
    
    if max_price is not None:
        statement = statement.where(Listing.price_per_day <= max_price)
    
    if vehicle_type:
        statement = statement.where(Listing.vehicle_types.contains([vehicle_type]))
    
    if long_term is not None:
        statement = statement.where(Listing.is_long_term == long_term)
    
    if short_term is not None:
        statement = statement.where(Listing.is_short_term == short_term)
    
    statement = statement.offset(skip).limit(limit)
    result = await session.exec(statement)
    listings = result.all()
    return listings


@router.get("/{listing_id}", response_model=ListingRead)
async def read_listing(
    listing_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Get a single listing by ID."""
    statement = select(Listing).where(Listing.id == listing_id)
    result = await session.exec(statement)
    listing = result.first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    return listing


@router.put("/{listing_id}", response_model=ListingRead)
async def update_listing(
    listing_id: int,
    listing_update: ListingUpdate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Update a listing (only by owner)."""
    statement = select(Listing).where(Listing.id == listing_id)
    result = await session.exec(statement)
    listing = result.first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this listing"
        )
    
    # Update fields
    update_data = listing_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(listing, field, value)
    
    session.add(listing)
    await session.commit()
    await session.refresh(listing)
    return listing


@router.delete("/{listing_id}")
async def delete_listing(
    listing_id: int,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Delete a listing (only by owner)."""
    statement = select(Listing).where(Listing.id == listing_id)
    result = await session.exec(statement)
    listing = result.first()
    
    if not listing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Listing not found"
        )
    
    if listing.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this listing"
        )
    
    await session.delete(listing)
    await session.commit()
    return {"message": "Listing deleted successfully"}