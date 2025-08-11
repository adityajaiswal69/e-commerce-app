-- =====================================================
-- AI_PROVIDERS TABLE SCHEMA
-- =====================================================
-- AI service providers configuration
-- =====================================================

-- AI providers table
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  provider_key TEXT NOT NULL UNIQUE,
  base_url TEXT,
  is_active BOOLEAN DEFAULT true,
  api_token TEXT,
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;

-- AI providers policies (admin only)
CREATE POLICY "Admin can manage AI providers" ON public.ai_providers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_ai_providers_updated_at ON public.ai_providers;
CREATE TRIGGER update_ai_providers_updated_at
  BEFORE UPDATE ON public.ai_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS ai_providers_provider_key_idx ON public.ai_providers(provider_key);
CREATE INDEX IF NOT EXISTS ai_providers_is_active_idx ON public.ai_providers(is_active);

-- Comments
COMMENT ON TABLE public.ai_providers IS 'AI service providers configuration';
COMMENT ON COLUMN public.ai_providers.id IS 'Unique identifier for the AI provider';
COMMENT ON COLUMN public.ai_providers.name IS 'Display name of the provider';
COMMENT ON COLUMN public.ai_providers.provider_key IS 'Unique key identifier for the provider';
COMMENT ON COLUMN public.ai_providers.base_url IS 'Base URL for the provider API';
COMMENT ON COLUMN public.ai_providers.is_active IS 'Whether this provider is active';
COMMENT ON COLUMN public.ai_providers.api_token IS 'API token for authentication';
COMMENT ON COLUMN public.ai_providers.settings IS 'Provider-specific settings as JSON';
COMMENT ON COLUMN public.ai_providers.created_at IS 'Timestamp when provider was created';
COMMENT ON COLUMN public.ai_providers.updated_at IS 'Timestamp when provider was last updated'; 