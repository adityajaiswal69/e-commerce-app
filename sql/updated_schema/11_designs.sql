-- =====================================================
-- DESIGNS TABLE SCHEMA
-- =====================================================
-- Custom uniform designs created by users
-- =====================================================

-- Designs table for custom uniform designs
CREATE TABLE IF NOT EXISTS public.designs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  canvas_width INTEGER NOT NULL DEFAULT 600,
  canvas_height INTEGER NOT NULL DEFAULT 600,
  product_view TEXT NOT NULL DEFAULT 'front' CHECK (product_view IN ('front', 'back', 'left', 'right')),
  preview_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Designs policies
CREATE POLICY "Users can view their own designs" ON public.designs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs" ON public.designs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs" ON public.designs
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs" ON public.designs
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_designs_updated_at ON public.designs;
CREATE TRIGGER update_designs_updated_at
  BEFORE UPDATE ON public.designs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS designs_user_id_idx ON public.designs(user_id);
CREATE INDEX IF NOT EXISTS designs_product_id_idx ON public.designs(product_id);
CREATE INDEX IF NOT EXISTS designs_created_at_idx ON public.designs(created_at DESC);
CREATE INDEX IF NOT EXISTS designs_product_view_idx ON public.designs(product_view);

-- Comments
COMMENT ON TABLE public.designs IS 'Custom uniform designs created by users';
COMMENT ON COLUMN public.designs.id IS 'Unique identifier for the design';
COMMENT ON COLUMN public.designs.user_id IS 'Reference to user who created the design';
COMMENT ON COLUMN public.designs.product_id IS 'Reference to the product being customized';
COMMENT ON COLUMN public.designs.name IS 'Design name';
COMMENT ON COLUMN public.designs.elements IS 'JSON array of design elements (text, images, shapes)';
COMMENT ON COLUMN public.designs.canvas_width IS 'Canvas width in pixels';
COMMENT ON COLUMN public.designs.canvas_height IS 'Canvas height in pixels';
COMMENT ON COLUMN public.designs.product_view IS 'Product view (front, back, left, right)';
COMMENT ON COLUMN public.designs.preview_image_url IS 'URL to preview image of the design';
COMMENT ON COLUMN public.designs.created_at IS 'Timestamp when design was created';
COMMENT ON COLUMN public.designs.updated_at IS 'Timestamp when design was last updated'; 