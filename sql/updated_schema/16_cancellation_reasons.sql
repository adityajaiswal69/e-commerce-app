-- =====================================================
-- CANCELLATION_REASONS TABLE SCHEMA
-- =====================================================
-- Predefined reasons for order cancellations
-- =====================================================

-- Cancellation reasons table
CREATE TABLE IF NOT EXISTS public.cancellation_reasons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reason TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.cancellation_reasons ENABLE ROW LEVEL SECURITY;

-- Cancellation reasons policies
CREATE POLICY "Anyone can view active cancellation reasons" ON public.cancellation_reasons
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage cancellation reasons" ON public.cancellation_reasons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS cancellation_reasons_reason_idx ON public.cancellation_reasons(reason);
CREATE INDEX IF NOT EXISTS cancellation_reasons_is_active_idx ON public.cancellation_reasons(is_active);
CREATE INDEX IF NOT EXISTS cancellation_reasons_display_order_idx ON public.cancellation_reasons(display_order);

-- Comments
COMMENT ON TABLE public.cancellation_reasons IS 'Predefined reasons for order cancellations';
COMMENT ON COLUMN public.cancellation_reasons.id IS 'Unique identifier for the cancellation reason';
COMMENT ON COLUMN public.cancellation_reasons.reason IS 'Unique reason code/identifier';
COMMENT ON COLUMN public.cancellation_reasons.description IS 'Human-readable description of the reason';
COMMENT ON COLUMN public.cancellation_reasons.is_active IS 'Whether this reason is active and available';
COMMENT ON COLUMN public.cancellation_reasons.display_order IS 'Order for displaying reasons';
COMMENT ON COLUMN public.cancellation_reasons.created_at IS 'Timestamp when reason was created'; 