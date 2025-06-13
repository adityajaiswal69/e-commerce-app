-- Add missing index for display_order columns
CREATE INDEX IF NOT EXISTS categories_display_order_idx ON public.categories(display_order);
CREATE INDEX IF NOT EXISTS subcategories_display_order_idx ON public.subcategories(display_order);

-- Ensure RLS policies allow viewing categories and subcategories for all users
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
    DROP POLICY IF EXISTS "Anyone can view subcategories" ON public.subcategories;
    
    -- Create policies that ensure anyone can view categories and subcategories
    CREATE POLICY "Anyone can view categories" 
        ON public.categories FOR SELECT 
        USING (true);
        
    CREATE POLICY "Anyone can view subcategories" 
        ON public.subcategories FOR SELECT 
        USING (true);
END $$;
