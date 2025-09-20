import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Clock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatPriceWithPeriod } from "@/lib/utils";

interface ListingCardProps {
  id: string;
  title: string;
  address: string;
  city: string;
  pricePerHour: number;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  vehicleTypes: string[];
  isLongTerm?: boolean;
  isShortTerm?: boolean;
  features?: string[];
  className?: string;
}

const ListingCard = ({
  id,
  title,
  address,
  city,
  pricePerHour,
  pricePerDay,
  rating,
  reviewCount,
  imageUrl,
  vehicleTypes,
  isLongTerm = false,
  isShortTerm = true,
  features = [],
  className
}: ListingCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/listing/${id}`);
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/listing/${id}`);
  };

  return (
    <Card 
      className={`group cursor-pointer transition-smooth hover:shadow-custom-lg border-border/50 overflow-hidden ${className}`}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative h-48 bg-muted overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
          />
        ) : (
          <div className="w-full h-full gradient-primary flex items-center justify-center">
            <MapPin className="h-12 w-12 text-white/80" />
          </div>
        )}
        
        {/* Quick Info Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {isShortTerm && (
            <Badge variant="secondary" className="bg-white/90 text-primary-foreground">
              <Clock className="w-3 h-3 mr-1" />
              Po satu
            </Badge>
          )}
          {isLongTerm && (
            <Badge variant="secondary" className="bg-white/90 text-primary-foreground">
              Dugoročno
            </Badge>
          )}
        </div>

        {/* Security Badge */}
        {features.includes("secure") && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="bg-success/90 text-white">
              <Shield className="w-3 h-3 mr-1" />
              Sigurno
            </Badge>
          </div>
        )}

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center space-x-1 bg-card/95 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="h-3 w-3 fill-warning text-warning" />
          <span className="text-xs font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">({reviewCount})</span>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-fast">
            {title}
          </h3>
          <div className="flex items-center text-muted-foreground text-sm">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">{address}, {city}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Vehicle Types */}
        <div className="flex flex-wrap gap-1">
          {vehicleTypes.slice(0, 3).map((type) => (
            <Badge key={type} variant="outline" className="text-xs">
              {type}
            </Badge>
          ))}
          {vehicleTypes.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{vehicleTypes.length - 3} more
            </Badge>
          )}
        </div>

        {/* Pricing and Book Button */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-lg font-bold text-primary">
              {formatPriceWithPeriod(pricePerHour, 'hour')}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatPriceWithPeriod(pricePerDay, 'day')}
            </div>
          </div>
          
          <Button 
            size="sm" 
            onClick={handleBookClick}
            className="gradient-primary border-0 text-white hover:opacity-90 transition-fast"
          >
            Rezerviraj
          </Button>
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-2 border-t border-border">
            {features.slice(0, 2).map((feature) => (
              <span key={feature} className="text-xs text-muted-foreground">
                • {feature}
              </span>
            ))}
            {features.length > 2 && (
              <span className="text-xs text-muted-foreground">
                • +{features.length - 2} more
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListingCard;