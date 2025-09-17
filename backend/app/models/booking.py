from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, date
from decimal import Decimal
from enum import Enum
import uuid


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    DECLINED = "declined"
    COMPLETED = "completed"


class BookingBase(SQLModel):
    start_date: date
    end_date: date
    total_price: Decimal = Field(max_digits=10, decimal_places=2)
    status: BookingStatus = Field(default=BookingStatus.PENDING)


class Booking(BookingBase, table=True):
    __tablename__ = "bookings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    guest_id: uuid.UUID = Field(foreign_key="users.id")
    listing_id: int = Field(foreign_key="listings.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BookingCreate(BookingBase):
    listing_id: int


class BookingRead(BookingBase):
    id: int
    guest_id: uuid.UUID
    listing_id: int
    created_at: datetime


class BookingUpdate(SQLModel):
    status: Optional[BookingStatus] = None