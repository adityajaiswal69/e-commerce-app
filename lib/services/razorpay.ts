import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  RazorpaySettings, 
  RazorpayOrderResponse, 
  PaymentVerificationResult,
  Order 
} from '@/types/payment.types';

let razorpayInstance: Razorpay | null = null;

async function getRazorpaySettings(): Promise<RazorpaySettings | null> {
  const supabase = await createServerSupabaseClient();
  
  const { data: settings, error } = await supabase
    .from('payment_settings')
    .select('settings')
    .eq('provider', 'razorpay')
    .eq('is_active', true)
    .single();

  if (error || !settings) {
    console.error('Failed to get Razorpay settings:', error);
    return null;
  }

  return settings.settings as RazorpaySettings;
}

async function initializeRazorpay(): Promise<Razorpay | null> {
  if (razorpayInstance) {
    return razorpayInstance;
  }

  const settings = await getRazorpaySettings();
  if (!settings || !settings.key_id || !settings.key_secret) {
    console.error('Razorpay settings not configured');
    return null;
  }

  razorpayInstance = new Razorpay({
    key_id: settings.key_id,
    key_secret: settings.key_secret,
  });

  return razorpayInstance;
}

export async function createRazorpayOrder(
  order: Order
): Promise<RazorpayOrderResponse | null> {
  try {
    const razorpay = await initializeRazorpay();
    if (!razorpay) {
      throw new Error('Razorpay not initialized');
    }

    const options = {
      amount: Math.round(order.total_amount * 100), // Amount in paise
      currency: order.currency,
      receipt: order.order_number,
      notes: {
        order_id: order.id,
        user_id: order.user_id,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);
    return razorpayOrder as RazorpayOrderResponse;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return null;
  }
}

export async function verifyRazorpayPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): Promise<PaymentVerificationResult> {
  try {
    const settings = await getRazorpaySettings();
    if (!settings || !settings.key_secret) {
      return {
        success: false,
        error: 'Razorpay settings not configured',
      };
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', settings.key_secret)
      .update(body.toString())
      .digest('hex');

    const isSignatureValid = expectedSignature === razorpay_signature;

    if (isSignatureValid) {
      return {
        success: true,
        transaction_id: razorpay_payment_id,
      };
    } else {
      return {
        success: false,
        error: 'Invalid signature',
      };
    }
  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    return {
      success: false,
      error: 'Verification failed',
    };
  }
}

export async function fetchRazorpayPayment(paymentId: string) {
  try {
    const razorpay = await initializeRazorpay();
    if (!razorpay) {
      throw new Error('Razorpay not initialized');
    }

    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching Razorpay payment:', error);
    return null;
  }
}

export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number,
  notes?: any
) {
  try {
    const razorpay = await initializeRazorpay();
    if (!razorpay) {
      throw new Error('Razorpay not initialized');
    }

    const refundData: any = {
      notes: notes || {},
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Amount in paise
    }

    const refund = await razorpay.payments.refund(paymentId, refundData);
    return refund;
  } catch (error) {
    console.error('Error refunding Razorpay payment:', error);
    return null;
  }
}

export async function verifyRazorpayWebhook(
  body: string,
  signature: string
): Promise<boolean> {
  try {
    const settings = await getRazorpaySettings();
    if (!settings || !settings.webhook_secret) {
      console.error('Webhook secret not configured');
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', settings.webhook_secret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook:', error);
    return false;
  }
}

export function getRazorpayCheckoutOptions(
  order: Order,
  razorpayOrder: RazorpayOrderResponse,
  userDetails: {
    name: string;
    email: string;
    contact: string;
  }
) {
  return {
    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    name: 'Uniformat',
    description: `Order #${order.order_number}`,
    image: '/logo.png',
    order_id: razorpayOrder.id,
    handler: function (response: any) {
      // This will be handled by the frontend
      console.log('Payment successful:', response);
    },
    prefill: {
      name: userDetails.name,
      email: userDetails.email,
      contact: userDetails.contact,
    },
    notes: {
      order_id: order.id,
      order_number: order.order_number,
    },
    theme: {
      color: '#3399cc',
    },
    modal: {
      ondismiss: function () {
        console.log('Payment modal closed');
      },
    },
  };
}

// Utility function to format amount for display
export function formatRazorpayAmount(amountInPaise: number): number {
  return amountInPaise / 100;
}

// Utility function to convert amount to paise
export function toRazorpayAmount(amount: number): number {
  return Math.round(amount * 100);
}
