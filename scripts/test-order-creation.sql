-- Test Order Creation Script
-- Run this after the permission fix to verify orders can be created

-- 1. Test basic table access
DO $$
BEGIN
    RAISE NOTICE 'Testing table access...';
    
    -- Test if we can select from orders
    PERFORM COUNT(*) FROM public.orders;
    RAISE NOTICE '✅ Can access orders table';
    
    -- Test if we can select from order_items
    PERFORM COUNT(*) FROM public.order_items;
    RAISE NOTICE '✅ Can access order_items table';
    
    -- Test if we can select from products
    PERFORM COUNT(*) FROM public.products;
    RAISE NOTICE '✅ Can access products table';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Table access error: %', SQLERRM;
END $$;

-- 2. Test order creation
DO $$
DECLARE
    test_user_id uuid;
    test_product_id uuid;
    test_order_id uuid;
    test_order_item_id uuid;
BEGIN
    RAISE NOTICE 'Testing order creation...';
    
    -- Get a test user
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE '❌ No users found in auth.users table';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using test user: %', test_user_id;
    
    -- Get or create a test product
    SELECT id INTO test_product_id FROM public.products LIMIT 1;
    
    IF test_product_id IS NULL THEN
        INSERT INTO public.products (name, price, front_image_url, description, stock)
        VALUES ('Test Product', 99.99, '/placeholder-product.jpg', 'Test product for order creation', 10)
        RETURNING id INTO test_product_id;
        
        RAISE NOTICE '✅ Created test product: %', test_product_id;
    ELSE
        RAISE NOTICE '✅ Using existing product: %', test_product_id;
    END IF;
    
    -- Try to create a test order
    INSERT INTO public.orders (
        user_id,
        order_number,
        total_amount,
        status,
        payment_status,
        payment_method,
        currency
    ) VALUES (
        test_user_id,
        'TEST-' || extract(epoch from now())::text,
        99.99,
        'pending',
        'pending',
        'test',
        'INR'
    ) RETURNING id INTO test_order_id;
    
    RAISE NOTICE '✅ Created test order: %', test_order_id;
    
    -- Try to create a test order item
    INSERT INTO public.order_items (
        order_id,
        product_id,
        quantity,
        unit_price,
        total_price,
        product_snapshot
    ) VALUES (
        test_order_id,
        test_product_id,
        1,
        99.99,
        99.99,
        '{"name": "Test Product", "price": 99.99}'::jsonb
    ) RETURNING id INTO test_order_item_id;
    
    RAISE NOTICE '✅ Created test order item: %', test_order_item_id;
    
    -- Clean up test data
    DELETE FROM public.order_items WHERE id = test_order_item_id;
    DELETE FROM public.orders WHERE id = test_order_id;
    
    RAISE NOTICE '✅ Cleaned up test data';
    RAISE NOTICE '🎉 Order creation test PASSED!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Order creation test FAILED: %', SQLERRM;
        RAISE NOTICE 'Error detail: %', SQLSTATE;
END $$;

-- 3. Check RLS policies
DO $$
DECLARE
    policy_count integer;
BEGIN
    RAISE NOTICE 'Checking RLS policies...';
    
    -- Check orders policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'orders' AND schemaname = 'public';
    
    RAISE NOTICE 'Orders table has % RLS policies', policy_count;
    
    -- Check order_items policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'order_items' AND schemaname = 'public';
    
    RAISE NOTICE 'Order_items table has % RLS policies', policy_count;
    
    -- Check products policies
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'products' AND schemaname = 'public';
    
    RAISE NOTICE 'Products table has % RLS policies', policy_count;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking policies: %', SQLERRM;
END $$;

-- 4. Check table permissions
DO $$
BEGIN
    RAISE NOTICE 'Checking table permissions...';
    
    -- Check if authenticated role has permissions
    IF EXISTS (
        SELECT 1 FROM information_schema.table_privileges 
        WHERE table_name = 'orders' 
        AND table_schema = 'public' 
        AND grantee = 'authenticated'
        AND privilege_type = 'INSERT'
    ) THEN
        RAISE NOTICE '✅ Authenticated role has INSERT permission on orders';
    ELSE
        RAISE NOTICE '❌ Authenticated role missing INSERT permission on orders';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_privileges 
        WHERE table_name = 'order_items' 
        AND table_schema = 'public' 
        AND grantee = 'authenticated'
        AND privilege_type = 'INSERT'
    ) THEN
        RAISE NOTICE '✅ Authenticated role has INSERT permission on order_items';
    ELSE
        RAISE NOTICE '❌ Authenticated role missing INSERT permission on order_items';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking permissions: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Order creation test completed!';
    RAISE NOTICE 'If you see "Order creation test PASSED!" above, the fix worked!';
    RAISE NOTICE 'You can now try creating orders through your application.';
    RAISE NOTICE '';
END $$;
