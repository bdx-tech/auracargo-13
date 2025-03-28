
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UpdateShipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: any;
  onSuccess?: () => void;
}

const UpdateShipmentModal: React.FC<UpdateShipmentModalProps> = ({
  open,
  onOpenChange,
  shipment,
  onSuccess,
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    status: shipment?.status || "Pending",
    current_location: shipment?.current_location || "",
    sender_name: shipment?.sender_name || "",
    sender_email: shipment?.sender_email || "",
    receiver_name: shipment?.receiver_name || "",
    receiver_email: shipment?.receiver_email || "",
    origin: shipment?.origin || "",
    destination: shipment?.destination || "",
    weight: shipment?.weight || "",
    physical_weight: shipment?.physical_weight || "",
    volume: shipment?.volume || "",
    term: shipment?.term || "",
    quantity: shipment?.quantity || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shipment) return;
    
    setLoading(true);
    
    try {
      const prevStatus = shipment.status;
      const isStatusChanged = prevStatus !== formData.status;
      
      // Update the shipment
      const { error } = await supabase
        .from('shipments')
        .update({
          status: formData.status,
          current_location: formData.current_location,
          sender_name: formData.sender_name,
          sender_email: formData.sender_email,
          receiver_name: formData.receiver_name,
          receiver_email: formData.receiver_email,
          origin: formData.origin,
          destination: formData.destination,
          weight: formData.weight ? parseFloat(formData.weight.toString()) : null,
          physical_weight: formData.physical_weight ? parseFloat(formData.physical_weight.toString()) : null,
          volume: formData.volume,
          term: formData.term,
          quantity: formData.quantity ? parseInt(formData.quantity.toString()) : null
        })
        .eq('id', shipment.id);
        
      if (error) throw error;
      
      // If status changed, create a tracking event
      if (isStatusChanged) {
        // Convert status to event_type format (lowercase with hyphens)
        const eventType = formData.status.toLowerCase().replace(' ', '-');
        
        await supabase
          .from('tracking_events')
          .insert({
            shipment_id: shipment.id,
            event_type: eventType,
            description: `Shipment status updated from ${prevStatus} to ${formData.status}`,
            location: formData.current_location || 'Processing Center'
          });
        
        // Send notification to user
        if (shipment.user_id) {
          await supabase
            .from('notifications')
            .insert({
              user_id: shipment.user_id,
              title: `Shipment ${formData.status}`,
              content: `Your shipment #${shipment.tracking_number} has been updated to ${formData.status}.`
            });
        }
      }
      
      toast({
        title: "Shipment Updated",
        description: "The shipment has been updated successfully."
      });
      
      if (onSuccess) onSuccess();
      onOpenChange(false);
      
    } catch (error: any) {
      console.error('Error updating shipment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update shipment."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Update Shipment</DialogTitle>
          <DialogDescription>
            Edit the shipment details below. The changes will be reflected immediately.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current_location">Current Location</Label>
              <Input
                id="current_location"
                name="current_location"
                value={formData.current_location}
                onChange={handleChange}
                placeholder="e.g., Lagos Distribution Center"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sender_name">Sender's Name</Label>
              <Input
                id="sender_name"
                name="sender_name"
                value={formData.sender_name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sender_email">Sender's Email</Label>
              <Input
                id="sender_email"
                name="sender_email"
                type="email"
                value={formData.sender_email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receiver_name">Receiver's Name</Label>
              <Input
                id="receiver_name"
                name="receiver_name"
                value={formData.receiver_name}
                onChange={handleChange}
                placeholder="Jane Doe"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="receiver_email">Receiver's Email</Label>
              <Input
                id="receiver_email"
                name="receiver_email"
                type="email"
                value={formData.receiver_email}
                onChange={handleChange}
                placeholder="jane@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="origin">Origin</Label>
              <Input
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="e.g., 123 Main St, Lagos"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="e.g., 456 Oak St, Abuja"
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
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="physical_weight">Physical Weight (kg)</Label>
              <Input
                id="physical_weight"
                name="physical_weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.physical_weight}
                onChange={handleChange}
                placeholder="9.8"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="volume">Volume</Label>
              <Input
                id="volume"
                name="volume"
                value={formData.volume}
                onChange={handleChange}
                placeholder="2x3x4 m³"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="term">Term</Label>
              <Input
                id="term"
                name="term"
                value={formData.term}
                onChange={handleChange}
                placeholder="Express/Standard/Economy"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateShipmentModal;
