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
import { 
  Search, 
  Filter, 
  Package, 
  Eye, 
  Pencil, 
  CheckCircle, 
  XCircle,
  Map
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import CreateShipmentModal from "@/components/CreateShipmentModal";
import { useToast } from "@/components/ui/use-toast";
import ShipmentDetailsModal from "@/components/ShipmentDetailsModal";
import UpdateShipmentModal from "@/components/UpdateShipmentModal";

interface Shipment {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  current_location: string | null;
  sender_name: string | null;
  sender_email: string | null;
  receiver_name: string | null;
  receiver_email: string | null;
  weight: number | null;
  volume: string | null;
  term: string | null;
  physical_weight: number | null;
  quantity: number | null;
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
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
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
          current_location,
          sender_name,
          sender_email,
          receiver_name,
          receiver_email,
          weight,
          volume,
          term,
          physical_weight,
          quantity,
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
    (shipment.profiles?.email && shipment.profiles.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (shipment.sender_name && shipment.sender_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (shipment.receiver_name && shipment.receiver_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered": return "default";
      case "in transit": return "secondary";
      case "on hold": return "outline";
      case "processing": return "secondary";
      case "delayed": return "destructive";
      case "pending": return "outline";
      case "approved": return "secondary";
      default: return "outline";
    }
  };

  const getCustomerName = (shipment: Shipment) => {
    if (shipment.sender_name) return shipment.sender_name;
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
      
      await supabase
        .from('tracking_events')
        .insert({
          shipment_id: shipmentId,
          event_type: 'approved',
          description: 'Shipment has been approved',
          location: 'Processing Center'
        });
      
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
      
      await supabase
        .from('tracking_events')
        .insert({
          shipment_id: shipmentId,
          event_type: 'rejected',
          description: 'Shipment has been rejected',
          location: 'Processing Center'
        });
      
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

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ status: newStatus })
        .eq('id', shipmentId);
        
      if (error) throw error;
      
      const eventType = newStatus.toLowerCase().replace(' ', '-');
      
      await supabase
        .from('tracking_events')
        .insert({
          shipment_id: shipmentId,
          event_type: eventType,
          description: `Shipment status updated to ${newStatus}`,
          location: 'Processing Center'
        });
      
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
            title: `Shipment ${newStatus}`,
            content: `Your shipment #${shipmentData.tracking_number} has been updated to ${newStatus}.`
          });
      }
      
      toast({
        title: "Status Updated",
        description: `The shipment has been updated to ${newStatus}.`
      });
      
      fetchShipments();
    } catch (err: any) {
      console.error('Error updating shipment status:', err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to update shipment status."
      });
    }
  };

  const handleViewDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowDetailsModal(true);
  };

  const handleEdit = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowUpdateModal(true);
  };

  const handleShipmentUpdated = () => {
    fetchShipments();
    setShowUpdateModal(false);
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
                <TableHead>Receiver</TableHead>
                <TableHead>Origin</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Current Location</TableHead>
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
                    <TableCell>{shipment.receiver_name || "N/A"}</TableCell>
                    <TableCell>{shipment.origin}</TableCell>
                    <TableCell>{shipment.destination}</TableCell>
                    <TableCell>{shipment.current_location || "Not assigned"}</TableCell>
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
                          onClick={() => handleViewDetails(shipment)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          title="Edit shipment"
                          onClick={() => handleEdit(shipment)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        {shipment.status !== "In Transit" && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            title="Set to In Transit"
                            onClick={() => handleUpdateStatus(shipment.id, "In Transit")}
                          >
                            <Map className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {shipment.status !== "On Hold" && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                            title="Put On Hold"
                            onClick={() => handleUpdateStatus(shipment.id, "On Hold")}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {shipment.status !== "Delivered" && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Mark as Delivered"
                            onClick={() => handleUpdateStatus(shipment.id, "Delivered")}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
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

      {selectedShipment && (
        <>
          <ShipmentDetailsModal
            open={showDetailsModal}
            onOpenChange={setShowDetailsModal}
            shipment={selectedShipment}
          />
          <UpdateShipmentModal
            open={showUpdateModal}
            onOpenChange={setShowUpdateModal}
            shipment={selectedShipment}
            onSuccess={handleShipmentUpdated}
          />
        </>
      )}
    </div>
  );
};

export default ShipmentsManagement;
