from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
import uuid


class MessageBase(SQLModel):
    content: str


class Message(MessageBase, table=True):
    __tablename__ = "messages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    booking_id: int = Field(foreign_key="bookings.id")
    sender_id: uuid.UUID = Field(foreign_key="users.id")
    receiver_id: uuid.UUID = Field(foreign_key="users.id")
    sent_at: datetime = Field(default_factory=datetime.utcnow)


class MessageCreate(MessageBase):
    booking_id: int
    receiver_id: uuid.UUID


class MessageRead(MessageBase):
    id: int
    booking_id: int
    sender_id: uuid.UUID
    receiver_id: uuid.UUID
    sent_at: datetime