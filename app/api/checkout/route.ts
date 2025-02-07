import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { CartItem } from "@/types/cart";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { items, shippingAddress } = await request.json();

    // Validate input data
    if (!Array.isArray(items) || items.length === 0) {
      console.error("Invalid items:", items);
      return new Response(
        JSON.stringify({ error: "Items must be a non-empty array" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.error("Unauthorized access attempt");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calculate total
    const total = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item: CartItem) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.name,
            description: `Size: ${item.size}`,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        userId: user.id,
        shippingAddress: JSON.stringify(shippingAddress),
      },
    });

    // Log the session details for debugging
    console.log("Stripe session created:", session);

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        shipping_address: shippingAddress,
        payment_intent_id: session.payment_intent as string,
        payment_status: session.payment_status,
        stripe_session_id: session.id,
        total: total,
      })
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
      throw orderError;
    }

    // Create order items
    const orderItems = items.map((item: CartItem) => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      price: item.price,
      category: item.category,
      selected_size: item.size,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error creating order items:", itemsError);
      throw itemsError;
    }

    return new Response(JSON.stringify({ sessionUrl: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(JSON.stringify({ error: "Checkout failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
