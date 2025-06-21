import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { verifyRazorpayWebhook } from '@/lib/services/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = await verifyRazorpayWebhook(body, signature);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    const supabase = createServerSupabaseClient();

    // Handle different webhook events
    switch (event.event) {
      case 'payment.captured':
        await handlePaymentCaptured(event, supabase);
        break;
      
      case 'payment.failed':
        await handlePaymentFailed(event, supabase);
        break;
      
      case 'order.paid':
        await handleOrderPaid(event, supabase);
        break;
      
      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(event: any, supabase: any) {
  const payment = event.payload.payment.entity;
  
  // Update transaction status
  await supabase
    .from('payment_transactions')
    .update({
      status: 'success',
      processed_at: new Date(payment.created_at * 1000).toISOString(),
      gateway_response: payment,
      updated_at: new Date().toISOString(),
    })
    .eq('provider_payment_id', payment.id);

  // Update order status
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('order_id')
    .eq('provider_payment_id', payment.id)
    .single();

  if (transaction) {
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.order_id);
  }
}

async function handlePaymentFailed(event: any, supabase: any) {
  const payment = event.payload.payment.entity;
  
  // Update transaction status
  await supabase
    .from('payment_transactions')
    .update({
      status: 'failed',
      failure_reason: payment.error_description || 'Payment failed',
      gateway_response: payment,
      updated_at: new Date().toISOString(),
    })
    .eq('provider_payment_id', payment.id);

  // Update order status
  const { data: transaction } = await supabase
    .from('payment_transactions')
    .select('order_id')
    .eq('provider_payment_id', payment.id)
    .single();

  if (transaction) {
    await supabase
      .from('orders')
      .update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', transaction.order_id);
  }
}

async function handleOrderPaid(event: any, supabase: any) {
  const order = event.payload.order.entity;
  
  // Update order based on Razorpay order ID
  await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.receipt); // Assuming receipt contains our order ID
}
