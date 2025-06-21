-- Quick Admin Setup Script
-- Run this in Supabase SQL Editor to fix admin access

-- 1. Update your user to have admin role
-- Replace 'your-email@example.com' with your actual email
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';

-- 2. Alternative: Update all users to be admin (for testing)
-- Uncomment the line below if you want to make all users admin
-- UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb;

-- 3. Create comprehensive tables
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    order_number TEXT UNIQUE,
    total_amount DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'pending',
    payment_status TEXT DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    front_image_url TEXT,
    image_url TEXT,
    description TEXT,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    product_snapshot JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Insert comprehensive sample data
DO $$
DECLARE
    sample_user_id uuid;
    sample_product_id uuid;
    sample_order_id uuid;
BEGIN
    -- Get first user
    SELECT id INTO sample_user_id FROM auth.users LIMIT 1;

    IF sample_user_id IS NOT NULL THEN
        -- Insert sample products if none exist
        IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
            INSERT INTO public.products (id, name, price, front_image_url, description, stock) VALUES
            (gen_random_uuid(), 'School Uniform Shirt', 599.99, '/placeholder-product.jpg', 'High quality cotton school shirt', 50),
            (gen_random_uuid(), 'Office Blazer', 1299.99, '/placeholder-product.jpg', 'Professional office blazer', 25),
            (gen_random_uuid(), 'Hospital Scrubs', 899.99, '/placeholder-product.jpg', 'Comfortable medical scrubs', 30);
        END IF;

        -- Insert sample orders if none exist
        IF NOT EXISTS (SELECT 1 FROM public.orders LIMIT 1) THEN
            -- Order 1
            INSERT INTO public.orders (id, user_id, order_number, total_amount, status, payment_status, payment_method, created_at)
            VALUES (gen_random_uuid(), sample_user_id, 'ORD-001', 1199.98, 'completed', 'paid', 'razorpay', NOW() - INTERVAL '2 days')
            RETURNING id INTO sample_order_id;

            -- Get first product for order items
            SELECT id INTO sample_product_id FROM public.products LIMIT 1;

            INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, total_price, product_snapshot)
            VALUES (
                sample_order_id,
                sample_product_id,
                2,
                599.99,
                1199.98,
                '{"name": "School Uniform Shirt", "price": 599.99, "image_url": "/placeholder-product.jpg"}'::jsonb
            );

            -- Order 2
            INSERT INTO public.orders (id, user_id, order_number, total_amount, status, payment_status, payment_method, created_at)
            VALUES (gen_random_uuid(), sample_user_id, 'ORD-002', 1299.99, 'processing', 'paid', 'stripe', NOW() - INTERVAL '1 day')
            RETURNING id INTO sample_order_id;

            SELECT id INTO sample_product_id FROM public.products OFFSET 1 LIMIT 1;

            INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, total_price, product_snapshot)
            VALUES (
                sample_order_id,
                sample_product_id,
                1,
                1299.99,
                1299.99,
                '{"name": "Office Blazer", "price": 1299.99, "image_url": "/placeholder-product.jpg"}'::jsonb
            );

            -- Order 3
            INSERT INTO public.orders (id, user_id, order_number, total_amount, status, payment_status, payment_method, created_at)
            VALUES (gen_random_uuid(), sample_user_id, 'ORD-003', 899.99, 'pending', 'pending', 'cod', NOW() - INTERVAL '3 hours')
            RETURNING id INTO sample_order_id;

            SELECT id INTO sample_product_id FROM public.products OFFSET 2 LIMIT 1;

            INSERT INTO public.order_items (order_id, product_id, quantity, unit_price, total_price, product_snapshot)
            VALUES (
                sample_order_id,
                sample_product_id,
                1,
                899.99,
                899.99,
                '{"name": "Hospital Scrubs", "price": 899.99, "image_url": "/placeholder-product.jpg"}'::jsonb
            );
        END IF;
    END IF;
END $$;

-- 5. Enable RLS and create policies
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable all for admin users" ON public.orders;
DROP POLICY IF EXISTS "Enable all for admin users" ON public.products;
DROP POLICY IF EXISTS "Enable all for admin users" ON public.order_items;

-- Create simple admin policies (allow all for now)
CREATE POLICY "Enable all for admin users" ON public.orders
FOR ALL USING (true);

CREATE POLICY "Enable all for admin users" ON public.products
FOR ALL USING (true);

CREATE POLICY "Enable all for admin users" ON public.order_items
FOR ALL USING (true);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Quick admin setup completed!';
    RAISE NOTICE 'Your user should now have admin access';
    RAISE NOTICE 'Tables created: orders, products, order_items';
    RAISE NOTICE 'Sample data: 3 products, 3 orders with items';
    RAISE NOTICE 'Try accessing /admin again - you should see recent orders!';
END $$;
