-- =====================================================
-- PRODUCT_IMAGES TABLE SCHEMA
-- =====================================================
-- Product images with support for multiple views and variants
-- =====================================================

-- Product images table
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  is_primary BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Product images policies
CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage product images" ON public.product_images
  FOR ALL USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS product_images_variant_id_idx ON public.product_images(variant_id);
CREATE INDEX IF NOT EXISTS product_images_primary_idx ON public.product_images(is_primary);
CREATE INDEX IF NOT EXISTS product_images_display_order_idx ON public.product_images(display_order);

-- Comments
COMMENT ON TABLE public.product_images IS 'Product images with support for multiple views and variants';
COMMENT ON COLUMN public.product_images.id IS 'Unique identifier for the image';
COMMENT ON COLUMN public.product_images.product_id IS 'Reference to parent product';
COMMENT ON COLUMN public.product_images.variant_id IS 'Reference to product variant (optional)';
COMMENT ON COLUMN public.product_images.image_url IS 'URL to the image file';
COMMENT ON COLUMN public.product_images.alt_text IS 'Alt text for accessibility';
COMMENT ON COLUMN public.product_images.is_primary IS 'Whether this is the primary image for the product';
COMMENT ON COLUMN public.product_images.display_order IS 'Order for displaying images';
COMMENT ON COLUMN public.product_images.created_at IS 'Timestamp when image was created'; 