import { useState, useEffect, useCallback } from 'react';
import { BookingService } from '@/services/BookingService';
import { Booking, CreateBookingData, UpdateBookingData, ApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Custom hook for booking management
export const useBookings = (token: string | null) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rents, setRents] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const bookingService = BookingService.getInstance();
  
  const fetchBookings = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [userBookings, userRents] = await Promise.all([
        bookingService.getUserBookings(token),
        bookingService.getUserRents(token),
      ]);
      
      setBookings(userBookings);
      setRents(userRents);
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? 'Greška pri dohvaćanju rezervacija' 
        : 'Neočekivana greška';
      setError(errorMessage);
      
      toast({
        title: "Greška",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [token]);
  
  const createBooking = useCallback(async (bookingData: CreateBookingData) => {
    if (!token) return { success: false, error: 'Niste prijavljeni' };
    
    setIsLoading(true);
    try {
      const newBooking = await bookingService.createBooking(token, bookingData);
      setBookings(prev => [newBooking, ...prev]);
      
      toast({
        title: "Uspješna rezervacija",
        description: "Vaša rezervacija je uspješno poslana!",
      });
      
      return { success: true, booking: newBooking };
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? 'Greška pri stvaranju rezervacije' 
        : 'Neočekivana greška';
      
      toast({
        title: "Greška",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [token]);
  
  const updateBookingStatus = useCallback(async (
    bookingId: number, 
    updateData: UpdateBookingData
  ) => {
    if (!token) return { success: false, error: 'Niste prijavljeni' };
    
    setIsLoading(true);
    try {
      const updatedBooking = await bookingService.updateBookingStatus(token, bookingId, updateData);
      
      // Update in both bookings and rents arrays
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? updatedBooking : booking
      ));
      setRents(prev => prev.map(rent => 
        rent.id === bookingId ? updatedBooking : rent
      ));
      
      const statusText = updateData.status === 'confirmed' ? 'potvrđena' : 
                        updateData.status === 'declined' ? 'odbijena' : 
                        updateData.status === 'completed' ? 'završena' : 'ažurirana';
      
      toast({
        title: "Status ažuriran",
        description: `Rezervacija je ${statusText}!`,
      });
      
      return { success: true, booking: updatedBooking };
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? 'Greška pri ažuriranju statusa' 
        : 'Neočekivana greška';
      
      toast({
        title: "Greška",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [token]);
  
  // Initialize bookings when token is available
  useEffect(() => {
    if (token) {
      fetchBookings();
    }
  }, [token, fetchBookings]);
  
  return {
    bookings,
    rents,
    isLoading,
    error,
    fetchBookings,
    createBooking,
    updateBookingStatus,
  };
};