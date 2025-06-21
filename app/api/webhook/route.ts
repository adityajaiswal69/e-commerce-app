import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    // Validate environment variables at runtime
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Missing STRIPE_SECRET_KEY environment variable');
      return new Response('Server configuration error', { status: 500 });
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return new Response('Server configuration error', { status: 500 });
    }

    // Initialize Stripe with validated environment variables
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-01-27.acacia",
      typescript: true,
      appInfo: {
        name: "e-commerce-app",
        version: "0.1.0"
      }
    });

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      return new Response('Missing stripe-signature header', { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      return new Response(
        `Webhook Error: ${err instanceof Error ? err.message : 'Unknown Error'}`,
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient({ cookies });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (!session?.id) {
        return new Response('Invalid session data', { status: 400 });
      }

      // Update order status and add payment details
      const { error } = await supabase
        .from("orders")
        .update({
          status: "paid",
          updated_at: new Date().toISOString(),
          payment_intent: session.payment_intent,
          payment_status: session.payment_status,
        })
        .eq("stripe_session_id", session.id);

      if (error) {
        console.error("Error updating order:", error);
        throw error;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 400 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
