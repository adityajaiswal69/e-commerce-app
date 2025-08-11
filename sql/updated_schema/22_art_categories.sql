-- =====================================================
-- ART_CATEGORIES TABLE SCHEMA
-- =====================================================
-- Categories for art assets (e.g. emojis, shapes, etc.)
-- =====================================================

-- Art categories table (e.g. emojis, shapes, etc.)
CREATE TABLE IF NOT EXISTS public.art_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.art_categories ENABLE ROW LEVEL SECURITY;

-- Art categories policies
CREATE POLICY "Public view of active art categories" ON public.art_categories
  FOR SELECT USING (active = true);

CREATE POLICY "Admin can manage art categories" ON public.art_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS art_categories_slug_idx ON public.art_categories(slug);
CREATE INDEX IF NOT EXISTS art_categories_active_idx ON public.art_categories(active);

-- Comments
COMMENT ON TABLE public.art_categories IS 'Categories for art assets (e.g. emojis, shapes, etc.)';
COMMENT ON COLUMN public.art_categories.id IS 'Unique identifier for the art category';
COMMENT ON COLUMN public.art_categories.name IS 'Display name of the category';
COMMENT ON COLUMN public.art_categories.slug IS 'URL-friendly identifier for the category';
COMMENT ON COLUMN public.art_categories.icon_url IS 'URL to category icon';
COMMENT ON COLUMN public.art_categories.active IS 'Whether this category is active';
COMMENT ON COLUMN public.art_categories.created_at IS 'Timestamp when category was created'; 