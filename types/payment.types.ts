export type PaymentProvider = 'razorpay' | 'stripe' | 'paytm';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded';

export interface PaymentSettings {
  id: string;
  provider: PaymentProvider;
  is_active: boolean;
  is_test_mode: boolean;
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface RazorpaySettings {
  key_id: string;
  key_secret: string;
  webhook_secret: string;
}

export interface StripeSettings {
  publishable_key: string;
  secret_key: string;
  webhook_secret: string;
}

export interface PaytmSettings {
  merchant_id: string;
  merchant_key: string;
  website: string;
  industry_type: string;
}

export interface Address {
  name: string;
  phone: string;
  email?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: PaymentProvider | 'cod';
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  currency: string;
  shipping_address?: Address;
  billing_address?: Address;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  design_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product_snapshot?: any;
  customization_details?: any;
  created_at: string;
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  payment_provider: PaymentProvider;
  provider_transaction_id?: string;
  provider_payment_id?: string;
  provider_order_id?: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  gateway_response?: any;
  failure_reason?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderRequest {
  items: {
    product_id: string;
    design_id?: string;
    quantity: number;
    unit_price: number;
  }[];
  shipping_address: Address;
  billing_address?: Address;
  payment_method: PaymentProvider | 'cod';
  notes?: string;
}

export interface PaymentRequest {
  order_id: string;
  payment_provider: PaymentProvider;
  return_url?: string;
  cancel_url?: string;
}

export interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  created_at: number;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  transaction_id?: string;
  error?: string;
}

// Cart types for checkout
export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  design_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  customization_details?: any;
}

export interface CheckoutData {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  shipping_amount: number;
  discount_amount: number;
  total_amount: number;
  shipping_address: Address;
  billing_address?: Address;
  payment_method: PaymentProvider | 'cod';
  notes?: string;
}

// Webhook types
export interface RazorpayWebhookEvent {
  entity: string;
  account_id: string;
  event: string;
  contains: string[];
  payload: {
    payment: {
      entity: any;
    };
    order: {
      entity: any;
    };
  };
  created_at: number;
}

export interface PaymentWebhookHandler {
  provider: PaymentProvider;
  event_type: string;
  data: any;
  signature?: string;
  timestamp?: number;
}
