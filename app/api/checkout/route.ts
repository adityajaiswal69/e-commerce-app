import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
  typescript: true,
});

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Please sign in to checkout" },
        { status: 401 }
      );
    }

    const { items, shippingAddress } = await req.json();
    console.log("Received items:", items);
    console.log("Shipping address:", shippingAddress);

    if (!items?.length) {
      return NextResponse.json({ error: "No items in cart" }, { status: 400 });
    }

    // Create Stripe session first
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
            images: [item.product.image_url],
          },
          unit_amount: Math.round(item.product.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: {
        user_id: session.user.id,
      },
    });

    // Calculate total (ensure it's a number)
    const total = items.reduce(
      (sum: number, item: any) =>
        sum + Number(item.product.price) * Number(item.quantity),
      0
    );

    try {
      // Create order first
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: session.user.id,
          stripe_session_id: stripeSession.id,
          total: total,
          status: "pending",
          shipping_address: shippingAddress,
        })
        .select()
        .single();

      if (orderError) {
        console.error("Order creation error:", orderError);
        throw new Error(`Failed to create order: ${orderError.message}`);
      }

      if (!order) {
        throw new Error("No order was created");
      }

      // Then create order items
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: Number(item.quantity),
        price: Number(item.product.price),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) {
        console.error("Order items creation error:", itemsError);
        // Cleanup the order if items creation fails
        await supabase.from("orders").delete().eq("id", order.id);
        throw new Error(`Failed to create order items: ${itemsError.message}`);
      }

      return NextResponse.json({ sessionUrl: stripeSession.url });
    } catch (dbError) {
      console.error("Database error:", dbError);
      throw dbError;
    }
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Payment processing failed",
        details: error,
      },
      { status: 500 }
    );
  }
}
