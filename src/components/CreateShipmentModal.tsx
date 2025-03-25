
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PaymentModal from "@/components/PaymentModal";

interface CreateShipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    weight: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Calculate shipping fee based on weight
  const calculateShippingFee = (): number => {
    const weight = parseFloat(formData.weight) || 0;
    return weight * 1000; // ₦1000 per kg
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    // Proceed to payment
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Generate a random tracking number
      const trackingNumber = `AUR${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Create the shipment in Supabase
      const { data, error } = await supabase
        .from('shipments')
        .insert([{
          origin: formData.origin,
          destination: formData.destination,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          status: 'Pending',
          tracking_number: trackingNumber,
          user_id: user.id,
          payment_status: 'paid'
        }])
        .select();
        
      if (error) throw error;
      
      // Create a notification about the new shipment
      await supabase
        .from('notifications')
        .insert([{
          title: "New Shipment Created",
          content: `Your shipment to ${formData.destination} has been created with tracking number ${trackingNumber} and is pending approval.`,
          user_id: user.id
        }]);
      
      toast({
        title: "Success!",
        description: "Your shipment has been created and is pending approval.",
      });
      
      // Reset form and close modal
      setFormData({
        origin: "",
        destination: "",
        weight: "",
      });
      
      onOpenChange(false);
      
      if (onSuccess) onSuccess();
      
      // Navigate to dashboard or shipment tracking page
      navigate(`/dashboard`);
      
    } catch (error: any) {
      console.error("Error creating shipment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create shipment. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Shipment</DialogTitle>
            <DialogDescription>
              Enter the shipment details below to create a new shipment. You'll need to complete payment before it's submitted.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitForm} className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origin Address</Label>
                <Input
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  placeholder="123 Main St, City, Country"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination">Destination Address</Label>
                <Input
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="456 Elm St, City, Country"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="10.5"
                  required
                />
              </div>
            </div>
            
            {formData.weight && (
              <div className="border rounded-md p-4 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <span className="font-medium">Shipping Cost</span>
                  </div>
                  <span className="font-bold">
                    ₦{calculateShippingFee().toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !formData.weight}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Payment Modal */}
      {showPaymentModal && user && (
        <PaymentModal
          open={showPaymentModal}
          onOpenChange={setShowPaymentModal}
          onSuccess={handlePaymentSuccess}
          amount={calculateShippingFee()}
          email={user.email || ''}
        />
      )}
    </>
  );
};

export default CreateShipmentModal;
