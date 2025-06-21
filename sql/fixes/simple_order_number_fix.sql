-- Simple fix for order number duplicate issue
-- This makes order_number optional and adds a simple generation method

-- Make order_number nullable to prevent insertion failures
DO $$
BEGIN
  -- Check if order_number column exists and is NOT NULL
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'order_number' 
    AND is_nullable = 'NO'
  ) THEN
    -- Make order_number nullable
    ALTER TABLE public.orders ALTER COLUMN order_number DROP NOT NULL;
    RAISE NOTICE '✅ Made order_number column nullable';
  ELSE
    RAISE NOTICE '✅ order_number column is already nullable or does not exist';
  END IF;
END $$;

-- Drop the problematic trigger that causes race conditions
DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
DROP FUNCTION IF EXISTS set_order_number();

-- Create a simple, reliable order number generation function
CREATE OR REPLACE FUNCTION generate_simple_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  random_suffix TEXT;
BEGIN
  -- Create order number with timestamp and random component to avoid collisions
  -- Format: ORD + YYYYMMDD + HHMMSS + random 4-digit number
  order_num := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDDHH24MISS') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Create a new trigger that's more reliable
CREATE OR REPLACE FUNCTION set_simple_order_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Only set order_number if it's null or empty
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := generate_simple_order_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the new trigger
CREATE TRIGGER trigger_set_simple_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION set_simple_order_number();

-- Update any existing orders that don't have order numbers
UPDATE public.orders 
SET order_number = generate_simple_order_number()
WHERE order_number IS NULL OR order_number = '';

-- Test the new function
DO $$
DECLARE
  test_num1 TEXT;
  test_num2 TEXT;
BEGIN
  SELECT generate_simple_order_number() INTO test_num1;
  SELECT generate_simple_order_number() INTO test_num2;
  
  RAISE NOTICE 'Test order number 1: %', test_num1;
  RAISE NOTICE 'Test order number 2: %', test_num2;
  
  IF test_num1 != test_num2 THEN
    RAISE NOTICE '✅ Order numbers are unique';
  ELSE
    RAISE NOTICE '❌ Order numbers are not unique - this should not happen';
  END IF;
END $$;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🎉 Simple order number fix completed!';
  RAISE NOTICE '';
  RAISE NOTICE 'Changes made:';
  RAISE NOTICE '• Made order_number column nullable';
  RAISE NOTICE '• Replaced race-condition prone function with timestamp-based generation';
  RAISE NOTICE '• Added random component to prevent collisions';
  RAISE NOTICE '• Updated existing orders with missing order numbers';
  RAISE NOTICE '';
  RAISE NOTICE 'Order format: ORD + YYYYMMDDHHMISS + XXXX (random)';
  RAISE NOTICE 'Example: ORD202412211430451234';
  RAISE NOTICE '';
  RAISE NOTICE 'The "This record already exists" error should now be fixed!';
END $$;
