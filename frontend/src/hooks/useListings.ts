import { useState, useEffect, useCallback } from 'react';
import { ListingService } from '@/services/ListingService';
import { Listing, CreateListingData, UpdateListingData, SearchFilters, ApiError } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

// Custom hook for listing management
export const useListings = (initialFilters: SearchFilters = {}) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const listingService = ListingService.getInstance();
  
  const fetchListings = useCallback(async (filters: SearchFilters = initialFilters) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await listingService.getListings(filters);
      setListings(data);
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? 'Greška pri dohvaćanju oglasa' 
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
  }, [initialFilters]);
  
  const createListing = useCallback(async (token: string, listingData: CreateListingData) => {
    console.log("=== USE LISTINGS CREATE ===");
    console.log("Token:", token ? "EXISTS" : "NULL");
    console.log("Listing data:", listingData);
    
    setIsLoading(true);
    try {
      console.log("Calling listingService.createListing...");
      const newListing = await listingService.createListing(token, listingData);
      console.log("Listing service returned:", newListing);
      
      setListings(prev => [newListing, ...prev]);
      
      console.log("Returning success result");
      return { success: true, listing: newListing };
    } catch (error) {
      console.error("Error in useListings createListing:", error);
      console.error("Error type:", typeof error);
      console.error("Error constructor:", error?.constructor?.name);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      
      const errorMessage = error instanceof ApiError 
        ? 'Greška pri stvaranju oglasa' 
        : 'Neočekivana greška';
      
      console.log("Error message to show:", errorMessage);
      
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateListing = useCallback(async (
    token: string, 
    id: number, 
    updateData: UpdateListingData
  ) => {
    setIsLoading(true);
    try {
      const updatedListing = await listingService.updateListing(token, id, updateData);
      setListings(prev => prev.map(listing => 
        listing.id === id ? updatedListing : listing
      ));
      
      toast({
        title: "Uspješno ažurirano",
        description: "Vaš oglas je uspješno ažuriran!",
      });
      
      return { success: true, listing: updatedListing };
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? 'Greška pri ažuriranju oglasa' 
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
  }, []);
  
  const deleteListing = useCallback(async (token: string, id: number) => {
    setIsLoading(true);
    try {
      await listingService.deleteListing(token, id);
      setListings(prev => prev.filter(listing => listing.id !== id));
      
      toast({
        title: "Uspješno obrisano",
        description: "Vaš oglas je uspješno obrisan!",
      });
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? 'Greška pri brisanju oglasa' 
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
  }, []);
  
  // Initialize listings
  useEffect(() => {
    fetchListings();
  }, []); // Remove fetchListings dependency to prevent infinite loop
  
  return {
    listings,
    isLoading,
    error,
    fetchListings,
    createListing,
    updateListing,
    deleteListing,
  };
};

// Hook for single listing
export const useListing = (id: number) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const listingService = ListingService.getInstance();
  
  const fetchListing = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await listingService.getListing(id);
      setListing(data);
    } catch (error) {
      const errorMessage = error instanceof ApiError 
        ? 'Oglas nije pronađen' 
        : 'Neočekivana greška';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id]);
  
  useEffect(() => {
    fetchListing();
  }, [fetchListing]);
  
  return {
    listing,
    isLoading,
    error,
    refetch: fetchListing,
  };
};