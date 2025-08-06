import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createRazorpayOrder } from '@/lib/services/razorpay';

export async function POST(request: NextRequest) {
  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createServerSupabaseClient();

    // Get the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', order_id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(order);

    if (!razorpayOrder) {
      return NextResponse.json(
        { error: 'Failed to create Razorpay order' },
        { status: 500 }
      );
    }

    // Create payment transaction record
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .insert({
        order_id: order.id,
        payment_provider: 'razorpay',
        provider_order_id: razorpayOrder.id,
        amount: order.total_amount,
        currency: order.currency,
        status: 'pending',
        gateway_response: razorpayOrder,
      });

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // Continue anyway, as the Razorpay order was created successfully
    }

    return NextResponse.json({
      success: true,
      razorpay_order: razorpayOrder,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
