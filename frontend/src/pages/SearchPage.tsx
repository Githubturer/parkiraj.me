import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import SearchBar from "@/components/SearchBar";
import SearchFilters from "@/components/SearchFilters";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListings } from "@/hooks/useListings";
import { SearchFilters } from "@/lib/api";
import { Filter } from "lucide-react";

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({
    region: searchParams.get('region') || undefined,
    vehicle_type: searchParams.get('vehicle_type') || undefined,
    min_price: searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price: searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    long_term: searchParams.get('long_term') === 'true' ? true : undefined,
    short_term: searchParams.get('short_term') === 'true' ? true : undefined,
    skip: 0,
    limit: 20,
  });

  const { listings, isLoading, error, fetchListings } = useListings(filters);

  const handleSearch = (searchData: any) => {
    const newFilters: SearchFilters = {
      region: searchData.location || undefined,
      vehicle_type: searchData.vehicleType || undefined,
      skip: 0,
      limit: 20,
    };

    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  const loadMore = () => {
    const newFilters = {
      ...filters,
      skip: (filters.skip || 0) + (filters.limit || 20),
    };
    setFilters(newFilters);
  };

  useEffect(() => {
    fetchListings(filters);
  }, [filters, fetchListings]);

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => fetchListings(filters)}>
              Pokušaj ponovno
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Search Header */}
      <section className="bg-card border-b border-border py-8">
        <div className="container mx-auto px-4">
          <SearchBar onSearch={handleSearch} />
        </div>
      </section>

      {/* Results */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <SearchFilters
                filters={filters}
                onFiltersChange={setFilters}
                onApply={() => fetchListings(filters)}
                onReset={() => {
                  const resetFilters = { skip: 0, limit: 20 };
                  setFilters(resetFilters);
                  fetchListings(resetFilters);
                }}
                isLoading={isLoading}
              />
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {/* Results Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Dostupna parkirna mjesta
                </h1>
                {!isLoading && (
                  <p className="text-muted-foreground">
                    Pronađeno {listings.length} rezultata
                  </p>
                )}
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, index) => (
                    <Card key={index} className="overflow-hidden">
                      <Skeleton className="h-48 w-full" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <div className="flex justify-between items-center">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Results Grid */}
              {!isLoading && listings.length > 0 && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                      <ListingCard
                        key={listing.id}
                        id={String(listing.id)}
                        title={listing.title}
                        address={listing.address}
                        city={listing.city}
                        pricePerHour={listing.price_per_hour}
                        pricePerDay={listing.price_per_day}
                        rating={4.5} // TODO: Add rating to backend
                        reviewCount={12} // TODO: Add reviews to backend
                        vehicleTypes={listing.vehicle_types}
                        isLongTerm={listing.is_long_term}
                        isShortTerm={listing.is_short_term}
                        features={[]} // TODO: Add features to backend
                      />
                    ))}
                  </div>

                  {/* Load More */}
                  <div className="text-center mt-8">
                    <Button onClick={loadMore} variant="outline" size="lg">
                      Učitaj više rezultata
                    </Button>
                  </div>
                </>
              )}

              {/* No Results */}
              {!isLoading && listings.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <Filter className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Nema rezultata
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Pokušajte s drugim kriterijima pretrage
                  </p>
                  <Button onClick={() => {
                    const resetFilters = { skip: 0, limit: 20 };
                    setFilters(resetFilters);
                    fetchListings(resetFilters);
                  }}>
                    Očisti filtere
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SearchPage;
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
