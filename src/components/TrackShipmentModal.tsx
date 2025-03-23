
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Package, MapPin, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface TrackShipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TrackShipmentModal: React.FC<TrackShipmentModalProps> = ({
  open,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<any>(null);
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
  const [showEvents, setShowEvents] = useState(false);

  const handleSearch = async () => {
    if (!trackingNumber.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a tracking number",
      });
      return;
    }
    
    setLoading(true);
    setShowEvents(false);
    
    try {
      // Fetch shipment details
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', trackingNumber)
        .single();
      
      if (shipmentError) throw shipmentError;
      
      setShipment(shipmentData);
      
      // Fetch tracking events for the shipment
      const { data: eventsData, error: eventsError } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('created_at', { ascending: false });
      
      if (eventsError) throw eventsError;
      
      setTrackingEvents(eventsData || []);
      setShowEvents(true);
      
    } catch (error: any) {
      console.error("Error tracking shipment:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message === 'The query returned no results' ? 
          "No shipment found with that tracking number" : 
          error.message || "Failed to track shipment",
      });
      setShipment(null);
      setTrackingEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in-transit':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Track Your Shipment</DialogTitle>
          <DialogDescription>
            Enter your tracking number to see the status of your shipment.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter tracking number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Track"}
            </Button>
          </div>
          
          {showEvents && shipment && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Shipment Details</h3>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(shipment.status)}
                    <span className="capitalize">{shipment.status}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Tracking Number:</div>
                  <div>{shipment.tracking_number}</div>
                  
                  <div className="text-muted-foreground">Origin:</div>
                  <div>{shipment.origin}</div>
                  
                  <div className="text-muted-foreground">Destination:</div>
                  <div>{shipment.destination}</div>
                  
                  <div className="text-muted-foreground">Ship Date:</div>
                  <div>{format(new Date(shipment.created_at), 'MMM dd, yyyy')}</div>
                  
                  {shipment.estimated_delivery && (
                    <>
                      <div className="text-muted-foreground">Estimated Delivery:</div>
                      <div>{format(new Date(shipment.estimated_delivery), 'MMM dd, yyyy')}</div>
                    </>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Tracking History</h3>
                
                {trackingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {trackingEvents.map((event, index) => (
                      <div key={event.id} className="relative pl-6 pb-4">
                        {index < trackingEvents.length - 1 && (
                          <div className="absolute top-0 left-[10px] w-[1px] h-full bg-gray-200"></div>
                        )}
                        <div className="absolute top-0 left-0 rounded-full w-5 h-5 bg-blue-100 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium">{event.event_type}</div>
                          <div className="text-muted-foreground">{event.location || 'Unknown location'}</div>
                          <div className="text-muted-foreground text-xs">{format(new Date(event.created_at), 'MMM dd, yyyy h:mm a')}</div>
                          {event.description && <div className="mt-1">{event.description}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    No tracking updates available yet
                  </div>
                )}
              </div>
            </div>
          )}
          
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TrackShipmentModal;
