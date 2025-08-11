-- =====================================================
-- PRODUCTS TABLE SCHEMA
-- =====================================================
-- Main products table with all enhancements for uniform store
-- =====================================================

-- Main products table with all enhancements
CREATE TABLE IF NOT EXISTS public.products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Basic product info
  name TEXT NOT NULL,
  description TEXT,
  brand TEXT,
  sku TEXT UNIQUE,
  
  -- Pricing
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  original_price DECIMAL(10,2),
  discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  
  -- Images (directional support)
  image_url TEXT NOT NULL,
  front_image_url TEXT,
  back_image_url TEXT,
  left_image_url TEXT,
  right_image_url TEXT,
  
  -- Categorization
  category TEXT NOT NULL,
  subcategory_id uuid REFERENCES public.subcategories(id),
  
  -- Product attributes (NO SHOES - only top/bottom sizes)
  style TEXT[],
  colors TEXT[],
  sizes JSONB, -- Format: {"top": ["XS","S","M","L","XL","XXL"], "bottom": ["28","30","32","34","36","38","40"]}
  occasions TEXT[],
  tags TEXT[],
  
  -- Physical properties
  weight DECIMAL(8,2),
  dimensions JSONB,
  material TEXT,
  care_instructions TEXT,
  
  -- Inventory and status
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  active BOOLEAN NOT NULL DEFAULT true,
  featured BOOLEAN DEFAULT false,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Product policies
CREATE POLICY "Anyone can view active products" ON public.products
  FOR SELECT USING (active = true);

CREATE POLICY "Authenticated users can view all products" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);
CREATE INDEX IF NOT EXISTS products_subcategory_id_idx ON public.products(subcategory_id);
CREATE INDEX IF NOT EXISTS products_active_idx ON public.products(active);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products(featured);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON public.products(created_at DESC);
CREATE INDEX IF NOT EXISTS products_updated_at_idx ON public.products(updated_at DESC);
CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products(brand);
CREATE INDEX IF NOT EXISTS products_sku_idx ON public.products(sku);
CREATE INDEX IF NOT EXISTS products_style_idx ON public.products USING gin(style);
CREATE INDEX IF NOT EXISTS products_colors_idx ON public.products USING gin(colors);
CREATE INDEX IF NOT EXISTS products_occasions_idx ON public.products USING gin(occasions);
CREATE INDEX IF NOT EXISTS products_tags_idx ON public.products USING gin(tags);
CREATE INDEX IF NOT EXISTS products_front_image_idx ON public.products(front_image_url);
CREATE INDEX IF NOT EXISTS products_back_image_idx ON public.products(back_image_url);
CREATE INDEX IF NOT EXISTS products_left_image_idx ON public.products(left_image_url);
CREATE INDEX IF NOT EXISTS products_right_image_idx ON public.products(right_image_url);

-- Comments
COMMENT ON TABLE public.products IS 'Main products table with all enhancements for uniform store';
COMMENT ON COLUMN public.products.id IS 'Unique identifier for the product';
COMMENT ON COLUMN public.products.name IS 'Product name';
COMMENT ON COLUMN public.products.description IS 'Product description';
COMMENT ON COLUMN public.products.brand IS 'Product brand';
COMMENT ON COLUMN public.products.sku IS 'Stock Keeping Unit - unique product identifier';
COMMENT ON COLUMN public.products.price IS 'Current selling price';
COMMENT ON COLUMN public.products.original_price IS 'Original price before discount';
COMMENT ON COLUMN public.products.discount_percentage IS 'Discount percentage (0-100)';
COMMENT ON COLUMN public.products.image_url IS 'Main product image URL';
COMMENT ON COLUMN public.products.front_image_url IS 'Front view image URL';
COMMENT ON COLUMN public.products.back_image_url IS 'Back view image URL';
COMMENT ON COLUMN public.products.left_image_url IS 'Left view image URL';
COMMENT ON COLUMN public.products.right_image_url IS 'Right view image URL';
COMMENT ON COLUMN public.products.category IS 'Product category';
COMMENT ON COLUMN public.products.subcategory_id IS 'Reference to subcategory';
COMMENT ON COLUMN public.products.style IS 'Array of style attributes';
COMMENT ON COLUMN public.products.colors IS 'Array of available colors';
COMMENT ON COLUMN public.products.sizes IS 'JSON object with top/bottom sizes (NO SHOES)';
COMMENT ON COLUMN public.products.occasions IS 'Array of suitable occasions';
COMMENT ON COLUMN public.products.tags IS 'Array of product tags';
COMMENT ON COLUMN public.products.weight IS 'Product weight in grams';
COMMENT ON COLUMN public.products.dimensions IS 'Product dimensions as JSON';
COMMENT ON COLUMN public.products.material IS 'Product material';
COMMENT ON COLUMN public.products.care_instructions IS 'Care and washing instructions';
COMMENT ON COLUMN public.products.stock IS 'Available stock quantity';
COMMENT ON COLUMN public.products.active IS 'Whether product is active for sale';
COMMENT ON COLUMN public.products.featured IS 'Whether product is featured';
COMMENT ON COLUMN public.products.meta_title IS 'SEO meta title';
COMMENT ON COLUMN public.products.meta_description IS 'SEO meta description';
COMMENT ON COLUMN public.products.created_at IS 'Timestamp when product was created';
COMMENT ON COLUMN public.products.updated_at IS 'Timestamp when product was last updated'; 