
import { useState, useEffect } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Truck, Loader } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttemptTime, setLoginAttemptTime] = useState<number | null>(null);
  const { signIn, user, isLoading: authLoading } = useAuth();
  const location = useLocation();

  // Clear error when inputs change
  useEffect(() => {
    if (error) setError("");
  }, [email, password]);

  // Track long-running login attempts
  useEffect(() => {
    if (isLoading && !loginAttemptTime) {
      setLoginAttemptTime(Date.now());
    }

    if (!isLoading) {
      setLoginAttemptTime(null);
    }

    // If login is taking too long, show a helpful message
    let timeoutId: number;
    if (isLoading && loginAttemptTime) {
      timeoutId = window.setTimeout(() => {
        if (isLoading) {
          setError("Login is taking longer than expected. Please try again.");
          setIsLoading(false);
        }
      }, 10000); // 10 second timeout
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, loginAttemptTime]);

  // If user is already logged in, redirect to dashboard
  if (user) {
    const from = location.state?.from?.pathname || "/dashboard";
    return <Navigate to={from} />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    console.log("Login attempt started");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }
    
    try {
      await signIn(email, password);
      console.log("Login successful");
    } catch (error: any) {
      console.error("Login error:", error.message);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="relative bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-8 w-full max-w-md border border-gray-200">
          <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
            <div className="h-10 w-10 bg-kargon-red rounded-full flex items-center justify-center">
              <Truck className="text-white" size={18} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6 mt-4 text-kargon-dark">Login to Your Account</h2>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {authLoading && (
            <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
              <AlertDescription>Initializing authentication...</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-sm text-kargon-red hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-kargon-red hover:bg-kargon-red/90 text-white"
              disabled={isLoading || authLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  LOGGING IN...
                </span>
              ) : "LOGIN"}
            </Button>
            
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <Link to="/signup" className="text-kargon-red hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
