import { 
  BaseHttpClient, 
  Listing, 
  ListingSchema, 
  CreateListingData, 
  UpdateListingData,
  SearchFilters 
} from '@/lib/api';

// Listing Service following Single Responsibility Principle
export class ListingService extends BaseHttpClient {
  private static instance: ListingService;
  
  static getInstance(): ListingService {
    if (!ListingService.instance) {
      ListingService.instance = new ListingService();
    }
    return ListingService.instance;
  }
  
  async createListing(token: string, listingData: CreateListingData): Promise<Listing> {
    const response = await this.authenticatedRequest<Listing>(
      '/listings/',
      token,
      {
        method: 'POST',
        body: JSON.stringify(listingData),
      }
    );
    
    return ListingSchema.parse(response);
  }
  
  async getListings(filters: SearchFilters = {}): Promise<Listing[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });
    
    const endpoint = `/listings/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<Listing[]>(endpoint);
    
    return response.map(listing => ListingSchema.parse(listing));
  }
  
  async getListing(id: number): Promise<Listing> {
    const response = await this.request<Listing>(`/listings/${id}`);
    return ListingSchema.parse(response);
  }
  
  async updateListing(
    token: string, 
    id: number, 
    updateData: UpdateListingData
  ): Promise<Listing> {
    const response = await this.authenticatedRequest<Listing>(
      `/listings/${id}`,
      token,
      {
        method: 'PUT',
        body: JSON.stringify(updateData),
      }
    );
    
    return ListingSchema.parse(response);
  }
  
  async deleteListing(token: string, id: number): Promise<{ message: string }> {
    return this.authenticatedRequest(`/listings/${id}`, token, {
      method: 'DELETE',
    });
  }
  
  async getUserListings(token: string): Promise<Listing[]> {
    const response = await this.authenticatedRequest<Listing[]>('/users/me/listings/', token);
    return response.map(listing => ListingSchema.parse(listing));
  }
}