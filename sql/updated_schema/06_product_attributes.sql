-- =====================================================
-- PRODUCT_ATTRIBUTES TABLE SCHEMA
-- =====================================================
-- Additional product attributes and specifications
-- =====================================================

-- Product attributes table
CREATE TABLE IF NOT EXISTS public.product_attributes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_name TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;

-- Product attributes policies
CREATE POLICY "Anyone can view product attributes" ON public.product_attributes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage product attributes" ON public.product_attributes
  FOR ALL USING (auth.role() = 'authenticated');

-- Indexes for performance
CREATE INDEX IF NOT EXISTS product_attributes_product_id_idx ON public.product_attributes(product_id);
CREATE INDEX IF NOT EXISTS product_attributes_name_idx ON public.product_attributes(attribute_name);
CREATE INDEX IF NOT EXISTS product_attributes_display_order_idx ON public.product_attributes(display_order);

-- Comments
COMMENT ON TABLE public.product_attributes IS 'Additional product attributes and specifications';
COMMENT ON COLUMN public.product_attributes.id IS 'Unique identifier for the attribute';
COMMENT ON COLUMN public.product_attributes.product_id IS 'Reference to parent product';
COMMENT ON COLUMN public.product_attributes.attribute_name IS 'Name of the attribute (e.g., "Material", "Care Instructions")';
COMMENT ON COLUMN public.product_attributes.attribute_value IS 'Value of the attribute';
COMMENT ON COLUMN public.product_attributes.display_order IS 'Order for displaying attributes';
COMMENT ON COLUMN public.product_attributes.created_at IS 'Timestamp when attribute was created'; 