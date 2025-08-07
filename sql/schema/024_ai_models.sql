-- AI Models Management System
-- Creates tables for admin-managed AI providers and models

-- AI Providers table (similar to payment_settings pattern)
CREATE TABLE IF NOT EXISTS public.ai_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL, -- e.g., "Hugging Face", "OpenAI", "Replicate"
  provider_key TEXT NOT NULL UNIQUE, -- e.g., "huggingface", "openai"
  base_url TEXT, -- API base URL
  is_active BOOLEAN DEFAULT false,
  api_token TEXT, -- Encrypted API token
  settings JSONB DEFAULT '{}', -- Provider-specific settings
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AI Models table
CREATE TABLE IF NOT EXISTS public.ai_models (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES ai_providers(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL, -- e.g., "runwayml/stable-diffusion-v1-5"
  display_name TEXT NOT NULL, -- e.g., "Stable Diffusion v1.5"
  description TEXT,
  tags TEXT[], -- e.g., ["realistic", "general"]
  thumbnail_url TEXT,
  is_enabled BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  model_settings JSONB DEFAULT '{}', -- Model-specific parameters
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_models ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_providers (admin-only access)
CREATE POLICY "Admin can manage AI providers" ON public.ai_providers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- RLS Policies for ai_models
CREATE POLICY "Admin can manage AI models" ON public.ai_models
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Users can only read enabled models
CREATE POLICY "Users can view enabled AI models" ON public.ai_models
  FOR SELECT USING (is_enabled = true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_providers_provider_key ON public.ai_providers(provider_key);
CREATE INDEX IF NOT EXISTS idx_ai_providers_is_active ON public.ai_providers(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_models_provider_id ON public.ai_models(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_enabled ON public.ai_models(is_enabled);
CREATE INDEX IF NOT EXISTS idx_ai_models_is_default ON public.ai_models(is_default);
CREATE INDEX IF NOT EXISTS idx_ai_models_tags ON public.ai_models USING GIN(tags);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_providers_updated_at
    BEFORE UPDATE ON public.ai_providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_models_updated_at
    BEFORE UPDATE ON public.ai_models
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default providers
INSERT INTO public.ai_providers (name, provider_key, base_url, is_active, settings) VALUES
('Hugging Face', 'huggingface', 'https://api-inference.huggingface.co', false, '{"timeout": 30, "max_retries": 3}'),
('OpenAI', 'openai', 'https://api.openai.com/v1', false, '{"timeout": 60, "max_retries": 2}'),
('Replicate', 'replicate', 'https://api.replicate.com/v1', false, '{"timeout": 120, "max_retries": 3}'),
('Stability AI', 'stability', 'https://api.stability.ai/v1', false, '{"timeout": 90, "max_retries": 2}')
ON CONFLICT (provider_key) DO NOTHING;

-- Insert default models for Hugging Face
INSERT INTO public.ai_models (provider_id, model_id, display_name, description, tags, is_enabled, is_default, model_settings)
SELECT 
  p.id,
  'runwayml/stable-diffusion-v1-5',
  'Stable Diffusion v1.5',
  'General purpose text-to-image model, great for realistic images',
  ARRAY['realistic', 'general', 'popular'],
  true,
  true,
  '{"width": 512, "height": 512, "num_inference_steps": 20, "guidance_scale": 7.5}'
FROM public.ai_providers p WHERE p.provider_key = 'huggingface'
ON CONFLICT DO NOTHING;

INSERT INTO public.ai_models (provider_id, model_id, display_name, description, tags, is_enabled, is_default, model_settings)
SELECT 
  p.id,
  'stabilityai/stable-diffusion-2-1',
  'Stable Diffusion v2.1',
  'Improved version with better quality and composition',
  ARRAY['realistic', 'improved', 'quality'],
  true,
  false,
  '{"width": 768, "height": 768, "num_inference_steps": 25, "guidance_scale": 7.5}'
FROM public.ai_providers p WHERE p.provider_key = 'huggingface'
ON CONFLICT DO NOTHING;

INSERT INTO public.ai_models (provider_id, model_id, display_name, description, tags, is_enabled, is_default, model_settings)
SELECT 
  p.id,
  'CompVis/stable-diffusion-v1-4',
  'Stable Diffusion v1.4',
  'Original Stable Diffusion model, good for artistic styles',
  ARRAY['artistic', 'original', 'creative'],
  true,
  false,
  '{"width": 512, "height": 512, "num_inference_steps": 20, "guidance_scale": 7.5}'
FROM public.ai_providers p WHERE p.provider_key = 'huggingface'
ON CONFLICT DO NOTHING;
