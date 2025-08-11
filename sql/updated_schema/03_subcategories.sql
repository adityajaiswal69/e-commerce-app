-- =====================================================
-- SUBCATEGORIES TABLE SCHEMA
-- =====================================================
-- Subcategories within main categories for better organization
-- =====================================================

-- Subcategories table
CREATE TABLE IF NOT EXISTS public.subcategories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(category_id, slug)
);

-- Enable RLS
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Subcategories policies
CREATE POLICY "Anyone can view subcategories" ON public.subcategories
  FOR SELECT USING (true);

CREATE POLICY "Admin users can manage subcategories" ON public.subcategories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_subcategories_updated_at ON public.subcategories;
CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS subcategories_slug_idx ON public.subcategories(slug);
CREATE INDEX IF NOT EXISTS subcategories_category_id_idx ON public.subcategories(category_id);
CREATE INDEX IF NOT EXISTS subcategories_display_order_idx ON public.subcategories(display_order);

-- Comments
COMMENT ON TABLE public.subcategories IS 'Subcategories within main categories for better organization';
COMMENT ON COLUMN public.subcategories.id IS 'Unique identifier for the subcategory';
COMMENT ON COLUMN public.subcategories.category_id IS 'Reference to parent category';
COMMENT ON COLUMN public.subcategories.name IS 'Display name of the subcategory';
COMMENT ON COLUMN public.subcategories.slug IS 'URL-friendly identifier for the subcategory';
COMMENT ON COLUMN public.subcategories.description IS 'Optional description of the subcategory';
COMMENT ON COLUMN public.subcategories.image_url IS 'URL to subcategory image';
COMMENT ON COLUMN public.subcategories.display_order IS 'Order for displaying subcategories within category';
COMMENT ON COLUMN public.subcategories.created_at IS 'Timestamp when subcategory was created';
COMMENT ON COLUMN public.subcategories.updated_at IS 'Timestamp when subcategory was last updated'; 