-- =====================================================
-- CANCELLATION_REQUESTS TABLE SCHEMA
-- =====================================================
-- Order cancellation requests from customers
-- =====================================================

-- Cancellation requests table
CREATE TABLE IF NOT EXISTS public.cancellation_requests (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  additional_details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  processed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at TIMESTAMP WITH TIME ZONE,
  refund_amount DECIMAL(10,2),
  refund_status TEXT CHECK (refund_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_order_cancellation_request UNIQUE (order_id)
);

-- Disable RLS for cancellation requests (simplified approach to avoid auth.users access issues)
ALTER TABLE public.cancellation_requests DISABLE ROW LEVEL SECURITY;

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_cancellation_requests_updated_at ON public.cancellation_requests;
CREATE TRIGGER update_cancellation_requests_updated_at
  BEFORE UPDATE ON public.cancellation_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS cancellation_requests_order_id_idx ON public.cancellation_requests(order_id);
CREATE INDEX IF NOT EXISTS cancellation_requests_user_id_idx ON public.cancellation_requests(user_id);
CREATE INDEX IF NOT EXISTS cancellation_requests_status_idx ON public.cancellation_requests(status);
CREATE INDEX IF NOT EXISTS cancellation_requests_created_at_idx ON public.cancellation_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS cancellation_requests_refund_status_idx ON public.cancellation_requests(refund_status);

-- Comments
COMMENT ON TABLE public.cancellation_requests IS 'Order cancellation requests from customers';
COMMENT ON COLUMN public.cancellation_requests.id IS 'Unique identifier for the cancellation request';
COMMENT ON COLUMN public.cancellation_requests.order_id IS 'Reference to the order to be cancelled';
COMMENT ON COLUMN public.cancellation_requests.user_id IS 'Reference to user requesting cancellation';
COMMENT ON COLUMN public.cancellation_requests.reason IS 'Cancellation reason';
COMMENT ON COLUMN public.cancellation_requests.additional_details IS 'Additional details provided by customer';
COMMENT ON COLUMN public.cancellation_requests.status IS 'Request status (pending, approved, rejected)';
COMMENT ON COLUMN public.cancellation_requests.admin_notes IS 'Notes from admin processing the request';
COMMENT ON COLUMN public.cancellation_requests.processed_by IS 'Reference to admin who processed the request';
COMMENT ON COLUMN public.cancellation_requests.processed_at IS 'Timestamp when request was processed';
COMMENT ON COLUMN public.cancellation_requests.refund_amount IS 'Amount to be refunded';
COMMENT ON COLUMN public.cancellation_requests.refund_status IS 'Refund processing status';
COMMENT ON COLUMN public.cancellation_requests.created_at IS 'Timestamp when request was created';
COMMENT ON COLUMN public.cancellation_requests.updated_at IS 'Timestamp when request was last updated'; 