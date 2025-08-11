-- =====================================================
-- DATABASE VIEWS
-- =====================================================
-- Views for common queries and data access patterns
-- =====================================================

-- Personalized products view
CREATE OR REPLACE VIEW personalized_products AS
SELECT
  p.*,
  match_user_preferences(p.id, auth.uid()) as match_score
FROM products p
WHERE active = true
ORDER BY match_score DESC;

-- Product with images view
CREATE OR REPLACE VIEW product_with_images AS
SELECT
  p.*,
  CASE
    WHEN p.front_image_url IS NOT NULL THEN p.front_image_url
    ELSE p.image_url
  END as display_front_image,
  p.back_image_url as display_back_image,
  p.left_image_url as display_left_image,
  p.right_image_url as display_right_image
FROM public.products p;

-- Order summary view
CREATE OR REPLACE VIEW order_summary AS
SELECT
  o.*,
  COUNT(oi.id) as item_count,
  SUM(oi.quantity) as total_quantity
FROM public.orders o
LEFT JOIN public.order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.user_id, o.order_number, o.status, o.payment_status, 
         o.payment_method, o.subtotal, o.tax_amount, o.shipping_amount, 
         o.discount_amount, o.total_amount, o.currency, o.shipping_address, 
         o.billing_address, o.notes, o.created_at, o.updated_at;

-- Product category summary view
CREATE OR REPLACE VIEW product_category_summary AS
SELECT
  c.id as category_id,
  c.name as category_name,
  c.slug as category_slug,
  COUNT(p.id) as product_count,
  AVG(p.price) as avg_price,
  MIN(p.price) as min_price,
  MAX(p.price) as max_price
FROM public.categories c
LEFT JOIN public.products p ON c.name = p.category AND p.active = true
GROUP BY c.id, c.name, c.slug;

-- User activity summary view
CREATE OR REPLACE VIEW user_activity_summary AS
SELECT
  u.id as user_id,
  p.full_name,
  p.role,
  COUNT(DISTINCT o.id) as total_orders,
  COUNT(DISTINCT d.id) as total_designs,
  COUNT(DISTINCT r.id) as total_reviews,
  SUM(o.total_amount) as total_spent,
  MAX(o.created_at) as last_order_date
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.orders o ON u.id = o.user_id
LEFT JOIN public.designs d ON u.id = d.user_id
LEFT JOIN public.reviews r ON u.id = r.user_id
GROUP BY u.id, p.full_name, p.role;

-- Grant access to views
GRANT SELECT ON personalized_products TO authenticated;
GRANT SELECT ON personalized_products TO anon;
GRANT SELECT ON product_with_images TO authenticated;
GRANT SELECT ON product_with_images TO anon;
GRANT SELECT ON order_summary TO authenticated;
GRANT SELECT ON product_category_summary TO authenticated;
GRANT SELECT ON product_category_summary TO anon;
GRANT SELECT ON user_activity_summary TO authenticated; 