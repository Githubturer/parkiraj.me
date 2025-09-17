from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
import uuid


class ListingBase(SQLModel):
    title: str
    description: Optional[str] = None
    address: str
    city: str
    state: str
    country: str
    zip_code: str
    price_per_day: Decimal = Field(max_digits=10, decimal_places=2)
    price_per_hour: Decimal = Field(max_digits=10, decimal_places=2)
    vehicle_types: List[str] = Field(sa_column=Column(JSON))
    is_long_term: bool = Field(default=False)
    is_short_term: bool = Field(default=True)
    is_available: bool = Field(default=True)


class Listing(ListingBase, table=True):
    __tablename__ = "listings"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    owner_id: uuid.UUID = Field(foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ListingCreate(ListingBase):
    pass


class ListingRead(ListingBase):
    id: int
    owner_id: uuid.UUID
    created_at: datetime


class ListingUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    zip_code: Optional[str] = None
    price_per_day: Optional[Decimal] = None
    price_per_hour: Optional[Decimal] = None
    vehicle_types: Optional[List[str]] = None
    is_long_term: Optional[bool] = None
    is_short_term: Optional[bool] = None
    is_available: Optional[bool] = None