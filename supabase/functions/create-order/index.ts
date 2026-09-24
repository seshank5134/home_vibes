// ==============================================================================
// HomeVibes Edge Function: create-order
// Runtime: Deno / TypeScript (Supabase Edge Network)
// Ensures trusted server-side price calculation and stock validation
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

    // 1. Authenticate user from Authorization Bearer token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Parse request payload
    const { items, deliveryAddress, deliveryLat, deliveryLng, paymentMethod, deliveryNotes } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: "Order must contain at least one item." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Verify real-time prices & stock availability from database
    const foodIds = items.map((i: any) => i.id);
    const { data: foodItems, error: foodErr } = await supabase
      .from("food_items")
      .select("id, name, price, is_available")
      .in("id", foodIds);

    if (foodErr || !foodItems) {
      throw new Error("Unable to verify food prices.");
    }

    let calculatedSubtotal = 0;
    const validatedOrderItems = [];

    for (const item of items) {
      const match = foodItems.find((f: any) => f.id === item.id);
      if (!match) {
        return new Response(JSON.stringify({ error: `Dish with ID ${item.id} not found.` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!match.is_available) {
        return new Response(JSON.stringify({ error: `Dish "${match.name}" is currently out of stock.` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Number(match.price);
      const itemTotal = unitPrice * qty;
      calculatedSubtotal += itemTotal;

      validatedOrderItems.push({
        food_id: match.id,
        quantity: qty,
        unit_price: unitPrice,
        total_price: Number(itemTotal.toFixed(2)),
      });
    }

    // Server-side delivery fee business rule: Free over $35, otherwise $2.50
    const calculatedDeliveryFee = calculatedSubtotal > 35 ? 0.00 : 2.50;
    const calculatedTotal = Number((calculatedSubtotal + calculatedDeliveryFee).toFixed(2));
    const orderNumber = "HV-" + Math.floor(100000 + Math.random() * 900000);

    // 4. Insert into orders table
    const { data: newOrder, error: orderInsertErr } = await supabase
      .from("orders")
      .insert([{
        order_number: orderNumber,
        customer_id: user.id,
        status: "PLACED",
        subtotal: calculatedSubtotal,
        delivery_fee: calculatedDeliveryFee,
        total_amount: calculatedTotal,
        delivery_address: deliveryAddress || "100 Feet Road, Indiranagar, Bengaluru",
        delivery_latitude: deliveryLat || 12.9784,
        delivery_longitude: deliveryLng || 77.6408,
        payment_method: paymentMethod || "CASH_ON_DELIVERY",
        payment_status: paymentMethod === "ONLINE_MOCK" ? "PAID" : "PENDING",
        delivery_notes: deliveryNotes || "",
      }])
      .select()
      .single();

    if (orderInsertErr) throw orderInsertErr;

    // 5. Insert order line items
    const lineItemsToInsert = validatedOrderItems.map((v: any) => ({
      ...v,
      order_id: newOrder.id,
    }));

    const { error: lineItemsErr } = await supabase.from("order_items").insert(lineItemsToInsert);
    if (lineItemsErr) throw lineItemsErr;

    return new Response(JSON.stringify({ success: true, order: newOrder }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
