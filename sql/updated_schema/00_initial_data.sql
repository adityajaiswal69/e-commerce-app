-- =====================================================
-- INITIAL DATA
-- =====================================================
-- Default data for the e-commerce uniform store
-- =====================================================

-- Insert default payment settings
INSERT INTO public.payment_settings (provider, is_active, is_test_mode, settings) VALUES
('razorpay', false, true, '{"key_id": "", "key_secret": "", "webhook_secret": ""}'),
('stripe', false, true, '{"publishable_key": "", "secret_key": "", "webhook_secret": ""}'),
('paytm', false, true, '{"merchant_id": "", "merchant_key": "", "website": "", "industry_type": ""}'),
('cod', true, false, '{"enabled": true}')
ON CONFLICT (provider) DO NOTHING;

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
('Apron', 'apron', 'Various types of aprons for different industries', 10)
ON CONFLICT (slug) DO NOTHING;

-- Insert subcategories for Hotel/Hospitality
INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Milk Uniform', 'milk-uniform', 1 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Maintenance Uniform', 'maintenance-uniform', 2 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Kitchen Uniform', 'kitchen-uniform', 3 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Chef Uniform', 'chef-uniform', 4 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'F&B GSA/Waiter', 'fb-gsa-waiter', 5 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Pool - Uniform', 'pool-uniform', 6 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Spa - Uniform', 'spa-uniform', 7 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Manager', 'manager', 8 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Bell Boy', 'bell-boy', 9 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Valet Uniform', 'valet-uniform', 10 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Hostess Uniform', 'hostess-uniform', 11 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Security Guard Uniform', 'security-guard-uniform', 12 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Back Office', 'back-office', 13 FROM public.categories WHERE slug = 'hotel-hospitality'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert subcategories for Hospital Uniform
INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Doctor Coat', 'doctor-coat', 1 FROM public.categories WHERE slug = 'hospital-uniform'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Nurse Uniform', 'nurse-uniform', 2 FROM public.categories WHERE slug = 'hospital-uniform'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Patient Uniform', 'patient-uniform', 3 FROM public.categories WHERE slug = 'hospital-uniform'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Back Office', 'back-office-hospital', 4 FROM public.categories WHERE slug = 'hospital-uniform'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert subcategories for Medical Factory
INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Factory Workers', 'factory-workers', 1 FROM public.categories WHERE slug = 'medical-factory'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert subcategories for Apron
INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'KSt Apron', 'kst-apron', 1 FROM public.categories WHERE slug = 'apron'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Chef Apron', 'chef-apron', 2 FROM public.categories WHERE slug = 'apron'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Leather Apron', 'leather-apron', 3 FROM public.categories WHERE slug = 'apron'
ON CONFLICT (category_id, slug) DO NOTHING;

INSERT INTO public.subcategories (category_id, name, slug, display_order)
SELECT id, 'Cafe Apron', 'cafe-apron', 4 FROM public.categories WHERE slug = 'apron'
ON CONFLICT (category_id, slug) DO NOTHING;

-- Insert default cancellation reasons
INSERT INTO public.cancellation_reasons (reason, description, display_order) VALUES
('delivery_delay', 'The delivery is taking longer than expected', 1),
('no_longer_needed', 'I no longer need the product', 2),
('change_of_mind', 'I changed my mind about the purchase', 3),
('purchased_elsewhere', 'I have already bought the product from another source due to urgency', 4),
('time_sensitive_requirement', 'The product was for a specific occasion, which has now passed', 5),
('wrong_item', 'Ordered wrong item/size/color', 6),
('financial_reasons', 'Financial constraints', 7),
('duplicate_order', 'Accidentally placed duplicate order', 8),
('quality_concerns', 'Concerns about product quality', 9),
('other', 'Other reason (please specify)', 10)
ON CONFLICT (reason) DO NOTHING;

-- Insert default art categories
INSERT INTO public.art_categories (name, slug, icon_url, active) VALUES
('Emojis', 'emojis', '/icons/emoji.svg', true),
('Shapes', 'shapes', '/icons/shapes.svg', true),
('Icons', 'icons', '/icons/icons.svg', true),
('Logos', 'logos', '/icons/logos.svg', true),
('Text', 'text', '/icons/text.svg', true)
ON CONFLICT (slug) DO NOTHING; 