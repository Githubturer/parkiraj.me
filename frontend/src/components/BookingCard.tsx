import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Booking } from "@/lib/api";
import { format } from "date-fns";
import { hr } from "date-fns/locale";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageCircle,
  Euro
} from "lucide-react";

interface BookingCardProps {
  booking: Booking;
  type: "booking" | "rent";
  onStatusUpdate?: (bookingId: number, status: 'confirmed' | 'declined') => void;
  onMessage?: (bookingId: number) => void;
  isUpdating?: boolean;
}

const BookingCard = ({ 
  booking, 
  type, 
  onStatusUpdate, 
  onMessage, 
  isUpdating = false 
}: BookingCardProps) => {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-warning border-warning">
            <Clock className="w-3 h-3 mr-1" />
            Na čekanju
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="outline" className="text-success border-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Potvrđeno
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="outline" className="text-destructive border-destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Odbijeno
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="text-primary border-primary">
            <CheckCircle className="w-3 h-3 mr-1" />
            Završeno
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd. MMM yyyy', { locale: hr });
  };

  const calculateDays = () => {
    const start = new Date(booking.start_date);
    const end = new Date(booking.end_date);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const days = calculateDays();

  return (
    <Card className="transition-smooth hover:shadow-custom-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {type === 'booking' ? 'Moja rezervacija' : 'Zahtjev za najam'} #{booking.id}
            </CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
              </span>
              <span className="mx-2">•</span>
              <span>{days} {days === 1 ? 'dan' : 'dana'}</span>
            </div>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Listing Info - This would need to be fetched separately in a real app */}
        <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">Parkirno mjesto #{booking.listing_id}</h4>
            <p className="text-sm text-muted-foreground">
              Detalji lokacije bi trebali biti dohvaćeni iz listing-a
            </p>
          </div>
        </div>

        <Separator />

        {/* Price Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ukupna cijena:</span>
            <div className="flex items-center font-semibold text-primary">
              <Euro className="h-4 w-4 mr-1" />
              {booking.total_price}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {type === 'rent' && booking.status === 'pending' && onStatusUpdate && (
            <>
              <Button
                size="sm"
                className="flex-1 bg-success hover:bg-success/90 text-white"
                onClick={() => onStatusUpdate(booking.id, 'confirmed')}
                disabled={isUpdating}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Potvrdi
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-destructive border-destructive hover:bg-destructive hover:text-white"
                onClick={() => onStatusUpdate(booking.id, 'declined')}
                disabled={isUpdating}
              >
                <XCircle className="h-4 w-4 mr-1" />
                Odbij
              </Button>
            </>
          )}
          
          {onMessage && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onMessage(booking.id)}
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              Poruke
            </Button>
          )}
        </div>

        {/* Status-specific messages */}
        {booking.status === 'pending' && type === 'booking' && (
          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
            <p className="text-sm text-warning-foreground">
              Vaša rezervacija čeka potvrdu vlasnika parkirnog mjesta.
            </p>
          </div>
        )}

        {booking.status === 'confirmed' && (
          <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
            <p className="text-sm text-success-foreground">
              {type === 'booking' 
                ? 'Vaša rezervacija je potvrđena! Možete koristiti parkirno mjesto u dogovorenom vremenu.'
                : 'Rezervacija je potvrđena. Kontaktirajte gosta za dodatne detalje.'
              }
            </p>
          </div>
        )}

        {booking.status === 'declined' && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive-foreground">
              {type === 'booking'
                ? 'Nažalost, vaša rezervacija je odbijena. Pokušajte s drugim parkirnim mjestom.'
                : 'Rezervacija je odbijena.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BookingCard;