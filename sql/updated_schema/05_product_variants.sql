-- =====================================================
-- PRODUCT_VARIANTS TABLE SCHEMA
-- =====================================================
-- Product variants for different sizes, colors, and materials
-- =====================================================

-- Product variants table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10,2),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  size TEXT,
  color TEXT,
  material TEXT,
  weight DECIMAL(8,2),
  dimensions JSONB,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Product variants policies
CREATE POLICY "Anyone can view active product variants" ON public.product_variants
  FOR SELECT USING (active = true);

CREATE POLICY "Authenticated users can manage product variants" ON public.product_variants
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS product_variants_sku_idx ON public.product_variants(sku);
CREATE INDEX IF NOT EXISTS product_variants_size_idx ON public.product_variants(size);
CREATE INDEX IF NOT EXISTS product_variants_color_idx ON public.product_variants(color);
CREATE INDEX IF NOT EXISTS product_variants_active_idx ON public.product_variants(active);
CREATE INDEX IF NOT EXISTS product_variants_display_order_idx ON public.product_variants(display_order);

-- Comments
COMMENT ON TABLE public.product_variants IS 'Product variants for different sizes, colors, and materials';
COMMENT ON COLUMN public.product_variants.id IS 'Unique identifier for the variant';
COMMENT ON COLUMN public.product_variants.product_id IS 'Reference to parent product';
COMMENT ON COLUMN public.product_variants.name IS 'Variant name';
COMMENT ON COLUMN public.product_variants.sku IS 'Stock Keeping Unit for the variant';
COMMENT ON COLUMN public.product_variants.price IS 'Variant price';
COMMENT ON COLUMN public.product_variants.original_price IS 'Original price before discount';
COMMENT ON COLUMN public.product_variants.stock IS 'Available stock for this variant';
COMMENT ON COLUMN public.product_variants.size IS 'Variant size';
COMMENT ON COLUMN public.product_variants.color IS 'Variant color';
COMMENT ON COLUMN public.product_variants.material IS 'Variant material';
COMMENT ON COLUMN public.product_variants.weight IS 'Variant weight in grams';
COMMENT ON COLUMN public.product_variants.dimensions IS 'Variant dimensions as JSON';
COMMENT ON COLUMN public.product_variants.image_url IS 'Variant-specific image URL';
COMMENT ON COLUMN public.product_variants.active IS 'Whether variant is active';
COMMENT ON COLUMN public.product_variants.display_order IS 'Order for displaying variants';
COMMENT ON COLUMN public.product_variants.created_at IS 'Timestamp when variant was created';
COMMENT ON COLUMN public.product_variants.updated_at IS 'Timestamp when variant was last updated'; 