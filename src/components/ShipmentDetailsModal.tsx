
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { 
  Package, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Weight, 
  Box,
  Mail,
  Hash,
  Truck
} from "lucide-react";

interface ShipmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: any;
}

const ShipmentDetailsModal: React.FC<ShipmentDetailsModalProps> = ({
  open,
  onOpenChange,
  shipment
}) => {
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && shipment) {
      fetchTrackingEvents();
    }
  }, [open, shipment?.id]);

  const fetchTrackingEvents = async () => {
    if (!shipment) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracking_events')
        .select('*')
        .eq('shipment_id', shipment.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setTrackingEvents(data || []);
    } catch (err) {
      console.error('Error fetching tracking events:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered": return "bg-green-100 text-green-800";
      case "In Transit": return "bg-blue-100 text-blue-800";
      case "Processing": 
      case "Approved": return "bg-purple-100 text-purple-800";
      case "Pending": return "bg-yellow-100 text-yellow-800";
      case "Delayed": return "bg-orange-100 text-orange-800";
      case "Rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (!shipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipment Details
          </DialogTitle>
          <DialogDescription>
            Complete information about shipment #{shipment.tracking_number}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <Badge className={`mt-1 ${getStatusColor(shipment.status)}`}>
                {shipment.status}
              </Badge>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Tracking Number</h3>
              <div className="flex items-center gap-2 mt-1">
                <Hash className="h-4 w-4 text-gray-500" />
                <span>{shipment.tracking_number}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Created Date</h3>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{format(new Date(shipment.created_at), 'PPP')}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Sender Information</h3>
              <div className="space-y-1 mt-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{shipment.sender_name || "N/A"}</span>
                </div>
                {shipment.sender_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{shipment.sender_email}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Origin</h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{shipment.origin}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Current Location</h3>
              <div className="flex items-center gap-2 mt-1">
                <Truck className="h-4 w-4 text-gray-500" />
                <span>{shipment.current_location || "Not assigned"}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Receiver Information</h3>
              <div className="space-y-1 mt-1">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{shipment.receiver_name || "N/A"}</span>
                </div>
                {shipment.receiver_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{shipment.receiver_email}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Destination</h3>
              <div className="flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{shipment.destination}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Package Details</h3>
              <div className="space-y-1 mt-1">
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-gray-500" />
                  <span>Weight: {shipment.weight || "0"} kg</span>
                </div>
                {shipment.physical_weight && (
                  <div className="flex items-center gap-2">
                    <Weight className="h-4 w-4 text-gray-500" />
                    <span>Physical Weight: {shipment.physical_weight} kg</span>
                  </div>
                )}
                {shipment.volume && (
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-gray-500" />
                    <span>Volume: {shipment.volume}</span>
                  </div>
                )}
                {shipment.quantity && (
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-gray-500" />
                    <span>Quantity: {shipment.quantity}</span>
                  </div>
                )}
                {shipment.term && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Term: {shipment.term}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-3">Tracking History</h3>
          
          {loading ? (
            <div className="text-center py-4">Loading tracking events...</div>
          ) : trackingEvents.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {trackingEvents.map((event) => (
                <div key={event.id} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <span className="font-medium capitalize">{event.event_type.replace(/-/g, ' ')}</span>
                    <span className="text-sm text-gray-500">{format(new Date(event.created_at), 'MMM dd, yyyy HH:mm')}</span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {event.location && <div>Location: {event.location}</div>}
                    {event.description && <div className="mt-1">{event.description}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">No tracking events found</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShipmentDetailsModal;
