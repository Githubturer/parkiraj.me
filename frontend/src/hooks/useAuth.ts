import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '@/services/AuthService';
import { User, LoginCredentials, RegisterData, ApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Custom hook for authentication state management
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const authService = AuthService.getInstance();
  
  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      if (token) {
        try {
          const userData = await authService.getCurrentUser(token);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token might be expired or invalid
          authService.removeToken();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    
    initializeAuth();
  }, []);
  
  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const { access_token } = await authService.login(credentials);
      authService.saveToken(access_token);
      
      const userData = await authService.getCurrentUser(access_token);
      setUser(userData);
      setIsAuthenticated(true);
      
      toast({
        title: "Uspješna prijava",
        description: `Dobrodošli natrag, ${userData.first_name}!`,
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? 'Neispravni podaci za prijavu' 
        : 'Greška pri prijavi';
      
      toast({
        title: "Greška pri prijavi",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const register = useCallback(async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register(userData);
      
      // Auto-login after registration
      const loginResult = await login({
        username: userData.email,
        password: userData.password,
      });
      
      if (loginResult.success) {
        toast({
          title: "Uspješna registracija",
          description: `Dobrodošli, ${newUser.first_name}!`,
        });
      }
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? 'Email adresa je već registrirana' 
        : 'Greška pri registraciji';
      
      toast({
        title: "Greška pri registraciji",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [login]);
  
  const logout = useCallback(() => {
    authService.removeToken();
    setUser(null);
    setIsAuthenticated(false);
    
    toast({
      title: "Uspješna odjava",
      description: "Vidimo se uskoro!",
    });
  }, []);
  
  const getToken = useCallback(() => {
    return authService.getToken();
  }, []);
  
  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    getToken,
  };
};