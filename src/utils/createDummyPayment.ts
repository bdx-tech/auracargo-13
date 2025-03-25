
import { supabase } from "@/integrations/supabase/client";

export const createDummyPayment = async (userId: string) => {
  try {
    // Check if there's already a pending payment
    const { data: existingPayments, error: checkError } = await supabase
      .from('payments')
      .select('id, amount')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .limit(1);
      
    if (checkError) throw checkError;
    
    // If a pending payment already exists, return it
    if (existingPayments && existingPayments.length > 0) {
      return { success: true, payment: existingPayments[0] };
    }
    
    // Get a random shipment to associate with the payment
    const { data: shipments, error: shipmentError } = await supabase
      .from('shipments')
      .select('id')
      .eq('user_id', userId)
      .limit(10);
      
    if (shipmentError) throw shipmentError;
    
    const randomShipment = shipments && shipments.length > 0 
      ? shipments[Math.floor(Math.random() * shipments.length)] 
      : null;
    
    // Create a new payment
    const amount = Math.floor(Math.random() * 900) + 100; // Random amount between 100 and 999
    
    const { data: payment, error } = await supabase
      .from('payments')
      .insert([{
        amount,
        payment_method: 'credit_card',
        status: 'pending',
        user_id: userId,
        shipment_id: randomShipment?.id || null,
        currency: 'USD'
      }])
      .select()
      .single();
      
    if (error) throw error;
    
    // Create a notification about the new invoice
    await supabase
      .functions
      .invoke('create-notification', {
        body: {
          title: "New Invoice Available",
          content: `You have a new invoice for $${amount.toFixed(2)} ready for payment.`,
          user_id: userId
        }
      });
    
    return { success: true, payment };
    
  } catch (error) {
    console.error('Error creating dummy payment:', error);
    return { success: false, error };
  }
};
