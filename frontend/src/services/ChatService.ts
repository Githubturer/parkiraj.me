import { Message, MessageSchema } from '@/lib/api';

// Chat Service for WebSocket communication
export class ChatService {
  private static instance: ChatService;
  private connections: Map<number, WebSocket> = new Map();
  
  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
  
  connectToBookingChat(
    bookingId: number,
    token: string,
    onMessage: (message: Message) => void,
    onError?: (error: Event) => void
  ): WebSocket {
    // Close existing connection if any
    this.disconnectFromBookingChat(bookingId);
    
    const wsUrl = `ws://localhost:8000/api/v1/ws/chat/${bookingId}?token=${token}`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log(`Connected to chat for booking ${bookingId}`);
    };
    
    ws.onmessage = (event) => {
      try {
        const messageData = JSON.parse(event.data);
        const message = MessageSchema.parse(messageData);
        onMessage(message);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error(`WebSocket error for booking ${bookingId}:`, error);
      onError?.(error);
    };
    
    ws.onclose = () => {
      console.log(`Disconnected from chat for booking ${bookingId}`);
      this.connections.delete(bookingId);
    };
    
    this.connections.set(bookingId, ws);
    return ws;
  }
  
  sendMessage(bookingId: number, content: string): void {
    const ws = this.connections.get(bookingId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ content }));
    } else {
      throw new Error(`No active connection for booking ${bookingId}`);
    }
  }
  
  disconnectFromBookingChat(bookingId: number): void {
    const ws = this.connections.get(bookingId);
    if (ws) {
      ws.close();
      this.connections.delete(bookingId);
    }
  }
  
  disconnectAll(): void {
    this.connections.forEach((ws) => ws.close());
    this.connections.clear();
  }
}