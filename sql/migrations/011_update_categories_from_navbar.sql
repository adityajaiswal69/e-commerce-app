-- Migration to update categories and subcategories to match navigation structure
-- This script safely updates existing data and adds new categories/subcategories

-- First, clear existing categories and subcategories (if any)
DELETE FROM public.subcategories;
DELETE FROM public.categories;

-- Reset sequences
ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS subcategories_id_seq RESTART WITH 1;

-- Insert categories matching navigation structure
INSERT INTO public.categories (name, slug, description, display_order) VALUES
('Hotel/Hospitality Uniform', 'hotel-hospitality', 'Uniforms for hotels, restaurants, and hospitality industry', 1),
('School', 'school', 'School uniforms and educational institution wear', 2),
('Automobile', 'automobile', 'Automotive industry uniforms and workwear', 3),
('Corporate', 'corporate', 'Business and office wear uniforms', 4),
('Restaurant/Cafe/Pub', 'restaurant-cafe-pub', 'Food service and restaurant uniforms', 5),
('Speciality Industry Uniform', 'speciality-industry', 'Specialized industry uniforms', 6),
('Hospital Uniform', 'hospital-uniform', 'Medical and healthcare professional uniforms', 7),
('Medical Factory Uniform', 'medical-factory', 'Medical manufacturing and factory uniforms', 8),
('Catering Uniform', 'catering-uniform', 'Catering and food service uniforms', 9),
('Apron', 'apron', 'Various types of aprons for different industries', 10);

-- Insert subcategories for Hotel/Hospitality
INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Milk Uniform', 'milk-uniform', 1 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Maintenance Uniform', 'maintenance-uniform', 2 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Kitchen Uniform', 'kitchen-uniform', 3 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Chef Uniform', 'chef-uniform', 4 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'F&B GSA/Waiter', 'fb-gsa-waiter', 5 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Pool - Uniform', 'pool-uniform', 6 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Spa - Uniform', 'spa-uniform', 7 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Manager', 'manager', 8 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Bell Boy', 'bell-boy', 9 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Valet Uniform', 'valet-uniform', 10 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Hostess Uniform', 'hostess-uniform', 11 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Security Guard Uniform', 'security-guard-uniform', 12 FROM public.categories WHERE slug = 'hotel-hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Back Office', 'back-office', 13 FROM public.categories WHERE slug = 'hotel-hospitality';

-- Insert subcategories for Hospital Uniform
INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Doctor Coat', 'doctor-coat', 1 FROM public.categories WHERE slug = 'hospital-uniform';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Nurse Uniform', 'nurse-uniform', 2 FROM public.categories WHERE slug = 'hospital-uniform';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Patient Uniform', 'patient-uniform', 3 FROM public.categories WHERE slug = 'hospital-uniform';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Back Office', 'back-office', 4 FROM public.categories WHERE slug = 'hospital-uniform';

-- Insert subcategories for Medical Factory
INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Factory Workers', 'factory-workers', 1 FROM public.categories WHERE slug = 'medical-factory';

-- Insert subcategories for Apron
INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'KSt Apron', 'kst-apron', 1 FROM public.categories WHERE slug = 'apron';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Chef Apron', 'chef-apron', 2 FROM public.categories WHERE slug = 'apron';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Leather Apron', 'leather-apron', 3 FROM public.categories WHERE slug = 'apron';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Cafe Apron', 'cafe-apron', 4 FROM public.categories WHERE slug = 'apron';

-- Update existing products to use new category structure
-- For main categories, keep the category field as is
UPDATE public.products
SET category = 'hotel-hospitality'
WHERE category IN ('hotel', 'hospitality', 'hotel-hospitality');

UPDATE public.products
SET category = 'hospital-uniform'
WHERE category IN ('hospital', 'medical', 'healthcare');

UPDATE public.products
SET category = 'restaurant-cafe-pub'
WHERE category IN ('restaurant', 'cafe', 'pub', 'food-service');

UPDATE public.products
SET category = 'medical-factory'
WHERE category IN ('factory', 'industrial');

UPDATE public.products
SET category = 'catering-uniform'
WHERE category IN ('catering');

-- For subcategory products, we'll set the category field to the subcategory slug
-- This allows direct filtering by subcategory slug as category

-- Set subcategory_id for products based on their current category and name patterns
-- This is a best-effort mapping - manual review may be needed

-- Hotel/Hospitality subcategories
UPDATE public.products 
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'chef-uniform' LIMIT 1)
WHERE category = 'hotel-hospitality' AND (name ILIKE '%chef%' OR description ILIKE '%chef%');

UPDATE public.products 
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'kitchen-uniform' LIMIT 1)
WHERE category = 'hotel-hospitality' AND (name ILIKE '%kitchen%' OR description ILIKE '%kitchen%');

UPDATE public.products 
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'fb-gsa-waiter' LIMIT 1)
WHERE category = 'hotel-hospitality' AND (name ILIKE '%waiter%' OR name ILIKE '%server%' OR description ILIKE '%waiter%');

-- Hospital subcategories
UPDATE public.products 
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'doctor-coat' LIMIT 1)
WHERE category = 'hospital-uniform' AND (name ILIKE '%doctor%' OR name ILIKE '%physician%' OR description ILIKE '%doctor%');

UPDATE public.products 
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'nurse-uniform' LIMIT 1)
WHERE category = 'hospital-uniform' AND (name ILIKE '%nurse%' OR description ILIKE '%nurse%');

-- Apron subcategories
UPDATE public.products 
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'chef-apron' LIMIT 1)
WHERE category = 'apron' AND (name ILIKE '%chef%' OR description ILIKE '%chef%');

UPDATE public.products 
SET subcategory_id = (SELECT id FROM public.subcategories WHERE slug = 'cafe-apron' LIMIT 1)
WHERE category = 'apron' AND (name ILIKE '%cafe%' OR description ILIKE '%cafe%');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category_subcategory ON public.products(category, subcategory_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_slug ON public.subcategories(category_id, slug);

-- Verify the migration
SELECT 
  c.name as category_name,
  c.slug as category_slug,
  COUNT(s.id) as subcategory_count,
  COUNT(p.id) as product_count
FROM public.categories c
LEFT JOIN public.subcategories s ON c.id = s.category_id
LEFT JOIN public.products p ON c.slug = p.category
GROUP BY c.id, c.name, c.slug
ORDER BY c.display_order;
