-- =====================================================
-- AI_ART TABLE SCHEMA
-- =====================================================
-- AI-generated art images for design tool
-- =====================================================

-- AI art table
CREATE TABLE IF NOT EXISTS public.ai_art (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  svg_url TEXT,
  original_image_url TEXT,
  generation_params JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_art ENABLE ROW LEVEL SECURITY;

-- AI art policies
CREATE POLICY "Users can view their own AI art" ON public.ai_art
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI art" ON public.ai_art
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI art" ON public.ai_art
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI art" ON public.ai_art
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_ai_art_updated_at ON public.ai_art;
CREATE TRIGGER update_ai_art_updated_at
  BEFORE UPDATE ON public.ai_art
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS ai_art_user_id_idx ON public.ai_art(user_id);
CREATE INDEX IF NOT EXISTS ai_art_created_at_idx ON public.ai_art(created_at DESC);

-- Comments
COMMENT ON TABLE public.ai_art IS 'AI-generated art images for design tool';
COMMENT ON COLUMN public.ai_art.id IS 'Unique identifier for the AI art';
COMMENT ON COLUMN public.ai_art.user_id IS 'Reference to user who generated the art';
COMMENT ON COLUMN public.ai_art.prompt IS 'Text prompt used to generate the art';
COMMENT ON COLUMN public.ai_art.image_url IS 'URL to the generated image';
COMMENT ON COLUMN public.ai_art.svg_url IS 'URL to SVG version of the image (if available)';
COMMENT ON COLUMN public.ai_art.original_image_url IS 'URL to original image before processing';
COMMENT ON COLUMN public.ai_art.generation_params IS 'Parameters used for AI generation as JSON';
COMMENT ON COLUMN public.ai_art.created_at IS 'Timestamp when art was created';
COMMENT ON COLUMN public.ai_art.updated_at IS 'Timestamp when art was last updated'; 