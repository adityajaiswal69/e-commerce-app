-- Sample products organized by navigation categories
-- This script adds sample products for each category and subcategory

-- Hotel/Hospitality Uniforms - Using subcategory slugs as category for direct filtering
INSERT INTO public.products (name, description, price, image_url, category, subcategory_id, stock, active) VALUES
-- Chef Uniforms (category = 'chef-uniform' for direct filtering)
('Professional Chef Coat White', 'Premium white chef coat with double-breasted design and heat-resistant fabric', 2500.00, '/images/chef-coat-white.jpg', 'chef-uniform', (SELECT id FROM subcategories WHERE slug = 'chef-uniform' LIMIT 1), 50, true),
('Executive Chef Jacket Black', 'Executive chef jacket in black with embroidered details', 3200.00, '/images/chef-jacket-black.jpg', 'chef-uniform', (SELECT id FROM subcategories WHERE slug = 'chef-uniform' LIMIT 1), 30, true),

-- Kitchen Uniforms (category = 'kitchen-uniform' for direct filtering)
('Kitchen Staff Uniform Set', 'Complete kitchen uniform set with apron and hat', 1800.00, '/images/kitchen-uniform-set.jpg', 'kitchen-uniform', (SELECT id FROM subcategories WHERE slug = 'kitchen-uniform' LIMIT 1), 40, true),
('Kitchen Helper Apron', 'Durable kitchen helper apron with multiple pockets', 800.00, '/images/kitchen-apron.jpg', 'kitchen-uniform', (SELECT id FROM subcategories WHERE slug = 'kitchen-uniform' LIMIT 1), 60, true),

-- Waiter/F&B Uniforms (category = 'fb-gsa-waiter' for direct filtering)
('Waiter Uniform Black & White', 'Classic waiter uniform with bow tie and vest', 2200.00, '/images/waiter-uniform-bw.jpg', 'fb-gsa-waiter', (SELECT id FROM subcategories WHERE slug = 'fb-gsa-waiter' LIMIT 1), 35, true),
('Restaurant Server Uniform', 'Modern restaurant server uniform with comfortable fit', 1900.00, '/images/server-uniform.jpg', 'fb-gsa-waiter', (SELECT id FROM subcategories WHERE slug = 'fb-gsa-waiter' LIMIT 1), 45, true),

-- Manager Uniforms (category = 'manager' for direct filtering)
('Hotel Manager Suit Navy', 'Professional hotel manager suit in navy blue', 4500.00, '/images/manager-suit-navy.jpg', 'manager', (SELECT id FROM subcategories WHERE slug = 'manager' LIMIT 1), 20, true),
('Front Office Manager Blazer', 'Elegant front office manager blazer with hotel branding', 3800.00, '/images/manager-blazer.jpg', 'manager', (SELECT id FROM subcategories WHERE slug = 'manager' LIMIT 1), 25, true),

-- Bell Boy Uniforms (category = 'bell-boy' for direct filtering)
('Traditional Bell Boy Uniform', 'Classic bell boy uniform with gold buttons and cap', 3000.00, '/images/bellboy-uniform.jpg', 'bell-boy', (SELECT id FROM subcategories WHERE slug = 'bell-boy' LIMIT 1), 15, true),

-- Housekeeping/Maintenance (category = 'maintenance-uniform' for direct filtering)
('Housekeeping Uniform Pink', 'Comfortable housekeeping uniform in pink with apron', 1500.00, '/images/housekeeping-pink.jpg', 'maintenance-uniform', (SELECT id FROM subcategories WHERE slug = 'maintenance-uniform' LIMIT 1), 50, true),
('Maintenance Staff Coverall', 'Durable maintenance coverall with tool pockets', 2000.00, '/images/maintenance-coverall.jpg', 'maintenance-uniform', (SELECT id FROM subcategories WHERE slug = 'maintenance-uniform' LIMIT 1), 30, true);

-- Also add some products for the main hotel-hospitality category (for when they click the parent category)
INSERT INTO public.products (name, description, price, image_url, category, stock, active) VALUES
('Hotel Uniform Collection', 'Complete hotel uniform collection for all departments', 5000.00, '/images/hotel-collection.jpg', 'hotel-hospitality', 10, true),
('Hospitality Staff Package', 'Comprehensive hospitality staff uniform package', 4200.00, '/images/hospitality-package.jpg', 'hotel-hospitality', 15, true);

-- Hospital Uniforms - Using subcategory slugs as category for direct filtering
INSERT INTO public.products (name, description, price, image_url, category, subcategory_id, stock, active) VALUES
-- Doctor Coats (category = 'doctor-coat' for direct filtering)
('White Doctor Coat Long', 'Professional long white doctor coat with multiple pockets', 3500.00, '/images/doctor-coat-long.jpg', 'doctor-coat', (SELECT id FROM subcategories WHERE slug = 'doctor-coat' LIMIT 1), 40, true),
('Doctor Lab Coat Short', 'Short white lab coat for doctors and medical professionals', 2800.00, '/images/doctor-coat-short.jpg', 'doctor-coat', (SELECT id FROM subcategories WHERE slug = 'doctor-coat' LIMIT 1), 55, true),

-- Nurse Uniforms (category = 'nurse-uniform' for direct filtering)
('Nurse Scrub Set Blue', 'Comfortable nurse scrub set in medical blue', 2200.00, '/images/nurse-scrub-blue.jpg', 'nurse-uniform', (SELECT id FROM subcategories WHERE slug = 'nurse-uniform' LIMIT 1), 60, true),
('Nurse Uniform White Traditional', 'Traditional white nurse uniform with cap', 2500.00, '/images/nurse-uniform-white.jpg', 'nurse-uniform', (SELECT id FROM subcategories WHERE slug = 'nurse-uniform' LIMIT 1), 35, true),

-- Patient Uniforms (category = 'patient-uniform' for direct filtering)
('Patient Gown Cotton', 'Comfortable cotton patient gown with easy access', 800.00, '/images/patient-gown.jpg', 'patient-uniform', (SELECT id FROM subcategories WHERE slug = 'patient-uniform' LIMIT 1), 100, true);

-- Also add some products for the main hospital-uniform category
INSERT INTO public.products (name, description, price, image_url, category, stock, active) VALUES
('Hospital Uniform Complete Set', 'Complete hospital uniform set for medical professionals', 4500.00, '/images/hospital-complete-set.jpg', 'hospital-uniform', 20, true),
('Medical Staff Package', 'Comprehensive medical staff uniform package', 3800.00, '/images/medical-staff-package.jpg', 'hospital-uniform', 25, true);

-- School Uniforms
INSERT INTO public.products (name, description, price, image_url, category, stock, active) VALUES
('School Shirt White Boys', 'White school shirt for boys with collar and pocket', 600.00, '/images/school-shirt-boys.jpg', 'school', 80, true),
('School Shirt White Girls', 'White school shirt for girls with proper fit', 600.00, '/images/school-shirt-girls.jpg', 'school', 75, true),
('School Trouser Navy Boys', 'Navy blue school trouser for boys', 900.00, '/images/school-trouser-boys.jpg', 'school', 60, true),
('School Skirt Navy Girls', 'Navy blue school skirt for girls', 800.00, '/images/school-skirt-girls.jpg', 'school', 65, true),
('School Blazer Navy', 'Navy blue school blazer with school emblem', 1800.00, '/images/school-blazer.jpg', 'school', 40, true);

-- Corporate Uniforms
INSERT INTO public.products (name, description, price, image_url, category, stock, active) VALUES
('Corporate Shirt White Men', 'Professional white corporate shirt for men', 1200.00, '/images/corporate-shirt-men.jpg', 'corporate', 70, true),
('Corporate Shirt White Women', 'Professional white corporate shirt for women', 1200.00, '/images/corporate-shirt-women.jpg', 'corporate', 65, true),
('Corporate Blazer Black Men', 'Black corporate blazer for men', 3500.00, '/images/corporate-blazer-men.jpg', 'corporate', 30, true),
('Corporate Blazer Black Women', 'Black corporate blazer for women', 3500.00, '/images/corporate-blazer-women.jpg', 'corporate', 28, true),
('Corporate Trouser Formal', 'Formal corporate trouser in charcoal grey', 1800.00, '/images/corporate-trouser.jpg', 'corporate', 50, true);

-- Aprons - Using subcategory slugs as category for direct filtering
INSERT INTO public.products (name, description, price, image_url, category, subcategory_id, stock, active) VALUES
-- Chef Aprons (category = 'chef-apron' for direct filtering)
('Professional Chef Apron Black', 'Professional black chef apron with adjustable straps', 1200.00, '/images/chef-apron-black.jpg', 'chef-apron', (SELECT id FROM subcategories WHERE slug = 'chef-apron' LIMIT 1), 80, true),
('Chef Apron White Cotton', 'White cotton chef apron with front pocket', 900.00, '/images/chef-apron-white.jpg', 'chef-apron', (SELECT id FROM subcategories WHERE slug = 'chef-apron' LIMIT 1), 90, true),

-- Cafe Aprons (category = 'cafe-apron' for direct filtering)
('Cafe Server Apron Brown', 'Stylish brown cafe server apron with ties', 800.00, '/images/cafe-apron-brown.jpg', 'cafe-apron', (SELECT id FROM subcategories WHERE slug = 'cafe-apron' LIMIT 1), 60, true),
('Barista Apron Denim', 'Trendy denim barista apron with tool pockets', 1100.00, '/images/barista-apron-denim.jpg', 'cafe-apron', (SELECT id FROM subcategories WHERE slug = 'cafe-apron' LIMIT 1), 45, true),

-- Leather Aprons (category = 'leather-apron' for direct filtering)
('Leather Work Apron Heavy Duty', 'Heavy duty leather work apron for industrial use', 2500.00, '/images/leather-apron-heavy.jpg', 'leather-apron', (SELECT id FROM subcategories WHERE slug = 'leather-apron' LIMIT 1), 25, true),
('Leather Craft Apron', 'Premium leather craft apron for artisans', 2200.00, '/images/leather-apron-craft.jpg', 'leather-apron', (SELECT id FROM subcategories WHERE slug = 'leather-apron' LIMIT 1), 30, true);

-- Also add some products for the main apron category
INSERT INTO public.products (name, description, price, image_url, category, stock, active) VALUES
('Apron Collection Set', 'Complete apron collection for various uses', 2800.00, '/images/apron-collection.jpg', 'apron', 20, true),
('Multi-Purpose Apron Pack', 'Multi-purpose apron pack for different industries', 2200.00, '/images/multipurpose-apron.jpg', 'apron', 30, true);

-- Restaurant/Cafe/Pub Uniforms
INSERT INTO public.products (name, description, price, image_url, category, stock, active) VALUES
('Restaurant Manager Uniform', 'Professional restaurant manager uniform set', 3200.00, '/images/restaurant-manager.jpg', 'restaurant-cafe-pub', 25, true),
('Pub Staff Uniform Casual', 'Casual pub staff uniform with branded polo', 1500.00, '/images/pub-staff-uniform.jpg', 'restaurant-cafe-pub', 40, true),
('Cafe Uniform Trendy', 'Trendy cafe uniform with modern design', 1800.00, '/images/cafe-uniform-trendy.jpg', 'restaurant-cafe-pub', 35, true);

-- Automobile Industry
INSERT INTO public.products (name, description, price, image_url, category, stock, active) VALUES
('Mechanic Coverall Blue', 'Durable blue mechanic coverall with tool pockets', 2200.00, '/images/mechanic-coverall.jpg', 'automobile', 45, true),
('Auto Service Uniform', 'Professional auto service uniform with company branding', 1800.00, '/images/auto-service-uniform.jpg', 'automobile', 50, true),
('Car Wash Uniform', 'Water-resistant car wash uniform', 1200.00, '/images/car-wash-uniform.jpg', 'automobile', 60, true);

-- Medical Factory
INSERT INTO public.products (name, description, price, image_url, category, subcategory_id, stock, active) VALUES
('Factory Worker Uniform Clean Room', 'Clean room factory worker uniform for medical manufacturing', 2800.00, '/images/factory-cleanroom.jpg', 'medical-factory', (SELECT id FROM subcategories WHERE slug = 'factory-workers' LIMIT 1), 35, true),
('Medical Factory Coverall', 'Sterile medical factory coverall with hood', 3200.00, '/images/medical-factory-coverall.jpg', 'medical-factory', (SELECT id FROM subcategories WHERE slug = 'factory-workers' LIMIT 1), 25, true);

-- Catering Uniforms
INSERT INTO public.products (name, description, price, image_url, category, stock, active) VALUES
('Catering Staff Uniform Black', 'Professional black catering staff uniform', 2000.00, '/images/catering-uniform-black.jpg', 'catering-uniform', 40, true),
('Event Catering Uniform', 'Elegant event catering uniform for special occasions', 2500.00, '/images/event-catering-uniform.jpg', 'catering-uniform', 30, true);

-- Speciality Industry
INSERT INTO public.products (name, description, price, image_url, category, stock, active) VALUES
('Safety Uniform High Visibility', 'High visibility safety uniform for construction', 1800.00, '/images/safety-uniform-hiviz.jpg', 'speciality-industry', 50, true),
('Industrial Worker Uniform', 'Heavy duty industrial worker uniform', 2200.00, '/images/industrial-uniform.jpg', 'speciality-industry', 40, true),
('Security Guard Uniform', 'Professional security guard uniform with badges', 2800.00, '/images/security-uniform.jpg', 'speciality-industry', 35, true);
