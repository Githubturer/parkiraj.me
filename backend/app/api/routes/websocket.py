from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status, Query
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_session
from app.core.security import verify_token
from app.models.user import User
from app.models.booking import Booking
from app.models.message import Message, MessageCreate
from app.models.listing import Listing
from typing import Dict, List
import json
import uuid

router = APIRouter()

# Store active WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, booking_id: int):
        await websocket.accept()
        if booking_id not in self.active_connections:
            self.active_connections[booking_id] = []
        self.active_connections[booking_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, booking_id: int):
        if booking_id in self.active_connections:
            self.active_connections[booking_id].remove(websocket)
            if not self.active_connections[booking_id]:
                del self.active_connections[booking_id]
    
    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)
    
    async def broadcast_to_booking(self, message: str, booking_id: int):
        if booking_id in self.active_connections:
            for connection in self.active_connections[booking_id]:
                await connection.send_text(message)

manager = ConnectionManager()


async def get_user_from_token(token: str, session: AsyncSession) -> User:
    """Get user from JWT token for WebSocket authentication."""
    try:
        payload = verify_token(token)
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        
        user_uuid = uuid.UUID(user_id)
        statement = select(User).where(User.id == user_uuid)
        result = await session.exec(statement)
        user = result.first()
        
        if user is None or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
        
        return user
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)


@router.websocket("/chat/{booking_id}")
async def websocket_chat(
    websocket: WebSocket,
    booking_id: int,
    token: str = Query(...),
):
    """WebSocket endpoint for chat functionality."""
    # Get database session
    async with AsyncSessionLocal() as session:
        try:
            # Authenticate user
            current_user = await get_user_from_token(token, session)
            
            # Verify user has access to this booking
            statement = select(Booking).join(Listing).where(
                Booking.id == booking_id
            )
            result = await session.exec(statement)
            booking = result.first()
            
            if not booking:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
            
            # Check if user is either the guest or the listing owner
            listing_statement = select(Listing).where(Listing.id == booking.listing_id)
            listing_result = await session.exec(listing_statement)
            listing = listing_result.first()
            
            if current_user.id != booking.guest_id and current_user.id != listing.owner_id:
                await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
                return
            
            # Connect to WebSocket
            await manager.connect(websocket, booking_id)
            
            # Send message history
            history_statement = select(Message).where(
                Message.booking_id == booking_id
            ).order_by(Message.sent_at)
            history_result = await session.exec(history_statement)
            messages = history_result.all()
            
            for message in messages:
                message_data = {
                    "id": message.id,
                    "content": message.content,
                    "sender_id": str(message.sender_id),
                    "receiver_id": str(message.receiver_id),
                    "sent_at": message.sent_at.isoformat()
                }
                await manager.send_personal_message(
                    json.dumps(message_data), websocket
                )
            
            # Listen for new messages
            while True:
                data = await websocket.receive_text()
                message_data = json.loads(data)
                
                # Determine receiver (the other party in the booking)
                if current_user.id == booking.guest_id:
                    receiver_id = listing.owner_id
                else:
                    receiver_id = booking.guest_id
                
                # Create and save message
                new_message = Message(
                    booking_id=booking_id,
                    sender_id=current_user.id,
                    receiver_id=receiver_id,
                    content=message_data["content"]
                )
                
                session.add(new_message)
                await session.commit()
                await session.refresh(new_message)
                
                # Broadcast message to all connections for this booking
                broadcast_data = {
                    "id": new_message.id,
                    "content": new_message.content,
                    "sender_id": str(new_message.sender_id),
                    "receiver_id": str(new_message.receiver_id),
                    "sent_at": new_message.sent_at.isoformat()
                }
                
                await manager.broadcast_to_booking(
                    json.dumps(broadcast_data), booking_id
                )
                
        except WebSocketDisconnect:
            manager.disconnect(websocket, booking_id)
        except Exception as e:
            print(f"WebSocket error: {e}")
            await websocket.close(code=status.WS_1011_INTERNAL_ERROR)