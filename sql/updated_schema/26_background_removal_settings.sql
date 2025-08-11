-- Background removal provider settings
-- Creates a table to manage providers, active selection, API tokens, and availability

CREATE TABLE IF NOT EXISTS public.background_removal_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider text NOT NULL CHECK (provider IN ('removebg', 'stability')),
  is_enabled boolean NOT NULL DEFAULT false,
  api_key text NOT NULL DEFAULT '',
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(provider)
);

-- Active provider selection (single row table semantics)
CREATE TABLE IF NOT EXISTS public.background_removal_active (
  id boolean PRIMARY KEY DEFAULT true,
  active_provider text NOT NULL CHECK (active_provider IN ('removebg', 'stability')),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Upsert default rows
INSERT INTO public.background_removal_settings(provider, is_enabled, api_key)
VALUES
  ('removebg', false, ''),
  ('stability', false, '')
ON CONFLICT (provider) DO NOTHING;

INSERT INTO public.background_removal_active(id, active_provider)
VALUES (true, 'removebg')
ON CONFLICT (id) DO NOTHING;

-- Triggers to update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS background_removal_settings_updated_at ON public.background_removal_settings;
CREATE TRIGGER background_removal_settings_updated_at
BEFORE UPDATE ON public.background_removal_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS background_removal_active_updated_at ON public.background_removal_active;
CREATE TRIGGER background_removal_active_updated_at
BEFORE UPDATE ON public.background_removal_active
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS
ALTER TABLE public.background_removal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.background_removal_active ENABLE ROW LEVEL SECURITY;

-- Admin-only manage policies
DROP POLICY IF EXISTS "Admin can manage background remover settings" ON public.background_removal_settings;
CREATE POLICY "Admin can manage background remover settings"
  ON public.background_removal_settings FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

DROP POLICY IF EXISTS "Admin can manage active background remover" ON public.background_removal_active;
CREATE POLICY "Admin can manage active background remover"
  ON public.background_removal_active FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'));

-- Read policies: allow authenticated users to read which provider is active and if provider is enabled (but not API keys)
DROP POLICY IF EXISTS "Authenticated users can read background remover active" ON public.background_removal_active;
CREATE POLICY "Authenticated users can read background remover active"
  ON public.background_removal_active FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create a view to expose non-sensitive provider state
CREATE OR REPLACE VIEW public.background_removal_provider_state AS
SELECT provider, is_enabled
FROM public.background_removal_settings;

GRANT SELECT ON public.background_removal_provider_state TO anon, authenticated;

