-- Add directional image fields to products table
-- This migration adds front, back, left, right image URLs directly to the products table
-- for simpler image management and faster queries

-- Add directional image columns to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS front_image_url TEXT,
ADD COLUMN IF NOT EXISTS back_image_url TEXT,
ADD COLUMN IF NOT EXISTS left_image_url TEXT,
ADD COLUMN IF NOT EXISTS right_image_url TEXT;

-- Create indexes for better performance on image queries
CREATE INDEX IF NOT EXISTS products_front_image_idx ON public.products (front_image_url);
CREATE INDEX IF NOT EXISTS products_back_image_idx ON public.products (back_image_url);
CREATE INDEX IF NOT EXISTS products_left_image_idx ON public.products (left_image_url);
CREATE INDEX IF NOT EXISTS products_right_image_idx ON public.products (right_image_url);

-- Migrate existing image_url to front_image_url for existing products
UPDATE public.products 
SET front_image_url = image_url 
WHERE front_image_url IS NULL AND image_url IS NOT NULL;

-- Create a function to get all product images in a structured format
CREATE OR REPLACE FUNCTION get_product_directional_images(product_uuid uuid)
RETURNS TABLE (
  front_image TEXT,
  back_image TEXT,
  left_image TEXT,
  right_image TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    front_image_url as front_image,
    back_image_url as back_image,
    left_image_url as left_image,
    right_image_url as right_image
  FROM public.products 
  WHERE id = product_uuid;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update directional images
CREATE OR REPLACE FUNCTION update_product_directional_image(
  product_uuid uuid,
  image_direction TEXT,
  image_url_param TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Validate image_direction
  IF image_direction NOT IN ('front', 'back', 'left', 'right') THEN
    RAISE EXCEPTION 'Invalid image_direction. Must be one of: front, back, left, right';
  END IF;

  -- Update the appropriate column based on direction
  CASE image_direction
    WHEN 'front' THEN
      UPDATE public.products 
      SET front_image_url = image_url_param,
          image_url = image_url_param, -- Keep main image_url in sync with front
          updated_at = timezone('utc'::text, now())
      WHERE id = product_uuid;
    WHEN 'back' THEN
      UPDATE public.products 
      SET back_image_url = image_url_param,
          updated_at = timezone('utc'::text, now())
      WHERE id = product_uuid;
    WHEN 'left' THEN
      UPDATE public.products 
      SET left_image_url = image_url_param,
          updated_at = timezone('utc'::text, now())
      WHERE id = product_uuid;
    WHEN 'right' THEN
      UPDATE public.products 
      SET right_image_url = image_url_param,
          updated_at = timezone('utc'::text, now())
      WHERE id = product_uuid;
  END CASE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Create a function to clear a directional image
CREATE OR REPLACE FUNCTION clear_product_directional_image(
  product_uuid uuid,
  image_direction TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Validate image_direction
  IF image_direction NOT IN ('front', 'back', 'left', 'right') THEN
    RAISE EXCEPTION 'Invalid image_direction. Must be one of: front, back, left, right';
  END IF;

  -- Clear the appropriate column based on direction
  CASE image_direction
    WHEN 'front' THEN
      UPDATE public.products 
      SET front_image_url = NULL,
          updated_at = timezone('utc'::text, now())
      WHERE id = product_uuid;
    WHEN 'back' THEN
      UPDATE public.products 
      SET back_image_url = NULL,
          updated_at = timezone('utc'::text, now())
      WHERE id = product_uuid;
    WHEN 'left' THEN
      UPDATE public.products 
      SET left_image_url = NULL,
          updated_at = timezone('utc'::text, now())
      WHERE id = product_uuid;
    WHEN 'right' THEN
      UPDATE public.products 
      SET right_image_url = NULL,
          updated_at = timezone('utc'::text, now())
      WHERE id = product_uuid;
  END CASE;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  
  RETURN updated_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_product_directional_images(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION update_product_directional_image(uuid, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION clear_product_directional_image(uuid, TEXT) TO authenticated;

-- Add helpful comments
COMMENT ON COLUMN public.products.front_image_url IS 'URL for the front view image of the product';
COMMENT ON COLUMN public.products.back_image_url IS 'URL for the back view image of the product';
COMMENT ON COLUMN public.products.left_image_url IS 'URL for the left side view image of the product';
COMMENT ON COLUMN public.products.right_image_url IS 'URL for the right side view image of the product';

-- Create a view for easy access to all product data including directional images
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

-- Grant access to the view
GRANT SELECT ON product_with_images TO authenticated;
GRANT SELECT ON product_with_images TO anon;
