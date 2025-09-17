import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MapPin, Calendar as CalendarIcon, Car, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  variant?: "hero" | "default";
  className?: string;
  onSearch?: (data: SearchData) => void;
}

interface SearchData {
  location: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  vehicleType: string;
}

const SearchBar = ({ variant = "default", className, onSearch }: SearchBarProps) => {
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [vehicleType, setVehicleType] = useState("");

  const handleSearch = () => {
    const searchData: SearchData = {
      location,
      startDate,
      endDate,
      vehicleType,
    };
    onSearch?.(searchData);
    console.log("Search data:", searchData);
  };

  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "w-full max-w-4xl mx-auto",
        isHero 
          ? "bg-card/95 backdrop-blur-sm rounded-2xl shadow-hero border border-border/50 p-6" 
          : "bg-card rounded-xl shadow-custom-md border border-border p-4",
        className
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Location */}
        <div className="relative">
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Lokacija
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Unesite lokaciju..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 h-12 transition-fast focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Datum početka
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal transition-fast",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Odaberite datum"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Datum kraja
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-12 justify-start text-left font-normal transition-fast",
                  !endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Odaberite datum"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                disabled={(date) => 
                  date < new Date() || (startDate && date <= startDate)
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Vehicle Type & Search */}
        <div className="space-y-4 md:space-y-2">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Tip vozila
            </label>
            <Select value={vehicleType} onValueChange={setVehicleType}>
              <SelectTrigger className="h-12 transition-fast">
                <Car className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Odaberite vozilo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="car">Automobil</SelectItem>
                <SelectItem value="suv">SUV</SelectItem>
                <SelectItem value="van">Kombi</SelectItem>
                <SelectItem value="truck">Kamion</SelectItem>
                <SelectItem value="motorcycle">Motocikl</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleSearch}
            className={cn(
              "w-full h-12 font-semibold transition-smooth",
              isHero 
                ? "gradient-primary border-0 text-white hover:opacity-90 shadow-custom-md" 
                : "gradient-primary border-0 text-white hover:opacity-90"
            )}
          >
            <Search className="mr-2 h-4 w-4" />
            Pronađi parking
          </Button>
        </div>
      </div>
      
      {isHero && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            Preko <span className="font-semibold text-primary">10.000+</span> parkirnih mjesta dostupno
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;