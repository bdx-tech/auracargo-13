
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Admin key, so it has permission to perform this operation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Add guest_email column to support_conversations table if it doesn't exist
    const { error: error1 } = await supabaseAdmin.rpc('add_column_if_not_exists', {
      p_table_name: 'support_conversations',
      p_column_name: 'guest_email',
      p_data_type: 'text'
    }).throwOnError()

    // Add guest_name and guest_email columns to support_messages table if they don't exist
    const { error: error2 } = await supabaseAdmin.rpc('add_column_if_not_exists', {
      p_table_name: 'support_messages',
      p_column_name: 'guest_name',
      p_data_type: 'text'
    }).throwOnError()

    const { error: error3 } = await supabaseAdmin.rpc('add_column_if_not_exists', {
      p_table_name: 'support_messages',
      p_column_name: 'guest_email',
      p_data_type: 'text'
    }).throwOnError()

    // Make user_id column nullable in the support_conversations table
    const { error: error4 } = await supabaseAdmin.query(`
      ALTER TABLE support_conversations
      ALTER COLUMN user_id DROP NOT NULL;
    `)

    // Make sender_id column nullable in the support_messages table
    const { error: error5 } = await supabaseAdmin.query(`
      ALTER TABLE support_messages
      ALTER COLUMN sender_id DROP NOT NULL;
    `)

    if (error1 || error2 || error3 || error4 || error5) {
      throw new Error(JSON.stringify({ error1, error2, error3, error4, error5 }))
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
