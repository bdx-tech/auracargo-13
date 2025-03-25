
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get('PAYSTACK_SECRET_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!PAYSTACK_SECRET_KEY || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Required environment variables are not set');
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { reference, userId, shipmentId } = await req.json();

    if (!reference) {
      throw new Error('Payment reference is required');
    }

    // Verify payment with Paystack
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const verifyData = await verifyResponse.json();
    console.log('Paystack verification response:', verifyData);

    if (!verifyResponse.ok) {
      throw new Error(`Failed to verify payment: ${verifyData.message}`);
    }

    // If payment verification is successful, store payment in database
    if (verifyData.status && verifyData.data.status === 'success') {
      const { data: paymentData, error: paymentError } = await supabase
        .from('payments')
        .insert([
          {
            amount: verifyData.data.amount / 100, // Convert from kobo to naira
            payment_method: 'Paystack',
            status: 'Completed',
            shipment_id: shipmentId,
            user_id: userId,
            transaction_id: reference,
            payment_provider: 'paystack',
            payment_reference: reference,
            currency: 'NGN'
          }
        ]);
      
      if (paymentError) {
        console.error('Error storing payment:', paymentError);
        throw new Error(`Failed to store payment information: ${paymentError.message}`);
      }

      console.log('Payment stored successfully:', paymentData);
    }

    return new Response(
      JSON.stringify(verifyData),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Payment verification error:', error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
