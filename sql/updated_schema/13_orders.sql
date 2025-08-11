-- =====================================================
-- ORDERS TABLE SCHEMA
-- =====================================================
-- Customer orders with complete payment integration
-- =====================================================

-- Orders table with complete payment integration
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  order_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_method TEXT CHECK (payment_method IN ('razorpay', 'stripe', 'paytm', 'cod')),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all orders" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can update all orders" ON public.orders
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE INDEX IF NOT EXISTS orders_payment_status_idx ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders(order_number);

-- Comments
COMMENT ON TABLE public.orders IS 'Customer orders with complete payment integration';
COMMENT ON COLUMN public.orders.id IS 'Unique identifier for the order';
COMMENT ON COLUMN public.orders.user_id IS 'Reference to customer who placed the order';
COMMENT ON COLUMN public.orders.order_number IS 'Human-readable order number';
COMMENT ON COLUMN public.orders.status IS 'Order status (pending, confirmed, processing, shipped, delivered, cancelled, refunded)';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status (pending, paid, failed, refunded, partially_refunded)';
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method used (razorpay, stripe, paytm, cod)';
COMMENT ON COLUMN public.orders.subtotal IS 'Order subtotal before tax and shipping';
COMMENT ON COLUMN public.orders.tax_amount IS 'Tax amount';
COMMENT ON COLUMN public.orders.shipping_amount IS 'Shipping cost';
COMMENT ON COLUMN public.orders.discount_amount IS 'Discount amount';
COMMENT ON COLUMN public.orders.total_amount IS 'Total order amount';
COMMENT ON COLUMN public.orders.currency IS 'Order currency (default: INR)';
COMMENT ON COLUMN public.orders.shipping_address IS 'Shipping address as JSON';
COMMENT ON COLUMN public.orders.billing_address IS 'Billing address as JSON';
COMMENT ON COLUMN public.orders.notes IS 'Order notes';
COMMENT ON COLUMN public.orders.created_at IS 'Timestamp when order was created';
COMMENT ON COLUMN public.orders.updated_at IS 'Timestamp when order was last updated'; 