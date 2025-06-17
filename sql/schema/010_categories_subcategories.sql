-- Create categories table
CREATE TABLE public.categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create subcategories table with foreign key to categories
CREATE TABLE public.subcategories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES public.categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(category_id, slug)
);

-- Add indexes
CREATE INDEX categories_slug_idx ON public.categories(slug);
CREATE INDEX subcategories_slug_idx ON public.subcategories(slug);
CREATE INDEX subcategories_category_id_idx ON public.subcategories(category_id);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Anyone can view categories" 
  ON public.categories FOR SELECT 
  USING (true);

CREATE POLICY "Admin users can manage categories" 
  ON public.categories FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create policies for subcategories
CREATE POLICY "Anyone can view subcategories" 
  ON public.subcategories FOR SELECT 
  USING (true);

CREATE POLICY "Admin users can manage subcategories" 
  ON public.subcategories FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Modify products table to reference subcategories
ALTER TABLE public.products 
ADD COLUMN subcategory_id uuid REFERENCES public.subcategories(id);

-- Create index on the new column
CREATE INDEX products_subcategory_id_idx ON public.products(subcategory_id);

-- Add multiple images support
CREATE TABLE public.product_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Create policies for product_images
CREATE POLICY "Anyone can view product images" 
  ON public.product_images FOR SELECT 
  USING (true);

CREATE POLICY "Admin users can manage product images" 
  ON public.product_images FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index
CREATE INDEX product_images_product_id_idx ON public.product_images(product_id);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now(); 
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_modtime
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_subcategories_modtime
BEFORE UPDATE ON public.subcategories
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

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
