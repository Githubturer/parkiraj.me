import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SearchBar from "@/components/SearchBar";
import { Shield, MapPin, CreditCard, Clock, Star, Users } from "lucide-react";
import heroImage from "@/assets/hero-parking.jpg";

const HomePage = () => {
  const handleSearch = (searchData: any) => {
    // TODO: Navigate to search results
    console.log("Search initiated:", searchData);
  };

  const features = [
    {
      icon: Shield,
      title: "Sigurno i pouzdano",
      description: "Sva parkirna mjesta su provjerena i sigurna s nadzorom 24/7"
    },
    {
      icon: MapPin,
      title: "Odlične lokacije",
      description: "Pronađite parking na najpristupačnijim lokacijama blizu vašeg odredišta"
    },
    {
      icon: CreditCard,
      title: "Jednostavno plaćanje",
      description: "Sigurno plaćanje s trenutačnom potvrdom rezervacije"
    },
    {
      icon: Clock,
      title: "Fleksibilni sati",
      description: "Rezervirajte na sate, dane ili dugoročna parkirna rješenja"
    }
  ];

  const stats = [
    { value: "10.000+", label: "Parkirna mjesta" },
    { value: "50+", label: "Gradova" },
    { value: "25.000+", label: "Zadovoljnih kupaca" },
    { value: "4,8", label: "Prosječna ocjena" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="relative min-h-[90vh] flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-secondary/70" />
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Pronađite savršeno
              <br />
              <span className="gradient-secondary bg-clip-text text-transparent">
                parkirno mjesto
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto">
              Otkrijte i rezervirajte sigurna parkirna mjesta na odličnim lokacijama. 
              Od satnog do mjesečnog najma, mi ćemo vam omogućiti.
            </p>
          </div>
          
          <div className="animate-slide-up">
            <SearchBar variant="hero" onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Zašto odabrati Parkiraj.me?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Činimo parkiranje jednostavnim, sigurnim i pristupačnim za sve
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-border/50 shadow-custom-sm hover:shadow-custom-md transition-smooth">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Spremni za pametniji pristup parkiranju?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Pridružite se tisućama vozača koji vjeruju Parkiraj.me za svoje parkirne potrebe
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Users className="mr-2 h-5 w-5" />
                Pronađi parking sada
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20">
                <MapPin className="mr-2 h-5 w-5" />
                Iznajmi svoje mjesto
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-1 text-warning">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 fill-current" />
              ))}
            </div>
            <span className="ml-3 text-xl font-semibold text-foreground">4,8 od 5</span>
          </div>
          <p className="text-lg text-muted-foreground">
            Pouzdano od strane više od 25.000 vozača diljem svijeta
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;