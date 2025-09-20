import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useListings } from "@/hooks/useListings";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { MapPin, Car, Clock, Euro, X, Upload, Image as ImageIcon } from "lucide-react";

const createListingSchema = z.object({
  title: z.string().min(5, "Naslov mora imati najmanje 5 znakova"),
  description: z.string().optional(),
  address: z.string().min(5, "Adresa mora imati najmanje 5 znakova"),
  place: z.string().min(2, "Mjesto mora imati najmanje 2 znaka"),
  city: z.string().min(2, "Grad mora imati najmanje 2 znaka"),    
  state: z.string().min(2, "Županija mora imati najmanje 2 znaka"),
  country: z.string().min(2, "Zemlja mora imati najmanje 2 znaka"),
  zip_code: z.string().min(3, "Poštanski broj mora imati najmanje 3 znaka"),
  price_per_day: z.number().min(1, "Cijena po danu mora biti veća od 0"),
  price_per_hour: z.number().min(0.1, "Cijena po satu mora biti veća od 0"),
  vehicle_types: z.array(z.string()).min(1, "Odaberite najmanje jedan tip vozila"),
  is_long_term: z.boolean().default(false),
  is_short_term: z.boolean().default(true),
});

type CreateListingFormData = z.infer<typeof createListingSchema>;

const vehicleTypeOptions = [
  { value: "car", label: "Automobil" },
  { value: "suv", label: "SUV" },
  { value: "van", label: "Kombi" },
  { value: "truck", label: "Kamion" },
  { value: "motorcycle", label: "Motocikl" },
  { value: "bicycle", label: "Bicikl" },
];

interface CreateListingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateListingForm = ({ onSuccess, onCancel }: CreateListingFormProps) => {
  const navigate = useNavigate();
  const { getToken } = useAuthContext();
  const { createListing, fetchListings } = useListings();
  const [selectedVehicleTypes, setSelectedVehicleTypes] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize selectedVehicleTypes from form default values
  useEffect(() => {
    const formVehicleTypes = form.getValues("vehicle_types");
    if (Array.isArray(formVehicleTypes)) {
      setSelectedVehicleTypes(formVehicleTypes);
    }
  }, []);

  const form = useForm<CreateListingFormData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      address: "",
      place: "",
      city: "",
      state: "",
      country: "Hrvatska",
      zip_code: "",
      price_per_day: 0,
      price_per_hour: 0,
      vehicle_types: [],
      is_long_term: false,
      is_short_term: true,
    },
  });


  const handleVehicleTypeToggle = (vehicleType: string) => {
    const updatedTypes = selectedVehicleTypes.includes(vehicleType)
      ? selectedVehicleTypes.filter(type => type !== vehicleType)
      : [...selectedVehicleTypes, vehicleType];
    
    setSelectedVehicleTypes(updatedTypes);
    form.setValue("vehicle_types", updatedTypes, { shouldValidate: true });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast({
            title: "Greška",
            description: `Slika ${file.name} je prevelika. Maksimalna veličina je 5MB.`,
            variant: "destructive",
          });
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log('Image uploaded:', file.name, 'Size:', file.size, 'Type:', file.type);
          setImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CreateListingFormData) => {
    console.log("=== FORM SUBMIT STARTED ===");
    console.log("Form submitted with data:", data);
    console.log("Form validation errors:", form.formState.errors);
    
    const token = getToken();
    console.log("Token retrieved:", token ? "EXISTS" : "NULL");
    
    if (!token) {
      console.log("No token found - redirecting to login");
      toast({
        title: "Greška",
        description: "Molimo prijavite se za dodavanje oglasa",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    console.log("Token found, starting submission");
    setIsSubmitting(true);
    
    try {
      console.log("Calling createListing with token and data...");
      const listingData = {
        ...data,
        price_per_day: Number(data.price_per_day),
        price_per_hour: Number(data.price_per_hour),
        images: images, // Dodajmo slike u podatke
      };
      const result = await createListing(token, listingData);
      console.log("Create listing result:", result);

      if (result.success) {
        console.log("Listing created successfully!");
        toast({
          title: "Uspješno objavljeno",
          description: "Vaš oglas je uspješno objavljen!",
        });
        onSuccess?.();
        // Refresh listings before redirect
        await fetchListings();
        navigate('/dashboard');
      } else {
        console.log("Create listing failed:", result.error);
        toast({
          title: "Greška",
          description: result.error || "Greška pri objavljivanju oglasa",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      console.error("Error details:", error);
      toast({
        title: "Greška",
        description: "Neočekivana greška pri objavljivanju oglasa",
        variant: "destructive",
      });
    } finally {
      console.log("=== FORM SUBMIT FINISHED ===");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          Dodaj novi oglas
        </CardTitle>
        <CardDescription>
          Objavite svoje parkirno mjesto i počnite zarađivati
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={(e) => {
            console.log("Form submit event triggered");
            console.log("Form errors:", form.formState.errors);
            console.log("Form values:", form.getValues());
            form.handleSubmit(onSubmit)(e);
          }} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Osnovne informacije</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naslov oglasa</FormLabel>
                    <FormControl>
                      <Input placeholder="npr. Sigurno parkirno mjesto u centru" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis (opcionalno)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Opišite svoje parkirno mjesto, značajke, pristup..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Lokacija</h3>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Ulica i broj" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="place"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Naselje</FormLabel>
                      <FormControl>
                        <Input placeholder="npr. Trnje" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grad</FormLabel>
                      <FormControl>
                        <Input placeholder="Zagreb" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Poštanski broj</FormLabel>
                      <FormControl>
                        <Input placeholder="10000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Županija</FormLabel>
                      <FormControl>
                        <Input placeholder="Grad Zagreb" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zemlja</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Euro className="h-5 w-5 mr-2 text-primary" />
                Cijena
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price_per_hour"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cijena po satu (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          min="0.1"
                          placeholder="2.50"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_per_day"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cijena po danu (€)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="1" 
                          min="1"
                          placeholder="20"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Vehicle Types */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Car className="h-5 w-5 mr-2 text-primary" />
                Tipovi vozila
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vehicleTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`p-3 border rounded-lg transition-colors text-left ${
                      selectedVehicleTypes.includes(option.value)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handleVehicleTypeToggle(option.value)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                        selectedVehicleTypes.includes(option.value)
                          ? 'border-primary bg-primary'
                          : 'border-gray-300'
                      }`}>
                        {selectedVehicleTypes.includes(option.value) && (
                          <div className="w-2 h-2 bg-white rounded-sm" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>

              
              {form.formState.errors.vehicle_types && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.vehicle_types.message}
                </p>
              )}
            </div>

            {/* Rental Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Opcije najma
              </h3>
              
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="is_short_term"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Kratkoročni najam</FormLabel>
                        <FormDescription>
                          Omogući rezervacije po satima i danima
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_long_term"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Dugoročni najam</FormLabel>
                        <FormDescription>
                          Omogući rezervacije na tjedne i mjesece
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-primary" />
                Slike
              </h3>
              
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Dodaj slike
                </Button>
                
                {images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={image}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="submit"
                className="flex-1 gradient-primary border-0 text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Objavljujem..." : "Objavi oglas"}
              </Button>
              
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Odustani
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CreateListingForm;