
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Globe, 
  MapPin,
  Bell,
  Lock,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface SettingsPageProps {
  loading: boolean;
  profile: any;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ loading, profile }) => {
  const [formData, setFormData] = useState({
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    companyName: profile?.company_name || '',
    website: profile?.website || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    zipCode: profile?.zip_code || '',
    country: profile?.country || 'us',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          company_name: formData.companyName,
          website: formData.website,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode,
          country: formData.country,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = () => {
    toast({
      title: "Password feature",
      description: "Password update functionality will be implemented soon.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-kargon-dark">Account Settings</h1>
        <Button 
          className="bg-kargon-red hover:bg-kargon-red/90"
          onClick={handleSaveProfile}
          disabled={savingProfile}
        >
          {savingProfile ? "Saving..." : "Save Changes"}
        </Button>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/2 space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input 
                      id="firstName" 
                      value={formData.firstName} 
                      onChange={handleInputChange}
                    />
                  )}
                </div>
                <div className="md:w-1/2 space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input 
                      id="lastName" 
                      value={formData.lastName} 
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    {loading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input 
                        id="email" 
                        value={formData.email} 
                        className="pl-10" 
                        disabled
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    {loading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input 
                        id="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange}
                        className="pl-10" 
                      />
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Update your company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    {loading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input 
                        id="companyName" 
                        value={formData.companyName} 
                        onChange={handleInputChange}
                        className="pl-10" 
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    {loading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input 
                        id="website" 
                        value={formData.website} 
                        onChange={handleInputChange}
                        className="pl-10" 
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    {loading ? (
                      <Skeleton className="h-10 w-full" />
                    ) : (
                      <Input 
                        id="address" 
                        value={formData.address} 
                        onChange={handleInputChange}
                        className="pl-10" 
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4">
                <div className="md:w-1/3 space-y-2">
                  <Label htmlFor="city">City</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input 
                      id="city" 
                      value={formData.city} 
                      onChange={handleInputChange}
                    />
                  )}
                </div>
                <div className="md:w-1/3 space-y-2">
                  <Label htmlFor="state">State</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input 
                      id="state" 
                      value={formData.state} 
                      onChange={handleInputChange}
                    />
                  )}
                </div>
                <div className="md:w-1/3 space-y-2">
                  <Label htmlFor="zipCode">Zip Code</Label>
                  {loading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input 
                      id="zipCode" 
                      value={formData.zipCode} 
                      onChange={handleInputChange}
                    />
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                {loading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select 
                    value={formData.country} 
                    onValueChange={(value) => handleSelectChange('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us">United States</SelectItem>
                      <SelectItem value="ca">Canada</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="au">Australia</SelectItem>
                      <SelectItem value="fr">France</SelectItem>
                      <SelectItem value="de">Germany</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Password Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Password Settings</CardTitle>
              <CardDescription>Update your password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="current-password" type="password" className="pl-10" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="new-password" type="password" className="pl-10" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input id="confirm-password" type="password" className="pl-10" />
                  </div>
                </div>
              </div>
              
              <Button className="mt-2" onClick={handleUpdatePassword}>Update Password</Button>
            </CardContent>
          </Card>
          
          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Email Notifications</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="shipment-updates">Shipment Updates</Label>
                    <p className="text-sm text-gray-500">Receive updates about your shipments</p>
                  </div>
                  <Switch id="shipment-updates" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="invoice-notifications">Invoice Notifications</Label>
                    <p className="text-sm text-gray-500">Receive notifications about new invoices</p>
                  </div>
                  <Switch id="invoice-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="document-updates">Document Updates</Label>
                    <p className="text-sm text-gray-500">Receive notifications about document updates</p>
                  </div>
                  <Switch id="document-updates" defaultChecked />
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Marketing Communications</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="newsletter">Newsletter</Label>
                    <p className="text-sm text-gray-500">Receive our monthly newsletter</p>
                  </div>
                  <Switch id="newsletter" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="promotions">Promotions</Label>
                    <p className="text-sm text-gray-500">Receive promotional offers and discounts</p>
                  </div>
                  <Switch id="promotions" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>This feature will be available soon.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-6 text-center text-gray-500">
                <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Team Management Coming Soon</h3>
                <p>
                  We're working on a new feature that will allow you to add team members 
                  and manage their permissions. Stay tuned for updates!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
