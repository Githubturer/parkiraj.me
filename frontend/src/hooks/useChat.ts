import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatService } from '@/services/ChatService';
import { Message } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Custom hook for chat functionality
export const useChat = (bookingId: number, token: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  const chatService = ChatService.getInstance();
  
  const connect = useCallback(() => {
    if (!token || !bookingId || isConnected || isConnecting) return;
    
    setIsConnecting(true);
    
    try {
      const ws = chatService.connectToBookingChat(
        bookingId,
        token,
        (message: Message) => {
          setMessages(prev => [...prev, message]);
        },
        (error: Event) => {
          console.error('Chat connection error:', error);
          setIsConnected(false);
          setIsConnecting(false);
          
          toast({
            title: "Greška u chatu",
            description: "Veza s chatom je prekinuta",
            variant: "destructive",
          });
        }
      );
      
      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
      
      wsRef.current = ws;
    } catch (error) {
      setIsConnecting(false);
      toast({
        title: "Greška u chatu",
        description: "Nije moguće uspostaviti vezu s chatom",
        variant: "destructive",
      });
    }
  }, [bookingId, token, isConnected, isConnecting]);
  
  const disconnect = useCallback(() => {
    if (bookingId) {
      chatService.disconnectFromBookingChat(bookingId);
    }
    setIsConnected(false);
    setIsConnecting(false);
    wsRef.current = null;
  }, [bookingId]);
  
  const sendMessage = useCallback((content: string) => {
    if (!isConnected || !bookingId) {
      toast({
        title: "Greška",
        description: "Niste povezani s chatom",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      chatService.sendMessage(bookingId, content);
      return true;
    } catch (error) {
      toast({
        title: "Greška",
        description: "Poruka nije poslana",
        variant: "destructive",
      });
      return false;
    }
  }, [bookingId, isConnected]);
  
  // Auto-connect when dependencies are available
  useEffect(() => {
    if (token && bookingId && !isConnected && !isConnecting) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [token, bookingId]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);
  
  return {
    messages,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    sendMessage,
  };
};