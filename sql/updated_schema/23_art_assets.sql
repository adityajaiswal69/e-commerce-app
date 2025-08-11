-- =====================================================
-- ART_ASSETS TABLE SCHEMA
-- =====================================================
-- Art assets (each image uploaded under a category)
-- =====================================================

-- Art assets (each image uploaded under a category)
CREATE TABLE IF NOT EXISTS public.art_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.art_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('svg', 'png', 'jpg', 'jpeg', 'webp')),
  tag TEXT NOT NULL,  
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.art_assets ENABLE ROW LEVEL SECURITY;

-- Art assets policies
CREATE POLICY "Public view of active art assets" ON public.art_assets
  FOR SELECT USING (
    active = true AND 
    EXISTS (
      SELECT 1 FROM public.art_categories 
      WHERE art_categories.id = art_assets.category_id 
      AND art_categories.active = true
    )
  );

CREATE POLICY "Users can manage their own art assets" ON public.art_assets
  FOR ALL USING (
    user_id = auth.uid() OR auth.role() = 'service_role'
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS art_assets_category_id_idx ON public.art_assets(category_id);
CREATE INDEX IF NOT EXISTS art_assets_user_id_idx ON public.art_assets(user_id);
CREATE INDEX IF NOT EXISTS art_assets_active_idx ON public.art_assets(active);
CREATE INDEX IF NOT EXISTS art_assets_tag_idx ON public.art_assets(tag);
CREATE INDEX IF NOT EXISTS art_assets_file_type_idx ON public.art_assets(file_type);

-- Comments
COMMENT ON TABLE public.art_assets IS 'Art assets (each image uploaded under a category)';
COMMENT ON COLUMN public.art_assets.id IS 'Unique identifier for the art asset';
COMMENT ON COLUMN public.art_assets.category_id IS 'Reference to art category';
COMMENT ON COLUMN public.art_assets.name IS 'Display name of the asset';
COMMENT ON COLUMN public.art_assets.image_url IS 'URL to the asset image';
COMMENT ON COLUMN public.art_assets.file_type IS 'File type of the asset (svg, png, jpg, jpeg, webp)';
COMMENT ON COLUMN public.art_assets.tag IS 'Tag for categorizing the asset';
COMMENT ON COLUMN public.art_assets.user_id IS 'Reference to user who uploaded the asset';
COMMENT ON COLUMN public.art_assets.active IS 'Whether this asset is active';
COMMENT ON COLUMN public.art_assets.created_at IS 'Timestamp when asset was created'; 