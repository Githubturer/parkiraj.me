import { BaseHttpClient, LoginCredentials, RegisterData, User, UserSchema, ApiError } from '@/lib/api';

// Authentication Service following Single Responsibility Principle
export class AuthService extends BaseHttpClient {
  private static instance: AuthService;
  
  // Singleton pattern for consistent auth state
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }
  
  async login(credentials: LoginCredentials): Promise<{ access_token: string; token_type: string }> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const url = `${this.baseUrl}/token`;
    
    const response = await fetch(url, {
      method: 'POST',
      body: formData, // Don't set Content-Type header for FormData
    });
    
    if (!response.ok) {
      throw new ApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        await response.text()
      );
    }
    
    return await response.json();
  }
  
  async register(userData: RegisterData): Promise<User> {
    const response = await this.request<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    return UserSchema.parse(response);
  }
  
  async getCurrentUser(token: string): Promise<User> {
    const response = await this.authenticatedRequest<User>('/users/me/', token);
    return UserSchema.parse(response);
  }
  
  // Token management
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }
  
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
  
  removeToken(): void {
    localStorage.removeItem('auth_token');
  }
  
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}