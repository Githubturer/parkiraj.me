from fastapi import APIRouter, Depends
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.api.deps import get_current_active_user
from app.models.user import User, UserRead
from app.models.listing import Listing, ListingRead
from app.models.invoice import Invoice, InvoiceRead
from typing import List

router = APIRouter()


@router.get("/me/", response_model=UserRead)
async def read_users_me(
    current_user: User = Depends(get_current_active_user)
):
    """Get current user profile."""
    return current_user


@router.get("/me/listings/", response_model=List[ListingRead])
async def read_user_listings(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get all listings created by the current user."""
    statement = select(Listing).where(Listing.owner_id == current_user.id)
    result = await session.exec(statement)
    listings = result.all()
    return listings


@router.get("/me/invoices/", response_model=List[InvoiceRead])
async def read_user_invoices(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_active_user)
):
    """Get all invoices for the current user."""
    statement = select(Invoice).where(Invoice.user_id == current_user.id)
    result = await session.exec(statement)
    invoices = result.all()
    return invoices