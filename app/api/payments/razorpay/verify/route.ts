import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyRazorpayPayment } from '@/lib/services/razorpay';

export async function POST(request: NextRequest) {
  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await request.json();

    if (!order_id || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verify the payment signature
    const verificationResult = await verifyRazorpayPayment(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!verificationResult.success) {
      // Update transaction as failed
      await supabase
        .from('payment_transactions')
        .update({
          status: 'failed',
          failure_reason: verificationResult.error,
          updated_at: new Date().toISOString(),
        })
        .eq('order_id', order_id)
        .eq('provider_order_id', razorpay_order_id);

      return NextResponse.json({
        success: false,
        error: verificationResult.error,
      });
    }

    // Update the payment transaction
    const { error: transactionError } = await supabase
      .from('payment_transactions')
      .update({
        provider_payment_id: razorpay_payment_id,
        status: 'success',
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', order_id)
      .eq('provider_order_id', razorpay_order_id);

    if (transactionError) {
      console.error('Error updating transaction:', transactionError);
    }

    // Update the order status
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id);

    if (orderError) {
      console.error('Error updating order:', orderError);
      return NextResponse.json(
        { error: 'Failed to update order status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction_id: verificationResult.transaction_id,
    });
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
