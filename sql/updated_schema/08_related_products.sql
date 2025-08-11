-- =====================================================
-- RELATED_PRODUCTS TABLE SCHEMA
-- =====================================================
-- Product relationships for recommendations and cross-selling
-- =====================================================

-- Related products table
CREATE TABLE IF NOT EXISTS public.related_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  related_product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'similar',
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, related_product_id)
);

-- Enable RLS
ALTER TABLE public.related_products ENABLE ROW LEVEL SECURITY;

-- Related products policies
CREATE POLICY "Anyone can view related products" ON public.related_products
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage related products" ON public.related_products
  FOR ALL USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS related_products_product_id_idx ON public.related_products(product_id);
CREATE INDEX IF NOT EXISTS related_products_related_id_idx ON public.related_products(related_product_id);
CREATE INDEX IF NOT EXISTS related_products_relation_type_idx ON public.related_products(relation_type);
CREATE INDEX IF NOT EXISTS related_products_display_order_idx ON public.related_products(display_order);

-- Comments
COMMENT ON TABLE public.related_products IS 'Product relationships for recommendations and cross-selling';
COMMENT ON COLUMN public.related_products.id IS 'Unique identifier for the relationship';
COMMENT ON COLUMN public.related_products.product_id IS 'Reference to the main product';
COMMENT ON COLUMN public.related_products.related_product_id IS 'Reference to the related product';
COMMENT ON COLUMN public.related_products.relation_type IS 'Type of relationship (similar, complementary, alternative)';
COMMENT ON COLUMN public.related_products.display_order IS 'Order for displaying related products';
COMMENT ON COLUMN public.related_products.created_at IS 'Timestamp when relationship was created'; 