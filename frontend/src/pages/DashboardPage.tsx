import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useListings } from "@/hooks/useListings";
import { useBookings } from "@/hooks/useBookings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ListingCard from "@/components/ListingCard";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Car, 
  Calendar, 
  MapPin, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle 
} from "lucide-react";

const DashboardPage = () => {
  const { user, getToken } = useAuthContext();
  const token = getToken();
  
  const { listings, isLoading: listingsLoading } = useListings();
  const { bookings, rents, isLoading: bookingsLoading, updateBookingStatus } = useBookings(token);
  
  const [updatingBooking, setUpdatingBooking] = useState<number | null>(null);

  const userListings = listings.filter(listing => listing.owner_id === user?.id);

  const handleBookingStatusUpdate = async (bookingId: number, status: 'confirmed' | 'declined') => {
    setUpdatingBooking(bookingId);
    await updateBookingStatus(bookingId, { status });
    setUpdatingBooking(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-warning"><Clock className="w-3 h-3 mr-1" />Na čekanju</Badge>;
      case 'confirmed':
        return <Badge variant="outline" className="text-success"><CheckCircle className="w-3 h-3 mr-1" />Potvrđeno</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-destructive"><XCircle className="w-3 h-3 mr-1" />Odbijeno</Badge>;
      case 'completed':
        return <Badge variant="outline" className="text-primary"><CheckCircle className="w-3 h-3 mr-1" />Završeno</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Molimo prijavite se za pristup kontrolnoj ploči</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Dobrodošli, {user.first_name}!
          </h1>
          <p className="text-muted-foreground">
            Upravljajte svojim oglasima i rezervacijama
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moji oglasi</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userListings.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Moje rezervacije</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Zahtjevi za najam</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rents.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Na čekanju</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rents.filter(rent => rent.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="listings">Moji oglasi</TabsTrigger>
            <TabsTrigger value="bookings">Moje rezervacije</TabsTrigger>
            <TabsTrigger value="rents">Zahtjevi za najam</TabsTrigger>
          </TabsList>

          {/* My Listings */}
          <TabsContent value="listings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Moji oglasi</h2>
              <Button className="gradient-primary border-0 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj novi oglas
              </Button>
            </div>

            {listingsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <Card key={index}>
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : userListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    id={String(listing.id)}
                    title={listing.title}
                    address={listing.address}
                    city={listing.city}
                    pricePerHour={listing.price_per_hour}
                    pricePerDay={listing.price_per_day}
                    rating={4.5}
                    reviewCount={12}
                    vehicleTypes={listing.vehicle_types}
                    isLongTerm={listing.is_long_term}
                    isShortTerm={listing.is_short_term}
                    features={[]}
                  />
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nemate objavljenih oglasa</h3>
                  <p className="text-muted-foreground mb-4">
                    Počnite zarađivati iznajmljivanjem svojeg parkirnog mjesta
                  </p>
                  <Button className="gradient-primary border-0 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj prvi oglas
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Bookings */}
          <TabsContent value="bookings" className="space-y-6">
            <h2 className="text-2xl font-bold">Moje rezervacije</h2>

            {bookingsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Rezervacija #{booking.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium">${booking.total_price}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nemate rezervacija</h3>
                  <p className="text-muted-foreground">
                    Rezervirajte parkirno mjesto kada ga trebate
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Rental Requests */}
          <TabsContent value="rents" className="space-y-6">
            <h2 className="text-2xl font-bold">Zahtjevi za najam</h2>

            {bookingsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <div className="flex space-x-2">
                          <Skeleton className="h-8 w-20" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : rents.length > 0 ? (
              <div className="space-y-4">
                {rents.map((rent) => (
                  <Card key={rent.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">Zahtjev #{rent.id}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(rent.start_date).toLocaleDateString()} - {new Date(rent.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-sm font-medium">${rent.total_price}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(rent.status)}
                          {rent.status === 'pending' && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success border-success hover:bg-success hover:text-white"
                                onClick={() => handleBookingStatusUpdate(rent.id, 'confirmed')}
                                disabled={updatingBooking === rent.id}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Potvrdi
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive hover:bg-destructive hover:text-white"
                                onClick={() => handleBookingStatusUpdate(rent.id, 'declined')}
                                disabled={updatingBooking === rent.id}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Odbij
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <Car className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nema zahtjeva za najam</h3>
                  <p className="text-muted-foreground">
                    Zahtjevi će se pojaviti kada netko rezervira vaše parkirno mjesto
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;