-- Sample data for enhanced products with variants and multiple images
-- Run this after applying the enhanced schema migration

-- Insert sample products with enhanced features
INSERT INTO public.products (
  name, 
  description, 
  price, 
  original_price,
  image_url, 
  category, 
  stock, 
  active,
  brand,
  sku,
  material,
  care_instructions,
  style,
  colors,
  sizes,
  occasions,
  tags,
  featured,
  discount_percentage
) VALUES 
(
  'Professional Chef Uniform Set',
  'Premium quality chef uniform featuring moisture-wicking fabric, reinforced stitching, and professional styling. Perfect for commercial kitchens and culinary professionals.',
  89.99,
  119.99,
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  'hotel-hospitality',
  25,
  true,
  'TopHat Professional',
  'CHF-001-WHT',
  '65% Polyester, 35% Cotton',
  'Machine wash cold, tumble dry low',
  ARRAY['Professional', 'Classic', 'Comfortable'],
  ARRAY['White', 'Black', 'Navy'],
  '{"top": ["XS", "S", "M", "L", "XL", "XXL"]}',
  ARRAY['Kitchen Work', 'Professional', 'Commercial'],
  ARRAY['chef', 'kitchen', 'professional', 'uniform', 'hospitality'],
  true,
  25
),
(
  'Executive Business Suit',
  'Tailored executive business suit crafted from premium wool blend. Features modern slim fit, wrinkle-resistant fabric, and sophisticated styling for the modern professional.',
  299.99,
  399.99,
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  'corporate',
  15,
  true,
  'TopHat Executive',
  'EXE-002-NVY',
  '70% Wool, 30% Polyester',
  'Dry clean only',
  ARRAY['Executive', 'Slim Fit', 'Modern'],
  ARRAY['Navy', 'Charcoal', 'Black'],
  '{"top": ["38", "40", "42", "44", "46", "48"]}',
  ARRAY['Business', 'Formal', 'Executive'],
  ARRAY['suit', 'business', 'executive', 'formal', 'corporate'],
  true,
  25
),
(
  'Medical Scrubs Set',
  'Comfortable and durable medical scrubs designed for healthcare professionals. Features antimicrobial fabric, multiple pockets, and ergonomic fit for all-day comfort.',
  45.99,
  59.99,
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
  'hospital-uniform',
  50,
  true,
  'TopHat Medical',
  'MED-003-BLU',
  '55% Cotton, 45% Polyester',
  'Machine wash warm, tumble dry medium',
  ARRAY['Medical', 'Comfortable', 'Functional'],
  ARRAY['Blue', 'Green', 'White', 'Pink'],
  '{"top": ["XS", "S", "M", "L", "XL", "XXL"]}',
  ARRAY['Medical', 'Healthcare', 'Hospital'],
  ARRAY['scrubs', 'medical', 'healthcare', 'hospital', 'nurse'],
  false,
  23
);

-- Insert product variants for the chef uniform
INSERT INTO public.product_variants (
  product_id,
  name,
  sku,
  price,
  original_price,
  stock,
  size,
  color,
  active,
  display_order
) VALUES 
(
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'Small - White',
  'CHF-001-WHT-S',
  89.99,
  119.99,
  8,
  'S',
  'White',
  true,
  1
),
(
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'Medium - White',
  'CHF-001-WHT-M',
  89.99,
  119.99,
  10,
  'M',
  'White',
  true,
  2
),
(
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'Large - Black',
  'CHF-001-BLK-L',
  89.99,
  119.99,
  7,
  'L',
  'Black',
  true,
  3
);

-- Insert additional product images
INSERT INTO public.product_images (
  product_id,
  image_url,
  alt_text,
  is_primary,
  display_order
) VALUES 
-- Chef uniform images
(
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
  'Professional Chef Uniform - Front View',
  true,
  1
),
(
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
  'Professional Chef Uniform - Side View',
  false,
  2
),
(
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'https://images.unsplash.com/photo-1581299894007-aaa50297cf16?w=800',
  'Professional Chef Uniform - Detail View',
  false,
  3
),
-- Business suit images
(
  (SELECT id FROM public.products WHERE sku = 'EXE-002-NVY'),
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  'Executive Business Suit - Front View',
  true,
  1
),
(
  (SELECT id FROM public.products WHERE sku = 'EXE-002-NVY'),
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800',
  'Executive Business Suit - Profile View',
  false,
  2
),
-- Medical scrubs images
(
  (SELECT id FROM public.products WHERE sku = 'MED-003-BLU'),
  'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800',
  'Medical Scrubs Set - Front View',
  true,
  1
),
(
  (SELECT id FROM public.products WHERE sku = 'MED-003-BLU'),
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800',
  'Medical Scrubs Set - Side View',
  false,
  2
);

-- Insert related products
INSERT INTO public.related_products (
  product_id,
  related_product_id,
  relation_type,
  display_order
) VALUES 
-- Chef uniform related to medical scrubs (similar professional wear)
(
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  (SELECT id FROM public.products WHERE sku = 'MED-003-BLU'),
  'similar',
  1
),
-- Business suit related to chef uniform (professional wear)
(
  (SELECT id FROM public.products WHERE sku = 'EXE-002-NVY'),
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'complementary',
  1
),
-- Medical scrubs related to chef uniform
(
  (SELECT id FROM public.products WHERE sku = 'MED-003-BLU'),
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'similar',
  1
);

-- Insert product attributes for more detailed specifications
INSERT INTO public.product_attributes (
  product_id,
  attribute_name,
  attribute_value,
  display_order
) VALUES 
-- Chef uniform attributes
(
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'Fabric Weight',
  '240 GSM',
  1
),
(
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'Closure Type',
  'Button Front',
  2
),
(
  (SELECT id FROM public.products WHERE sku = 'CHF-001-WHT'),
  'Pocket Count',
  '4 Pockets',
  3
),
-- Business suit attributes
(
  (SELECT id FROM public.products WHERE sku = 'EXE-002-NVY'),
  'Fit Type',
  'Slim Fit',
  1
),
(
  (SELECT id FROM public.products WHERE sku = 'EXE-002-NVY'),
  'Lining',
  'Full Canvas',
  2
),
(
  (SELECT id FROM public.products WHERE sku = 'EXE-002-NVY'),
  'Button Style',
  'Two Button',
  3
),
-- Medical scrubs attributes
(
  (SELECT id FROM public.products WHERE sku = 'MED-003-BLU'),
  'Antimicrobial',
  'Yes',
  1
),
(
  (SELECT id FROM public.products WHERE sku = 'MED-003-BLU'),
  'Moisture Wicking',
  'Yes',
  2
),
(
  (SELECT id FROM public.products WHERE sku = 'MED-003-BLU'),
  'Stretch Fabric',
  '4-Way Stretch',
  3
);
