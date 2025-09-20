import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, User } from "lucide-react";
import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Add error boundary for auth context
  let authContext;
  try {
    authContext = useAuthContext();
  } catch (error) {
    console.error('AuthContext error:', error);
    // Return a fallback navbar if auth context is not available
    return (
      <nav className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border shadow-custom-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.svg" alt="Parkiraj.me" className="h-6 w-6 rounded-md" />
            <span className="text-xl font-bold">Parkiraj.me</span>
          </Link>
            <div className="text-sm text-muted-foreground">
              Loading...
            </div>
          </div>
        </div>
      </nav>
    );
  }
  
  const { user, isAuthenticated, logout } = authContext;
  
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border shadow-custom-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 transition-smooth hover:opacity-80">
            <img src="/logo.svg" alt="Parkiraj.me" className="h-11 w-12 rounded-md" />
            <span className="text-xl font-bold text-foreground">Parkiraj.me</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/search" 
              className="text-muted-foreground hover:text-foreground transition-fast"
            >
              Pronađi parking
            </Link>
            <Link 
              to="/host" 
              className="text-muted-foreground hover:text-foreground transition-fast"
            >
              Iznajmi svoje mjesto
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm">
                    Kontrolna ploča
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <User className="h-4 w-4" />
                  {user?.first_name}
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Prijava
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="gradient-primary border-0 hover:opacity-90 transition-fast">
                    Registracija
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-slide-up">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/search" 
                className="text-muted-foreground hover:text-foreground py-2 transition-fast"
                onClick={() => setIsMenuOpen(false)}
              >
                Pronađi parking
              </Link>
              <Link 
                to="/host" 
                className="text-muted-foreground hover:text-foreground py-2 transition-fast"
                onClick={() => setIsMenuOpen(false)}
              >
                Iznajmi svoje mjesto
              </Link>
              
              <div className="pt-3 border-t border-border space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Kontrolna ploča
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={handleLogout}>
                      <User className="h-4 w-4 mr-2" />
                      Odjava ({user?.first_name})
                    </Button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        Prijava
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                      <Button size="sm" className="w-full gradient-primary border-0">
                        Registracija
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;