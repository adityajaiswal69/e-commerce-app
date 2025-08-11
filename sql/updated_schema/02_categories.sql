-- =====================================================
-- CATEGORIES TABLE SCHEMA
-- =====================================================
-- Main product categories for the e-commerce uniform store
-- =====================================================

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Anyone can view categories" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS categories_slug_idx ON public.categories(slug);
CREATE INDEX IF NOT EXISTS categories_display_order_idx ON public.categories(display_order);

-- Comments
COMMENT ON TABLE public.categories IS 'Main product categories for the e-commerce uniform store';
COMMENT ON COLUMN public.categories.id IS 'Unique identifier for the category';
COMMENT ON COLUMN public.categories.name IS 'Display name of the category';
COMMENT ON COLUMN public.categories.slug IS 'URL-friendly identifier for the category';
COMMENT ON COLUMN public.categories.description IS 'Optional description of the category';
COMMENT ON COLUMN public.categories.image_url IS 'URL to category image';
COMMENT ON COLUMN public.categories.display_order IS 'Order for displaying categories';
COMMENT ON COLUMN public.categories.created_at IS 'Timestamp when category was created';
COMMENT ON COLUMN public.categories.updated_at IS 'Timestamp when category was last updated'; 