// ==============================================================================
// HomeVibes Edge Function: send-notification
// Integrates with Firebase Cloud Messaging (FCM) for mobile push dispatch
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
    const fcmServerKey = Deno.env.get("FIREBASE_SERVER_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, title, body, fcmToken, orderId, type } = await req.json();

    // 1. Record notification in PostgreSQL database log
    if (userId) {
      await supabase.from("notifications").insert([{
        user_id: userId,
        title,
        body,
        type: type || "ORDER_STATUS",
        related_order_id: orderId,
      }]);
    }

    // 2. If FCM token and server key exist, dispatch push notification
    if (fcmToken && fcmServerKey) {
      const fcmPayload = {
        to: fcmToken,
        notification: {
          title,
          body,
          sound: "default",
        },
        data: {
          orderId: orderId || "",
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
      };

      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Authorization": `key=${fcmServerKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fcmPayload),
      });

      const fcmResult = await response.json();
      return new Response(JSON.stringify({ success: true, fcmResult }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, message: "Logged in database." }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Failed to dispatch notification" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
