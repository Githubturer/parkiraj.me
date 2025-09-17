import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, Search, AlertCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center shadow-custom-lg border-border/50">
        <CardHeader className="pb-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground mb-2">
            404
          </CardTitle>
          <p className="text-xl text-muted-foreground">
            Ups! Stranica nije pronađena
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Parkirno mjesto koje tražite se čini kao da je odvezlo. 
            Vratimo vas na pravi put!
          </p>
          
          <div className="space-y-3">
            <Link to="/" className="w-full">
              <Button className="w-full gradient-primary border-0 text-white hover:opacity-90 transition-fast">
                <Home className="mr-2 h-4 w-4" />
                Vrati se na početak
              </Button>
            </Link>
            
            <Link to="/search" className="w-full">
              <Button variant="outline" className="w-full transition-fast">
                <Search className="mr-2 h-4 w-4" />
                Pronađi parking
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
