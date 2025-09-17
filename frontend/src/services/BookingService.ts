import { 
  BaseHttpClient, 
  Booking, 
  BookingSchema, 
  CreateBookingData, 
  UpdateBookingData 
} from '@/lib/api';

// Booking Service following Single Responsibility Principle
export class BookingService extends BaseHttpClient {
  private static instance: BookingService;
  
  static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService();
    }
    return BookingService.instance;
  }
  
  async createBooking(token: string, bookingData: CreateBookingData): Promise<Booking> {
    const response = await this.authenticatedRequest<Booking>(
      '/bookings/',
      token,
      {
        method: 'POST',
        body: JSON.stringify(bookingData),
      }
    );
    
    return BookingSchema.parse(response);
  }
  
  async getUserBookings(token: string): Promise<Booking[]> {
    const response = await this.authenticatedRequest<Booking[]>('/bookings/me/bookings', token);
    return response.map(booking => BookingSchema.parse(booking));
  }
  
  async getUserRents(token: string): Promise<Booking[]> {
    const response = await this.authenticatedRequest<Booking[]>('/bookings/me/rents', token);
    return response.map(booking => BookingSchema.parse(booking));
  }
  
  async updateBookingStatus(
    token: string, 
    bookingId: number, 
    updateData: UpdateBookingData
  ): Promise<Booking> {
    const response = await this.authenticatedRequest<Booking>(
      `/bookings/${bookingId}`,
      token,
      {
        method: 'PATCH',
        body: JSON.stringify(updateData),
      }
    );
    
    return BookingSchema.parse(response);
  }
}