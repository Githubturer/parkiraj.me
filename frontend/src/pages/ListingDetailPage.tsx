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
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { 
  MapPin, 
  Star, 
  Shield, 
  Clock, 
  Car, 
  Calendar as CalendarIcon,
  ArrowLeft,
  MessageCircle,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn, formatPrice, formatPriceWithPeriod } from "@/lib/utils";

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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setIsImageModalOpen(true);
  };

  const nextImage = () => {
    if (listing?.images) {
      setSelectedImageIndex((prev) => 
        prev === listing.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? listing.images.length - 1 : prev - 1
      );
    }
  };

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
            {/* Images */}
            <div className="space-y-4">
              {listing.images && listing.images.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listing.images.map((image, index) => (
                    <div 
                      key={index} 
                      className="h-64 rounded-lg overflow-hidden cursor-pointer group relative"
                      onClick={() => openImageModal(index)}
                    >
                      <img 
                        src={image} 
                        alt={`${listing.title} - Slika ${index + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={(e) => {
                          console.log('Thumbnail loaded:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
                        }}
                        onError={(e) => {
                          console.error('Thumbnail failed to load:', e);
                        }}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-white/90 rounded-full p-2">
                            <svg className="h-6 w-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <MapPin className="h-16 w-16 text-white/80" />
                </div>
              )}
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
                      {formatPriceWithPeriod(listing.price_per_hour, 'hour')}
                    </div>
                    <div className="text-lg text-muted-foreground">
                      {formatPriceWithPeriod(listing.price_per_day, 'day')}
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
                      <span>{formatPrice(listing.price_per_day)} × {totalDays} dana</span>
                      <span>{formatPrice(totalPrice)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Ukupno</span>
                      <span>{formatPrice(totalPrice)}</span>
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

  {/* Image Modal */}
  </div>
  {listing?.images && listing.images.length > 0 && (
    <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
      <DialogContent className="max-w-[100vw] max-h-[100vh] w-[100vw] h-[100vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={() => setIsImageModalOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

        {/* Previous Button */}
        {listing.images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={prevImage}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>
        )}

        {/* Next Button */}
        {listing.images.length > 1 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white rounded-full"
            onClick={nextImage}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>
        )}

        {/* Image Container */}
        <div className="w-full h-full flex items-center justify-center p-16 box-border">
          <img
            src={listing.images[selectedImageIndex]}
            alt={`${listing.title} - Slika ${selectedImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            style={{ 
              maxWidth: 'calc(100vw - 8rem)',
              maxHeight: 'calc(100vh - 8rem)',
              width: 'auto',
              height: 'auto'
            }}
            onLoad={(e) => {
              console.log('Full image loaded:', e.currentTarget.naturalWidth, 'x', e.currentTarget.naturalHeight);
            }}
            onError={(e) => {
              console.error('Full image failed to load:', e);
            }}
          />
        </div>

        {/* Image Counter */}
        {listing.images.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm font-medium z-20">
            {selectedImageIndex + 1} / {listing.images.length}
          </div>
        )}
      </div>
    </DialogContent>
  </Dialog>
)}
  </div>
  );
};

export default ListingDetailPage;