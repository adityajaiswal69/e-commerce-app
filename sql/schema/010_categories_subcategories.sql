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

-- Insert common uniform categories and subcategories
INSERT INTO public.categories (name, slug, description, display_order) VALUES
('Hospitality', 'hospitality', 'Uniforms for hotels, restaurants, and hospitality industry', 1),
('Healthcare', 'healthcare', 'Medical and healthcare professional uniforms', 2),
('Corporate', 'corporate', 'Business and office wear uniforms', 3),
('Education', 'education', 'School and educational institution uniforms', 4),
('Industrial', 'industrial', 'Factory, construction and industrial uniforms', 5),
('Security', 'security', 'Security and safety personnel uniforms', 6),
('Events', 'events', 'Event staff and promotional uniforms', 7);

-- Insert subcategories for Hospitality
INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Chef Coats', 'chef-coats', 1 FROM public.categories WHERE slug = 'hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Waiter Uniforms', 'waiter-uniforms', 2 FROM public.categories WHERE slug = 'hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Housekeeping', 'housekeeping', 3 FROM public.categories WHERE slug = 'hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Front Desk', 'front-desk', 4 FROM public.categories WHERE slug = 'hospitality';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Bartender', 'bartender', 5 FROM public.categories WHERE slug = 'hospitality';

-- Insert subcategories for Healthcare
INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Doctor Coats', 'doctor-coats', 1 FROM public.categories WHERE slug = 'healthcare';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Nurse Uniforms', 'nurse-uniforms', 2 FROM public.categories WHERE slug = 'healthcare';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Scrubs', 'scrubs', 3 FROM public.categories WHERE slug = 'healthcare';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Lab Coats', 'lab-coats', 4 FROM public.categories WHERE slug = 'healthcare';

-- Insert subcategories for Corporate
INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Business Suits', 'business-suits', 1 FROM public.categories WHERE slug = 'corporate';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Formal Shirts', 'formal-shirts', 2 FROM public.categories WHERE slug = 'corporate';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Blazers', 'blazers', 3 FROM public.categories WHERE slug = 'corporate';

INSERT INTO public.subcategories (category_id, name, slug, display_order) 
SELECT id, 'Corporate T-shirts', 'corporate-tshirts', 4 FROM public.categories WHERE slug = 'corporate';

-- Add more subcategories for other categories as needed
