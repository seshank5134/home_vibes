// ==============================================================================
// HomeVibes Edge Function: assign-driver
// Validates driver online status and links order to driver
// ==============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, driverId } = await req.json();

    if (!orderId || !driverId) {
      return new Response(JSON.stringify({ error: "Missing orderId or driverId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify driver exists and is online
    const { data: driver, error: driverErr } = await supabase
      .from("drivers")
      .select("id, is_online, user_id, profiles(name)")
      .eq("id", driverId)
      .single();

    if (driverErr || !driver) {
      return new Response(JSON.stringify({ error: "Driver partner not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!driver.is_online) {
      return new Response(JSON.stringify({ error: "Cannot assign offline driver." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update order
    const { data: updatedOrder, error: orderErr } = await supabase
      .from("orders")
      .update({
        driver_id: driverId,
        status: "DRIVER_ASSIGNED",
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId)
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Send in-app notification to driver
    await supabase.from("notifications").insert([{
      user_id: driver.user_id,
      title: "New Delivery Assigned! 🛵",
      body: `You have been dispatched to order #${updatedOrder.order_number}. Head to central kitchen for pickup.`,
      type: "DRIVER_ASSIGNED",
      related_order_id: orderId,
    }]);

    return new Response(JSON.stringify({ success: true, order: updatedOrder }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
