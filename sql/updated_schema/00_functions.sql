-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================
-- Functions used throughout the schema
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating user profile: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate order numbers (atomic, prevents race conditions)
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  seq_val BIGINT;
  date_part TEXT;
BEGIN
  date_part := TO_CHAR(NOW(), 'YYYYMMDD');
  seq_val := nextval('order_number_seq');
  order_num := 'ORD' || date_part || LPAD(seq_val::TEXT, 6, '0');
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function to set order number
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := generate_order_number();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to get sizes for category (NO SHOES)
CREATE OR REPLACE FUNCTION get_sizes_for_category(category_name TEXT)
RETURNS JSONB AS $$
BEGIN
  CASE LOWER(category_name)
    WHEN 'school-uniform', 'office-uniform', 'hospital-uniform', 'tshirt', 'shirt', 'jacket', 'blazer', 'top' THEN
      RETURN '{"top": ["XS", "S", "M", "L", "XL", "XXL"]}'::jsonb;
    WHEN 'pants', 'trousers', 'jeans', 'shorts', 'bottom' THEN
      RETURN '{"bottom": ["28", "30", "32", "34", "36", "38", "40"]}'::jsonb;
    WHEN 'apron', 'lab-coat', 'chef-uniform' THEN
      RETURN '{"top": ["S", "M", "L", "XL", "XXL"]}'::jsonb;
    ELSE
      RETURN '{"top": ["S", "M", "L", "XL"]}'::jsonb;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to get colors for category (NO SHOES)
CREATE OR REPLACE FUNCTION get_colors_for_category(category_name TEXT)
RETURNS TEXT[] AS $$
BEGIN
  CASE LOWER(category_name)
    WHEN 'school-uniform' THEN
      RETURN ARRAY['White', 'Navy Blue', 'Sky Blue', 'Grey'];
    WHEN 'office-uniform' THEN
      RETURN ARRAY['White', 'Black', 'Navy Blue', 'Grey'];
    WHEN 'hospital-uniform' THEN
      RETURN ARRAY['White', 'Light Blue', 'Green', 'Pink'];
    WHEN 'chef-uniform' THEN
      RETURN ARRAY['White', 'Black', 'Checkered'];
    WHEN 'apron' THEN
      RETURN ARRAY['White', 'Blue', 'Green', 'Red'];
    WHEN 'lab-coat' THEN
      RETURN ARRAY['White', 'Light Blue'];
    WHEN 'pants', 'trousers', 'jeans', 'shorts' THEN
      RETURN ARRAY['Black', 'Navy Blue', 'Grey', 'Khaki'];
    ELSE
      RETURN ARRAY['White', 'Black', 'Navy Blue', 'Grey'];
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to match products with user preferences
CREATE OR REPLACE FUNCTION match_user_preferences(
  product_id uuid,
  user_id uuid
) RETURNS FLOAT AS $$
DECLARE
  user_prefs RECORD;
  product RECORD;
  match_score FLOAT := 0;
BEGIN
  SELECT * FROM style_preferences WHERE user_id = $2 INTO user_prefs;
  SELECT * FROM products WHERE id = $1 INTO product;

  IF product.style && user_prefs.preferred_styles THEN
    match_score := match_score + 0.3;
  END IF;

  IF product.colors && user_prefs.preferred_colors THEN
    match_score := match_score + 0.2;
  END IF;

  IF product.occasions && user_prefs.occasion_preferences THEN
    match_score := match_score + 0.2;
  END IF;

  IF product.price BETWEEN user_prefs.budget_range[1] AND user_prefs.budget_range[2] THEN
    match_score := match_score + 0.3;
  END IF;

  RETURN match_score;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_sizes_for_category(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_colors_for_category(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION match_user_preferences(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_order_number() TO authenticated; 