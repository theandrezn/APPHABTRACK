import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

type StripeCheckoutSession = {
  id: string;
  object: "checkout.session";
  client_reference_id?: string | null;
  payment_status?: string | null;
  payment_intent?: string | null;
  customer?: string | null;
  amount_total?: number | null;
  currency?: string | null;
};

type StripeEvent = {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSession;
  };
};

const allowedAddOns = new Set([
  "travel-planner",
  "task-planner",
  "goal-planner",
  "budget-planner",
  "meal-planner",
  "workout-planner",
  "focus-planner",
  "self-care-planner",
]);

const encoder = new TextEncoder();

function hex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

async function verifyStripeSignature(payload: string, signatureHeader: string, secret: string) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    }),
  );
  const timestamp = parts.t;
  const expectedSignature = parts.v1;

  if (!timestamp || !expectedSignature) return false;

  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${timestamp}.${payload}`));
  return timingSafeEqual(hex(signature), expectedSignature);
}

function parseClientReferenceId(clientReferenceId?: string | null) {
  if (!clientReferenceId) return null;
  const separatorIndex = clientReferenceId.lastIndexOf("_");
  if (separatorIndex < 1) return null;

  const userId = clientReferenceId.slice(0, separatorIndex);
  const addOnId = clientReferenceId.slice(separatorIndex + 1);
  if (!allowedAddOns.has(addOnId)) return null;
  return { userId, addOnId };
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!stripeWebhookSecret || !supabaseUrl || !serviceRoleKey) {
    return new Response("Webhook is not configured", { status: 500 });
  }

  const payload = await req.text();
  const signatureHeader = req.headers.get("stripe-signature");
  if (!signatureHeader || !(await verifyStripeSignature(payload, signatureHeader, stripeWebhookSecret))) {
    return new Response("Invalid signature", { status: 400 });
  }

  const event = JSON.parse(payload) as StripeEvent;
  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true, ignored: event.type }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const session = event.data.object;
  if (session.payment_status !== "paid") {
    return new Response(JSON.stringify({ received: true, ignored: "unpaid_session" }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const reference = parseClientReferenceId(session.client_reference_id);
  if (!reference) {
    return new Response("Missing or invalid client_reference_id", { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await supabase
    .from("habit_game_addon_purchases")
    .upsert(
      {
        user_id: reference.userId,
        addon_id: reference.addOnId,
        stripe_checkout_session_id: session.id,
        stripe_payment_intent_id: typeof session.payment_intent === "string" ? session.payment_intent : null,
        stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
        amount_total: session.amount_total ?? null,
        currency: session.currency ?? null,
        status: "paid",
      },
      { onConflict: "user_id,addon_id" },
    );

  if (error) {
    return new Response(error.message, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true, unlocked: reference.addOnId }), {
    headers: { "Content-Type": "application/json" },
  });
});
