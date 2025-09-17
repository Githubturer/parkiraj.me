import { z } from "zod";

// Base API configuration following Single Responsibility Principle
export class ApiConfig {
  private static readonly BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
  
  static getBaseUrl(): string {
    return this.BASE_URL;
  }
  
  static getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }
}

// HTTP Client following Open/Closed Principle
export abstract class BaseHttpClient {
  protected baseUrl: string;
  
  constructor(baseUrl: string = ApiConfig.getBaseUrl()) {
    this.baseUrl = baseUrl;
  }
  
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...ApiConfig.getHeaders(),
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          await response.text()
        );
      }
      
      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error occurred', 0, String(error));
    }
  }
  
  protected async authenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

// Custom error class for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Validation schemas using Zod
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  first_name: z.string(),
  last_name: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
});

export const ListingSchema = z.object({
  id: z.number(),
  owner_id: z.string().uuid(),
  title: z.string(),
  description: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  zip_code: z.string(),
  price_per_day: z.number(),
  price_per_hour: z.number(),
  vehicle_types: z.array(z.string()),
  is_long_term: z.boolean(),
  is_short_term: z.boolean(),
  is_available: z.boolean(),
  created_at: z.string(),
});

export const BookingSchema = z.object({
  id: z.number(),
  guest_id: z.string().uuid(),
  listing_id: z.number(),
  start_date: z.string(),
  end_date: z.string(),
  total_price: z.number(),
  status: z.enum(['pending', 'confirmed', 'declined', 'completed']),
  created_at: z.string(),
});

export const MessageSchema = z.object({
  id: z.number(),
  booking_id: z.number(),
  sender_id: z.string().uuid(),
  receiver_id: z.string().uuid(),
  content: z.string(),
  sent_at: z.string(),
});

export const InvoiceSchema = z.object({
  id: z.number(),
  booking_id: z.number(),
  user_id: z.string().uuid(),
  amount: z.number(),
  issue_date: z.string(),
  due_date: z.string().optional(),
  vat_details: z.record(z.any()).optional(),
});

// Type definitions
export type User = z.infer<typeof UserSchema>;
export type Listing = z.infer<typeof ListingSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type Message = z.infer<typeof MessageSchema>;
export type Invoice = z.infer<typeof InvoiceSchema>;

export type LoginCredentials = {
  username: string; // email
  password: string;
};

export type RegisterData = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  is_active?: boolean;
};

export type CreateListingData = Omit<Listing, 'id' | 'owner_id' | 'created_at'>;
export type UpdateListingData = Partial<CreateListingData>;

export type CreateBookingData = {
  listing_id: number;
  start_date: string;
  end_date: string;
  total_price: number;
};

export type UpdateBookingData = {
  status?: 'pending' | 'confirmed' | 'declined' | 'completed';
};

export type SearchFilters = {
  region?: string;
  min_price?: number;
  max_price?: number;
  vehicle_type?: string;
  long_term?: boolean;
  short_term?: boolean;
  skip?: number;
  limit?: number;
};