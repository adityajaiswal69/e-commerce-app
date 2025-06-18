-- Add casual category and subcategories
-- Insert casual category
INSERT INTO public.categories (name, slug, description, display_order) VALUES
('Casual', 'casual', 'Casual wear and everyday clothing', 11)
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Casual
INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'T-Shirt', 't-shirt', 1 FROM public.categories WHERE slug = 'casual'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Jersey', 'jersey', 2 FROM public.categories WHERE slug = 'casual'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Add some sample casual products
INSERT INTO public.products (name, description, price, image_url, category, subcategory_id, stock, active) VALUES
-- T-Shirt products (category = 't-shirt' for direct filtering)
('Cotton T-Shirt White', 'Comfortable white cotton t-shirt for everyday wear', 500.00, '/images/tshirt-white.jpg', 't-shirt', (SELECT id FROM subcategories WHERE slug = 't-shirt' LIMIT 1), 100, true),
('Cotton T-Shirt Black', 'Classic black cotton t-shirt with premium quality', 500.00, '/images/tshirt-black.jpg', 't-shirt', (SELECT id FROM subcategories WHERE slug = 't-shirt' LIMIT 1), 80, true),
('Polo T-Shirt Navy', 'Navy blue polo t-shirt with collar', 750.00, '/images/polo-navy.jpg', 't-shirt', (SELECT id FROM subcategories WHERE slug = 't-shirt' LIMIT 1), 60, true),
('V-Neck T-Shirt Grey', 'Grey v-neck t-shirt for casual wear', 550.00, '/images/vneck-grey.jpg', 't-shirt', (SELECT id FROM subcategories WHERE slug = 't-shirt' LIMIT 1), 70, true),

-- Jersey products (category = 'jersey' for direct filtering)
('Sports Jersey Red', 'Red sports jersey with moisture-wicking fabric', 1200.00, '/images/jersey-red.jpg', 'jersey', (SELECT id FROM subcategories WHERE slug = 'jersey' LIMIT 1), 40, true),
('Football Jersey Blue', 'Blue football jersey with team design', 1500.00, '/images/jersey-football-blue.jpg', 'jersey', (SELECT id FROM subcategories WHERE slug = 'jersey' LIMIT 1), 35, true),
('Basketball Jersey White', 'White basketball jersey with breathable material', 1300.00, '/images/jersey-basketball-white.jpg', 'jersey', (SELECT id FROM subcategories WHERE slug = 'jersey' LIMIT 1), 45, true),
('Cricket Jersey Green', 'Green cricket jersey with official design', 1400.00, '/images/jersey-cricket-green.jpg', 'jersey', (SELECT id FROM subcategories WHERE slug = 'jersey' LIMIT 1), 30, true)
ON CONFLICT (name) DO NOTHING;

-- Also add some products for the main casual category
INSERT INTO public.products (name, description, price, image_url, category, stock, active) VALUES
('Casual Wear Collection', 'Complete casual wear collection for everyday use', 2500.00, '/images/casual-collection.jpg', 'casual', 20, true),
('Casual Combo Pack', 'Casual combo pack with t-shirts and accessories', 1800.00, '/images/casual-combo.jpg', 'casual', 25, true)
ON CONFLICT (name) DO NOTHING;
