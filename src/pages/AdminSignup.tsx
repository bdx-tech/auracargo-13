
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

// This should be stored in environment variables in a production environment
// For this demo, we'll hardcode it
const ADMIN_SECRET_CODE = "AuraCargo2025";

const AdminSignup: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    secretCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate secret code
      if (formData.secretCode !== ADMIN_SECRET_CODE) {
        toast({
          title: "Invalid Secret Code",
          description: "The admin secret code provided is incorrect.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Password Mismatch",
          description: "The passwords you entered do not match.",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Register the user with Supabase
      const { data, error } = await signUp(formData.email, formData.password);
      
      if (error) {
        throw error;
      }

      if (data?.user) {
        // Set the user as admin in the profiles table
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: formData.name,
            is_admin: true 
          })
          .eq('id', data.user.id);

        if (profileError) {
          throw profileError;
        }

        toast({
          title: "Admin Account Created",
          description: "Your admin account has been created successfully. Please check your email to verify your account.",
        });
        
        navigate('/login');
      }
    } catch (error: any) {
      console.error("Error creating admin user:", error);
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create admin account.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Registration</CardTitle>
          <CardDescription className="text-center">
            Create a new admin account for AuraCargo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                name="name" 
                placeholder="Enter your full name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="admin@example.com" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                value={formData.password} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input 
                id="confirmPassword" 
                name="confirmPassword" 
                type="password" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secretCode">Admin Secret Code</Label>
              <Input 
                id="secretCode" 
                name="secretCode" 
                type="password" 
                placeholder="Enter the admin secret code"
                value={formData.secretCode} 
                onChange={handleChange} 
                required 
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating Account..." : "Create Admin Account"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminSignup;
