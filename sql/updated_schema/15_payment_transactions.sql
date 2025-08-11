-- =====================================================
-- PAYMENT_TRANSACTIONS TABLE SCHEMA
-- =====================================================
-- Payment transaction records for order payments
-- =====================================================

-- Payment transactions table
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  payment_provider TEXT NOT NULL CHECK (payment_provider IN ('razorpay', 'stripe', 'paytm')),
  provider_transaction_id TEXT,
  provider_payment_id TEXT,
  provider_order_id TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled', 'refunded')),
  gateway_response JSONB,
  failure_reason TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Payment transactions policies
CREATE POLICY "Users can view their own payment transactions" ON public.payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payment_transactions.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "System can create payment transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update payment transactions" ON public.payment_transactions
  FOR UPDATE USING (true);

CREATE POLICY "Admin can view all payment transactions" ON public.payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON public.payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS payment_transactions_order_id_idx ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS payment_transactions_provider_payment_id_idx ON public.payment_transactions(provider_payment_id);
CREATE INDEX IF NOT EXISTS payment_transactions_status_idx ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS payment_transactions_created_at_idx ON public.payment_transactions(created_at DESC);

-- Comments
COMMENT ON TABLE public.payment_transactions IS 'Payment transaction records for order payments';
COMMENT ON COLUMN public.payment_transactions.id IS 'Unique identifier for the transaction';
COMMENT ON COLUMN public.payment_transactions.order_id IS 'Reference to the order';
COMMENT ON COLUMN public.payment_transactions.payment_provider IS 'Payment provider (razorpay, stripe, paytm)';
COMMENT ON COLUMN public.payment_transactions.provider_transaction_id IS 'Transaction ID from payment provider';
COMMENT ON COLUMN public.payment_transactions.provider_payment_id IS 'Payment ID from payment provider';
COMMENT ON COLUMN public.payment_transactions.provider_order_id IS 'Order ID from payment provider';
COMMENT ON COLUMN public.payment_transactions.amount IS 'Transaction amount';
COMMENT ON COLUMN public.payment_transactions.currency IS 'Transaction currency (default: INR)';
COMMENT ON COLUMN public.payment_transactions.status IS 'Transaction status (pending, success, failed, cancelled, refunded)';
COMMENT ON COLUMN public.payment_transactions.gateway_response IS 'Full response from payment gateway as JSON';
COMMENT ON COLUMN public.payment_transactions.failure_reason IS 'Reason for failure if transaction failed';
COMMENT ON COLUMN public.payment_transactions.processed_at IS 'Timestamp when transaction was processed';
COMMENT ON COLUMN public.payment_transactions.created_at IS 'Timestamp when transaction was created';
COMMENT ON COLUMN public.payment_transactions.updated_at IS 'Timestamp when transaction was last updated'; 