-- =====================================================
-- AI_MODELS TABLE SCHEMA
-- =====================================================
-- AI models available for art generation
-- =====================================================

-- AI models table
CREATE TABLE IF NOT EXISTS public.ai_models (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES public.ai_providers(id) ON DELETE CASCADE NOT NULL,
  model_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  is_enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  model_settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- AI models policies (admin only)
CREATE POLICY "Admin can manage AI models" ON public.ai_models
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_ai_models_updated_at ON public.ai_models;
CREATE TRIGGER update_ai_models_updated_at
  BEFORE UPDATE ON public.ai_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS ai_models_provider_id_idx ON public.ai_models(provider_id);
CREATE INDEX IF NOT EXISTS ai_models_model_id_idx ON public.ai_models(model_id);
CREATE INDEX IF NOT EXISTS ai_models_is_enabled_idx ON public.ai_models(is_enabled);
CREATE INDEX IF NOT EXISTS ai_models_is_default_idx ON public.ai_models(is_default);
CREATE INDEX IF NOT EXISTS ai_models_tags_idx ON public.ai_models USING gin(tags);

-- Comments
COMMENT ON TABLE public.ai_models IS 'AI models available for art generation';
COMMENT ON COLUMN public.ai_models.id IS 'Unique identifier for the AI model';
COMMENT ON COLUMN public.ai_models.provider_id IS 'Reference to AI provider';
COMMENT ON COLUMN public.ai_models.model_id IS 'Model identifier from the provider';
COMMENT ON COLUMN public.ai_models.display_name IS 'Display name for the model';
COMMENT ON COLUMN public.ai_models.description IS 'Description of the model';
COMMENT ON COLUMN public.ai_models.tags IS 'Array of tags for categorizing the model';
COMMENT ON COLUMN public.ai_models.thumbnail_url IS 'URL to model thumbnail image';
COMMENT ON COLUMN public.ai_models.is_enabled IS 'Whether this model is enabled for use';
COMMENT ON COLUMN public.ai_models.is_default IS 'Whether this is the default model';
COMMENT ON COLUMN public.ai_models.model_settings IS 'Model-specific settings as JSON';
COMMENT ON COLUMN public.ai_models.created_at IS 'Timestamp when model was created';
COMMENT ON COLUMN public.ai_models.updated_at IS 'Timestamp when model was last updated'; 