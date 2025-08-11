-- User addresses table supporting multiple addresses per user

CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home' CHECK (label IN ('Home','Office','Other','Custom')),
  name text,
  phone text,
  address_line_1 text NOT NULL,
  address_line_2 text,
  city text NOT NULL,
  state text,
  postal_code text,
  country text NOT NULL,
  is_default_shipping boolean NOT NULL DEFAULT false,
  is_default_billing boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Policies: users can fully manage their own addresses
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.user_addresses;
CREATE POLICY "Users can view their own addresses"
  ON public.user_addresses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.user_addresses;
CREATE POLICY "Users can insert their own addresses"
  ON public.user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own addresses" ON public.user_addresses;
CREATE POLICY "Users can update their own addresses"
  ON public.user_addresses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.user_addresses;
CREATE POLICY "Users can delete their own addresses"
  ON public.user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- Optional admin read/manage
DROP POLICY IF EXISTS "Admins can view all addresses" ON public.user_addresses;
CREATE POLICY "Admins can view all addresses"
  ON public.user_addresses FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- updated_at trigger
DROP TRIGGER IF EXISTS update_user_addresses_updated_at ON public.user_addresses;
CREATE TRIGGER update_user_addresses_updated_at
BEFORE UPDATE ON public.user_addresses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure only one default shipping/billing per user via partial unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS user_addresses_default_shipping_idx
  ON public.user_addresses(user_id)
  WHERE is_default_shipping;

CREATE UNIQUE INDEX IF NOT EXISTS user_addresses_default_billing_idx
  ON public.user_addresses(user_id)
  WHERE is_default_billing;

COMMENT ON TABLE public.user_addresses IS 'Multiple saved addresses per user (Home, Office, Other, Custom)';
COMMENT ON COLUMN public.user_addresses.label IS 'Address label/type: Home, Office, Other, Custom';
COMMENT ON COLUMN public.user_addresses.is_default_shipping IS 'Whether this is the default shipping address for the user';
COMMENT ON COLUMN public.user_addresses.is_default_billing IS 'Whether this is the default billing address for the user';

