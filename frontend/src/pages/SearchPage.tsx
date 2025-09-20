import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useListings } from "@/hooks/useListings";
import { SearchFilters as SearchFiltersType } from "@/lib/api";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import ListingCard from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Frown, SearchX } from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialFilters = useMemo(() => {
    const filters: SearchFiltersType = {};
    searchParams.forEach((value, key) => {
      if (key === 'min_price' || key === 'max_price') {
        filters[key] = Number(value);
      } else if (key === 'long_term' || key === 'short_term') {
        filters[key] = value === 'true';
      } else if (key === 'region' || key === 'vehicle_type') {
        filters[key] = value;
      }
    });
    return filters;
  }, [searchParams]);

  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters);
  const { listings, isLoading, error, fetchListings } = useListings(initialFilters);

  useEffect(() => {
    fetchListings(filters);
  }, [filters]); 

  const handleFiltersChange = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
  };

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        newSearchParams.set(key, String(value));
      }
    });
    setSearchParams(newSearchParams);
    fetchListings(filters);
  };

  const resetFilters = () => {
    setFilters({});
    setSearchParams({});
    fetchListings({});
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="mt-8">
          <Frown className="h-4 w-4" />
          <AlertTitle>Greška!</AlertTitle>
          <AlertDescription>
            Došlo je do greške prilikom dohvaćanja oglasa. Molimo pokušajte ponovo kasnije.
          </AlertDescription>
        </Alert>
      );
    }

    if (listings.length === 0) {
      return (
        <div className="text-center py-16">
          <SearchX className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Nema rezultata</h2>
          <p className="mt-2 text-muted-foreground">
            Pokušajte promijeniti filtere ili proširiti pretragu.
          </p>
          <button onClick={resetFilters} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md">
            Očisti filtere
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard
            key={listing.id}
            id={String(listing.id)}
            title={listing.title}
            address={listing.address}
            city={listing.city}
            pricePerHour={listing.price_per_hour}
            pricePerDay={listing.price_per_day}
            rating={4.5} // Placeholder
            reviewCount={12} // Placeholder
            imageUrl={listing.images && listing.images.length > 0 ? listing.images[0] : undefined}
            vehicleTypes={listing.vehicle_types}
            isLongTerm={listing.is_long_term}
            isShortTerm={listing.is_short_term}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Pronađi parking</h1>
        <p className="text-lg text-muted-foreground">
          Pretražite dostupna parkirna mjesta.
        </p>
      </header>
      
      <div className="mb-8">
        <SearchBar 
          onSearch={(data) => {
            const newFilters = { ...filters, region: data.location, vehicle_type: data.vehicleType };
            setFilters(newFilters);
            applyFilters();
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <SearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApply={applyFilters}
            onReset={resetFilters}
            isLoading={isLoading}
          />
        </aside>

        <main className="lg:col-span-3">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;
