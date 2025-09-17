import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useListing } from "@/hooks/useListings";
import { useBookings } from "@/hooks/useBookings";
import { useAuthContext } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Star, 
  Shield, 
  Clock, 
  Car, 
  Calendar as CalendarIcon,
  ArrowLeft,
  MessageCircle
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, getToken } = useAuthContext();
  const token = getToken();
  
  const listingId = id ? parseInt(id) : 0;
  const { listing, isLoading, error } = useListing(listingId);
  const { createBooking } = useBookings(token);
  
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isBooking, setIsBooking] = useState(false);

  const handleBooking = async () => {
    if (!user) {
      toast({
        title: "Potrebna prijava",
        description: "Molimo prijavite se za rezervaciju",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!startDate || !endDate || !listing) {
      toast({
        title: "Greška",
        description: "Molimo odaberite datume",
        variant: "destructive",
      });
      return;
    }

    if (listing.owner_id === user.id) {
      toast({
        title: "Greška",
        description: "Ne možete rezervirati vlastiti oglas",
        variant: "destructive",
      });
      return;
    }

    const days = differenceInDays(endDate, startDate);
    const totalPrice = days * listing.price_per_day;

    setIsBooking(true);
    
    const result = await createBooking({
      listing_id: listing.id,
      start_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      total_price: totalPrice,
    });

    if (result.success) {
      navigate('/dashboard');
    }
    
    setIsBooking(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
            <div>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p className="text-destructive mb-4">{error || "Oglas nije pronađen"}</p>
            <Button onClick={() => navigate('/search')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Natrag na pretraživanje
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalDays = startDate && endDate ? differenceInDays(endDate, startDate) : 0;
  const totalPrice = totalDays * listing.price_per_day;

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Placeholder */}
            <div className="h-64 bg-gradient-primary rounded-lg flex items-center justify-center">
              <MapPin className="h-16 w-16 text-white/80" />
            </div>

            {/* Listing Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{listing.title}</CardTitle>
                    <div className="flex items-center text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{listing.address}, {listing.city}, {listing.state}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 fill-warning text-warning mr-1" />
                        <span className="font-medium">4.5</span>
                        <span className="text-muted-foreground ml-1">(12 recenzija)</span>
                      </div>
                      <Badge variant="outline">
                        <Shield className="h-3 w-3 mr-1" />
                        Provjereno
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ${listing.price_per_hour}/sat
                    </div>
                    <div className="text-lg text-muted-foreground">
                      ${listing.price_per_day}/dan
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {listing.description && (
                  <>
                    <h3 className="font-semibold mb-2">Opis</h3>
                    <p className="text-muted-foreground mb-4">{listing.description}</p>
                  </>
                )}

                <Separator className="my-4" />

                {/* Features */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Značajke</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Tip vozila: {listing.vehicle_types.join(', ')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">
                        {listing.is_short_term && listing.is_long_term ? 'Kratkoročno i dugoročno' :
                         listing.is_short_term ? 'Kratkoročno' : 'Dugoročno'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Rezerviraj sada</CardTitle>
                <CardDescription>
                  Odaberite datume za rezervaciju
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "dd.MM.") : "Od"}
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

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "dd.MM.") : "Do"}
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

                {/* Price Calculation */}
                {startDate && endDate && totalDays > 0 && (
                  <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span>${listing.price_per_day} × {totalDays} dana</span>
                      <span>${totalPrice}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Ukupno</span>
                      <span>${totalPrice}</span>
                    </div>
                  </div>
                )}

                {/* Book Button */}
                <Button 
                  className="w-full gradient-primary border-0 text-white"
                  onClick={handleBooking}
                  disabled={!startDate || !endDate || isBooking || !listing.is_available}
                >
                  {isBooking ? "Rezerviranje..." : 
                   !listing.is_available ? "Nedostupno" :
                   !user ? "Prijavite se za rezervaciju" : "Rezerviraj"}
                </Button>

                {user && user.id !== listing.owner_id && (
                  <Button variant="outline" className="w-full">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Kontaktiraj vlasnika
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;