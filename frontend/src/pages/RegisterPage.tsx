import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Car, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuthContext();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Greška",
        description: "Lozinke se ne podudaraju",
        variant: "destructive",
      });
      return;
    }

    if (!agreeToTerms) {
      toast({
        title: "Greška",
        description: "Molimo prihvatite uvjete korištenja",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    const result = await register({
      email: formData.email,
      first_name: formData.firstName,
      last_name: formData.lastName,
      password: formData.password,
    });
    
    if (result.success) {
      navigate('/dashboard');
    }
    
      setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-8">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Parkiraj.me</span>
          </Link>
        </div>

        <Card className="shadow-custom-lg border-border/50">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Stvorite svoj račun</CardTitle>
            <CardDescription>
              Pridružite se tisućama vozača u potrazi za boljim parkiranjem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Ime</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="Marko"
                      value={formData.firstName}
                      onChange={handleInputChange("firstName")}
                      className="pl-10 h-12 transition-fast focus:ring-2 focus:ring-primary/20"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Prezime</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Marić"
                    value={formData.lastName}
                    onChange={handleInputChange("lastName")}
                    className="h-12 transition-fast focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="marko.maric@example.com"
                    value={formData.email}
                    onChange={handleInputChange("email")}
                    className="pl-10 h-12 transition-fast focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Lozinka</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Stvorite jaču lozinku"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    className="pl-10 pr-10 h-12 transition-fast focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Potvrdite svoju lozinku"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    className="pl-10 pr-10 h-12 transition-fast focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-fast"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="terms" 
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground">
                  Slažem se s{" "}
                  <Link to="/terms" className="text-primary hover:text-primary-hover transition-fast">
                    Uvjetima pružanja usluge
                  </Link>{" "}
                  i{" "}
                  <Link to="/privacy" className="text-primary hover:text-primary-hover transition-fast">
                    Politikom privatnosti
                  </Link>
                </Label>
              </div>

              {/* Sign Up Button */}
              <Button 
                type="submit" 
                className="w-full h-12 gradient-primary border-0 text-white font-semibold transition-smooth hover:opacity-90"
                disabled={isLoading || !agreeToTerms}
              >
                {isLoading ? "Stvaranje računa..." : "Stvori račun"}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Ili nastavite s</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <Button variant="outline" className="w-full h-12 transition-fast">
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Nastavite s Google
              </Button>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Već imate račun?{" "}
                <Link 
                  to="/login" 
                  className="font-medium text-primary hover:text-primary-hover transition-fast"
                >
                  Prijavite se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;