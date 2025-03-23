
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Package, Eye, Pencil, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CreateShipmentModal from "@/components/CreateShipmentModal";
import { useToast } from "@/components/ui/use-toast";

interface Shipment {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  profiles: {
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const ShipmentsManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchShipments();
  }, []);
  
  const fetchShipments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          id,
          tracking_number,
          origin,
          destination,
          status,
          created_at,
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setShipments(data || []);
    } catch (err: any) {
      console.error('Error fetching shipments:', err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const filteredShipments = shipments.filter(shipment => 
    shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (shipment.profiles?.email && shipment.profiles.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Delivered": return "default";
      case "In Transit": return "secondary";
      case "Processing": return "secondary";
      case "Delayed": return "destructive";
      case "Pending": return "outline";
      case "Approved": return "success";
      default: return "outline";
    }
  };

  const getCustomerName = (shipment: Shipment) => {
    if (!shipment.profiles) return "Unknown";
    
    const firstName = shipment.profiles.first_name || "";
    const lastName = shipment.profiles.last_name || "";
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
    
    return shipment.profiles.email;
  };

  const handleShipmentCreated = () => {
    fetchShipments();
  };
  
  const handleApproveShipment = async (shipmentId: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: 'Approved' })
        .eq('id', shipmentId);
        
      if (error) throw error;
      
      // Create tracking event for approval
      await supabase
        .from('tracking_events')
        .insert({
          shipment_id: shipmentId,
          event_type: 'approved',
          description: 'Shipment has been approved',
          location: 'Processing Center'
        });
      
      // Create a notification for the user
      const { data: shipmentData } = await supabase
        .from('shipments')
        .select('user_id, tracking_number')
        .eq('id', shipmentId)
        .single();
        
      if (shipmentData?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: shipmentData.user_id,
            title: 'Shipment Approved',
            content: `Your shipment #${shipmentData.tracking_number} has been approved and is being processed.`
          });
      }
      
      toast({
        title: "Shipment Approved",
        description: "The shipment has been approved successfully."
      });
      
      fetchShipments();
    } catch (err: any) {
      console.error('Error approving shipment:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to approve shipment."
      });
    }
  };
  
  const handleRejectShipment = async (shipmentId: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: 'Rejected' })
        .eq('id', shipmentId);
        
      if (error) throw error;
      
      // Create tracking event for rejection
      await supabase
        .from('tracking_events')
        .insert({
          shipment_id: shipmentId,
          event_type: 'rejected',
          description: 'Shipment has been rejected',
          location: 'Processing Center'
        });
      
      // Create a notification for the user
      const { data: shipmentData } = await supabase
        .from('shipments')
        .select('user_id, tracking_number')
        .eq('id', shipmentId)
        .single();
        
      if (shipmentData?.user_id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: shipmentData.user_id,
            title: 'Shipment Rejected',
            content: `Your shipment #${shipmentData.tracking_number} has been rejected. Please contact customer service for more information.`
          });
      }
      
      toast({
        title: "Shipment Rejected",
        description: "The shipment has been rejected."
      });
      
      fetchShipments();
    } catch (err: any) {
      console.error('Error rejecting shipment:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to reject shipment."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shipments Management</h1>
        <p className="text-muted-foreground">Monitor and manage all shipments in the system</p>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search shipments..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Package className="mr-2 h-4 w-4" />
            New Shipment
          </Button>
        </div>
      </div>
      
      <div className="border rounded-md">
        {isLoading ? (
          <div className="p-8 text-center">Loading shipments...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">Error: {error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{shipment.tracking_number}</TableCell>
                    <TableCell>{getCustomerName(shipment)}</TableCell>
                    <TableCell>{shipment.origin}</TableCell>
                    <TableCell>{shipment.destination}</TableCell>
                    <TableCell>{new Date(shipment.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(shipment.status)}>
                        {shipment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Edit shipment"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {shipment.status === "Pending" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Approve shipment"
                              onClick={() => handleApproveShipment(shipment.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Reject shipment"
                              onClick={() => handleRejectShipment(shipment.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No shipments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <CreateShipmentModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
        onSuccess={handleShipmentCreated}
      />
    </div>
  );
};

export default ShipmentsManagement;
