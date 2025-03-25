
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const createDummyData = async (userId: string) => {
  try {
    // Check if user already has data
    const { data: existingShipments } = await supabase
      .from('shipments')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (existingShipments && existingShipments.length > 0) {
      console.log("User already has data, skipping dummy data creation");
      return;
    }
    
    console.log("Creating dummy data for new user");
    
    // Sample shipment data
    const shipmentData = [
      {
        user_id: userId,
        tracking_number: `SH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        origin: "New York, USA",
        destination: "London, UK",
        status: "in-transit",
        service_type: "Express",
        weight: 15.5,
        dimensions: "30x40x20 cm"
      },
      {
        user_id: userId,
        tracking_number: `SH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        origin: "Berlin, Germany",
        destination: "Paris, France",
        status: "delivered",
        service_type: "Standard",
        weight: 8.2,
        dimensions: "20x30x15 cm"
      },
      {
        user_id: userId,
        tracking_number: `SH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        origin: "Tokyo, Japan",
        destination: "Seoul, South Korea",
        status: "pending",
        service_type: "Economy",
        weight: 5.7,
        dimensions: "15x20x10 cm"
      }
    ];
    
    // Insert shipments
    const { data: shipments, error: shipmentError } = await supabase
      .from('shipments')
      .insert(shipmentData)
      .select();
      
    if (shipmentError) throw shipmentError;
    
    // Create document data based on shipments
    if (shipments) {
      const documentData = shipments.map(shipment => ({
        user_id: userId,
        shipment_id: shipment.id,
        name: `${shipment.destination.split(',')[0]} Shipping Documents`,
        document_type: ['invoice', 'packing_list', 'customs_declaration'][Math.floor(Math.random() * 3)],
        file_path: `documents/${userId}/${shipment.id}/${Math.random().toString(36).substring(2, 8)}.pdf`
      }));
      
      // Insert documents
      const { error: documentError } = await supabase
        .from('documents')
        .insert(documentData);
        
      if (documentError) throw documentError;
      
      // Create payment data
      const paymentData = shipments.map(shipment => ({
        user_id: userId,
        shipment_id: shipment.id,
        amount: Math.floor(Math.random() * 1000) + 500,
        currency: "USD",
        payment_method: ['credit_card', 'bank_transfer', 'paypal'][Math.floor(Math.random() * 3)],
        status: ['paid', 'pending', 'overdue'][Math.floor(Math.random() * 3)]
      }));
      
      // Insert payments
      const { error: paymentError } = await supabase
        .from('payments')
        .insert(paymentData);
        
      if (paymentError) throw paymentError;
    }
    
    // Create notifications
    const notificationData = [
      {
        user_id: userId,
        title: "Welcome to Auracargo!",
        content: "Thank you for joining Auracargo. Explore your dashboard to get started.",
        is_read: false
      },
      {
        user_id: userId,
        title: "Your first shipment is ready",
        content: "We've created some sample data for you to explore the platform features.",
        is_read: false
      },
      {
        user_id: userId,
        title: "Complete your profile",
        content: "Update your profile information in the settings tab for a better experience.",
        is_read: false
      }
    ];
    
    // Insert notifications
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notificationData);
      
    if (notificationError) throw notificationError;
    
    console.log("Dummy data created successfully");
    
    return true;
  } catch (error) {
    console.error("Error creating dummy data:", error);
    return false;
  }
};

export const useCreateDummyData = () => {
  const { toast } = useToast();
  
  const createData = async (userId: string) => {
    try {
      const result = await createDummyData(userId);
      if (result) {
        toast({
          title: "Demo data created",
          description: "Sample data has been added to your account",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error creating demo data",
        description: error.message,
      });
    }
  };
  
  return { createData };
};
