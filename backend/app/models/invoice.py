from sqlmodel import SQLModel, Field, Column
from sqlalchemy import JSON
from typing import Optional, Dict, Any
from datetime import datetime, date
from decimal import Decimal
import uuid


class InvoiceBase(SQLModel):
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    issue_date: date = Field(default_factory=date.today)
    due_date: Optional[date] = None
    vat_details: Optional[Dict[str, Any]] = Field(sa_column=Column(JSON))


class Invoice(InvoiceBase, table=True):
    __tablename__ = "invoices"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    booking_id: int = Field(foreign_key="bookings.id", unique=True)
    user_id: uuid.UUID = Field(foreign_key="users.id")


class InvoiceCreate(InvoiceBase):
    booking_id: int
    user_id: uuid.UUID


class InvoiceRead(InvoiceBase):
    id: int
    booking_id: int
    user_id: uuid.UUID