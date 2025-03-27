
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Truck, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, user, isLoading: authLoading } = useAuth();

  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" />;
  }

  // Show inline loader instead of full-page loader during auth process
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        
        <div className="flex-grow flex items-center justify-center py-20">
          <div className="relative bg-white/90 backdrop-blur-sm shadow-lg rounded-lg p-8 w-full max-w-md border border-gray-200">
            <div className="flex flex-col items-center justify-center py-6">
              <Loader2 className="h-12 w-12 text-kargon-red animate-spin mb-4" />
              <h2 className="text-xl font-medium">Authenticating...</h2>
              <p className="text-gray-500 mt-2 text-center">
                Please wait while we log you in to your account
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsLoading(false);
      return;
    }
    
    try {
      await signIn(email, password);
    } catch (error: any) {
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
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  LOGGING IN...
                </div>
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
