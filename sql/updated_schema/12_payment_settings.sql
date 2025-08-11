-- =====================================================
-- PAYMENT_SETTINGS TABLE SCHEMA
-- =====================================================
-- Payment gateway configuration settings for admin
-- =====================================================

-- Payment settings table for admin configuration
CREATE TABLE IF NOT EXISTS public.payment_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'paytm', 'cod')),
  is_active BOOLEAN DEFAULT false,
  is_test_mode BOOLEAN DEFAULT true,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(provider)
);

-- Enable RLS
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Payment settings policies (admin only)
CREATE POLICY "Admin can manage payment settings" ON public.payment_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_payment_settings_updated_at ON public.payment_settings;
CREATE TRIGGER update_payment_settings_updated_at
  BEFORE UPDATE ON public.payment_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS payment_settings_provider_idx ON public.payment_settings(provider);
CREATE INDEX IF NOT EXISTS payment_settings_is_active_idx ON public.payment_settings(is_active);

-- Comments
COMMENT ON TABLE public.payment_settings IS 'Payment gateway configuration settings for admin';
COMMENT ON COLUMN public.payment_settings.id IS 'Unique identifier for the payment setting';
COMMENT ON COLUMN public.payment_settings.provider IS 'Payment provider (razorpay, stripe, paytm, cod)';
COMMENT ON COLUMN public.payment_settings.is_active IS 'Whether this payment method is active';
COMMENT ON COLUMN public.payment_settings.is_test_mode IS 'Whether to use test mode for this provider';
COMMENT ON COLUMN public.payment_settings.settings IS 'Provider-specific settings as JSON';
COMMENT ON COLUMN public.payment_settings.created_at IS 'Timestamp when setting was created';
COMMENT ON COLUMN public.payment_settings.updated_at IS 'Timestamp when setting was last updated'; 