-- Enhanced Product Schema for Better Product Variants and Options
-- This migration adds support for product variants, multiple images, and better product organization

-- Add new columns to products table for enhanced features
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS sku TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS weight DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS dimensions JSONB,
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS care_instructions TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Create product variants table for different options of the same product
CREATE TABLE IF NOT EXISTS public.product_variants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., "Small - Red", "Large - Blue"
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

-- Create product attributes table for flexible product properties
CREATE TABLE IF NOT EXISTS public.product_attributes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_name TEXT NOT NULL, -- e.g., "Size", "Color", "Material"
  attribute_value TEXT NOT NULL, -- e.g., "Large", "Red", "Cotton"
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enhanced product images table (if not exists)
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

-- Create related products table for "You might also like" functionality
CREATE TABLE IF NOT EXISTS public.related_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  related_product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  relation_type TEXT DEFAULT 'similar', -- 'similar', 'complementary', 'alternative'
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, related_product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS products_brand_idx ON public.products (brand);
CREATE INDEX IF NOT EXISTS products_sku_idx ON public.products (sku);
CREATE INDEX IF NOT EXISTS products_featured_idx ON public.products (featured);
CREATE INDEX IF NOT EXISTS products_tags_idx ON public.products USING gin(tags);
CREATE INDEX IF NOT EXISTS products_updated_at_idx ON public.products (updated_at DESC);

CREATE INDEX IF NOT EXISTS product_variants_product_id_idx ON public.product_variants (product_id);
CREATE INDEX IF NOT EXISTS product_variants_sku_idx ON public.product_variants (sku);
CREATE INDEX IF NOT EXISTS product_variants_size_idx ON public.product_variants (size);
CREATE INDEX IF NOT EXISTS product_variants_color_idx ON public.product_variants (color);
CREATE INDEX IF NOT EXISTS product_variants_active_idx ON public.product_variants (active);

CREATE INDEX IF NOT EXISTS product_attributes_product_id_idx ON public.product_attributes (product_id);
CREATE INDEX IF NOT EXISTS product_attributes_name_idx ON public.product_attributes (attribute_name);

CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images (product_id);
CREATE INDEX IF NOT EXISTS product_images_variant_id_idx ON public.product_images (variant_id);
CREATE INDEX IF NOT EXISTS product_images_primary_idx ON public.product_images (is_primary);

CREATE INDEX IF NOT EXISTS related_products_product_id_idx ON public.related_products (product_id);
CREATE INDEX IF NOT EXISTS related_products_related_id_idx ON public.related_products (related_product_id);

-- Enable RLS on new tables
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.related_products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for product_variants
CREATE POLICY "Anyone can view active product variants" ON public.product_variants
  FOR SELECT USING (active = true);

CREATE POLICY "Authenticated users can manage product variants" ON public.product_variants
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for product_attributes
CREATE POLICY "Anyone can view product attributes" ON public.product_attributes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage product attributes" ON public.product_attributes
  FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for related_products
CREATE POLICY "Anyone can view related products" ON public.related_products
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage related products" ON public.related_products
  FOR ALL USING (auth.role() = 'authenticated');

-- Update existing product_images policies if needed
DROP POLICY IF EXISTS "Anyone can view product images" ON public.product_images;
CREATE POLICY "Anyone can view product images" ON public.product_images
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage product images" ON public.product_images;
CREATE POLICY "Authenticated users can manage product images" ON public.product_images
  FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON public.products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON public.product_variants;
CREATE TRIGGER update_product_variants_updated_at 
    BEFORE UPDATE ON public.product_variants 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
