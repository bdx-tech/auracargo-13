
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error('PAYSTACK_SECRET_KEY is not set');
    }

    const { reference } = await req.json();

    if (!reference) {
      throw new Error('Payment reference is required');
    }

    console.log('Verifying payment with reference:', reference);

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

    // Enhanced logging with more payment details
    if (verifyData.status && verifyData.data) {
      console.log('Payment details:', {
        amount: verifyData.data.amount / 100, // Convert from kobo to naira
        currency: verifyData.data.currency,
        transaction_date: verifyData.data.transaction_date,
        status: verifyData.data.status,
        reference: verifyData.data.reference,
        authorization: {
          authorization_code: verifyData.data.authorization?.authorization_code,
          card_type: verifyData.data.authorization?.card_type,
          bank: verifyData.data.authorization?.bank,
          last4: verifyData.data.authorization?.last4,
          exp_month: verifyData.data.authorization?.exp_month,
          exp_year: verifyData.data.authorization?.exp_year,
          channel: verifyData.data.authorization?.channel,
          reusable: verifyData.data.authorization?.reusable,
        },
        customer: {
          id: verifyData.data.customer?.id,
          first_name: verifyData.data.customer?.first_name,
          last_name: verifyData.data.customer?.last_name,
          email: verifyData.data.customer?.email,
          phone: verifyData.data.customer?.phone,
        },
        metadata: verifyData.data.metadata
      });
      
      // Update database if the payment is successful
      if (verifyData.data.status === 'success') {
        // Note: In an edge function, we can't directly update the database
        // The calling code should handle this based on the returned data
        console.log('Payment verified as successful, caller should update database');
      }
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
