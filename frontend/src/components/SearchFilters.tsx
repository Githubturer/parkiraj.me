import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SearchFilters as SearchFiltersType } from "@/lib/api";
import { SlidersHorizontal, X, MapPin, Euro, Car, Clock } from "lucide-react";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFiltersChange: (filters: SearchFiltersType) => void;
  onApply: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

const vehicleTypes = [
  { value: "car", label: "Automobil" },
  { value: "suv", label: "SUV" },
  { value: "van", label: "Kombi" },
  { value: "truck", label: "Kamion" },
  { value: "motorcycle", label: "Motocikl" },
  { value: "bicycle", label: "Bicikl" },
];

const SearchFilters = ({ 
  filters, 
  onFiltersChange, 
  onApply, 
  onReset, 
  isLoading = false 
}: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [priceRange, setPriceRange] = useState([
    filters.min_price || 0, 
    filters.max_price || 100
  ]);

  const updateFilter = (key: keyof SearchFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    updateFilter('min_price', values[0]);
    updateFilter('max_price', values[1]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.region) count++;
    if (filters.vehicle_type) count++;
    if (filters.min_price && filters.min_price > 0) count++;
    if (filters.max_price && filters.max_price < 100) count++;
    if (filters.long_term) count++;
    if (filters.short_term === false) count++; // Only count if explicitly set to false
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <SlidersHorizontal className="h-5 w-5 mr-2" />
            Filtri
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Sakrij" : "Prikaži"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Location Filter */}
          <div className="space-y-2">
            <Label className="flex items-center text-sm font-medium">
              <MapPin className="h-4 w-4 mr-2" />
              Lokacija
            </Label>
            <Input
              placeholder="Grad ili regija..."
              value={filters.region || ""}
              onChange={(e) => updateFilter('region', e.target.value)}
            />
          </div>

          <Separator />

          {/* Price Range */}
          <div className="space-y-4">
            <Label className="flex items-center text-sm font-medium">
              <Euro className="h-4 w-4 mr-2" />
              Cijena po danu (€)
            </Label>
            <div className="px-2">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={100}
                min={0}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>€{priceRange[0]}</span>
                <span>€{priceRange[1]}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Vehicle Type */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm font-medium">
              <Car className="h-4 w-4 mr-2" />
              Tip vozila
            </Label>
            <Select
              value={filters.vehicle_type || ""}
              onValueChange={(value) => updateFilter('vehicle_type', value || undefined)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Svi tipovi vozila" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Svi tipovi vozila</SelectItem>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Rental Duration */}
          <div className="space-y-3">
            <Label className="flex items-center text-sm font-medium">
              <Clock className="h-4 w-4 mr-2" />
              Trajanje najma
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="short-term"
                  checked={filters.short_term !== false}
                  onCheckedChange={(checked) => 
                    updateFilter('short_term', checked ? undefined : false)
                  }
                />
                <Label htmlFor="short-term" className="text-sm">
                  Kratkoročni najam (sati/dani)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="long-term"
                  checked={filters.long_term === true}
                  onCheckedChange={(checked) => 
                    updateFilter('long_term', checked ? true : undefined)
                  }
                />
                <Label htmlFor="long-term" className="text-sm">
                  Dugoročni najam (tjedni/mjeseci)
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              onClick={onApply}
              className="flex-1 gradient-primary border-0 text-white"
              disabled={isLoading}
            >
              {isLoading ? "Pretražujem..." : "Primijeni filtere"}
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              disabled={isLoading || activeFiltersCount === 0}
            >
              <X className="h-4 w-4 mr-1" />
              Očisti
            </Button>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Aktivni filtri:</Label>
              <div className="flex flex-wrap gap-2">
                {filters.region && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {filters.region}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('region', undefined)}
                    />
                  </Badge>
                )}
                {filters.vehicle_type && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {vehicleTypes.find(t => t.value === filters.vehicle_type)?.label}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('vehicle_type', undefined)}
                    />
                  </Badge>
                )}
                {(filters.min_price && filters.min_price > 0) || (filters.max_price && filters.max_price < 100) ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    €{filters.min_price || 0} - €{filters.max_price || 100}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        updateFilter('min_price', undefined);
                        updateFilter('max_price', undefined);
                        setPriceRange([0, 100]);
                      }}
                    />
                  </Badge>
                ) : null}
                {filters.long_term && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Dugoročni najam
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => updateFilter('long_term', undefined)}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default SearchFilters;