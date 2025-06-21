-- Test Cancellation Requests Permissions
-- Run this after the permission fix to verify everything works

-- 1. Test basic table access
DO $$
BEGIN
    RAISE NOTICE 'Testing cancellation_requests table access...';
    
    -- Test if we can select from cancellation_requests
    PERFORM COUNT(*) FROM public.cancellation_requests;
    RAISE NOTICE '✅ Can access cancellation_requests table';
    
    -- Test if we can select from orders (needed for joins)
    PERFORM COUNT(*) FROM public.orders;
    RAISE NOTICE '✅ Can access orders table';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Table access error: %', SQLERRM;
END $$;

-- 2. Test the complex query used in the admin page
DO $$
DECLARE
    request_count integer;
BEGIN
    RAISE NOTICE 'Testing complex cancellation requests query...';
    
    -- Test the exact query structure used in the admin page
    SELECT COUNT(*) INTO request_count
    FROM public.cancellation_requests cr
    INNER JOIN public.orders o ON cr.order_id = o.id
    ORDER BY cr.created_at DESC;
    
    RAISE NOTICE '✅ Complex query works - found % cancellation requests', request_count;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Complex query error: %', SQLERRM;
END $$;

-- 3. Test cancellation request creation
DO $$
DECLARE
    test_user_id uuid;
    test_order_id uuid;
    test_request_id uuid;
BEGIN
    RAISE NOTICE 'Testing cancellation request creation...';
    
    -- Get a test user
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE '❌ No users found in auth.users table';
        RETURN;
    END IF;
    
    -- Get or create a test order
    SELECT id INTO test_order_id 
    FROM public.orders 
    WHERE user_id = test_user_id 
    AND id NOT IN (SELECT order_id FROM public.cancellation_requests)
    LIMIT 1;
    
    IF test_order_id IS NULL THEN
        -- Create a new test order
        INSERT INTO public.orders (
            user_id,
            order_number,
            total_amount,
            status,
            payment_status,
            payment_method
        ) VALUES (
            test_user_id,
            'TEST-CANCEL-' || extract(epoch from now())::text,
            299.99,
            'confirmed',
            'paid',
            'test'
        ) RETURNING id INTO test_order_id;
        
        RAISE NOTICE '✅ Created test order: %', test_order_id;
    END IF;
    
    -- Try to create a test cancellation request
    INSERT INTO public.cancellation_requests (
        order_id,
        user_id,
        reason,
        additional_details,
        status
    ) VALUES (
        test_order_id,
        test_user_id,
        'Test Reason',
        'This is a test cancellation request to verify permissions work correctly.',
        'pending'
    ) RETURNING id INTO test_request_id;
    
    RAISE NOTICE '✅ Created test cancellation request: %', test_request_id;
    
    -- Test updating the cancellation request
    UPDATE public.cancellation_requests 
    SET status = 'approved', admin_notes = 'Test approval'
    WHERE id = test_request_id;
    
    RAISE NOTICE '✅ Updated test cancellation request status';
    
    -- Clean up test data
    DELETE FROM public.cancellation_requests WHERE id = test_request_id;
    DELETE FROM public.orders WHERE id = test_order_id;
    
    RAISE NOTICE '✅ Cleaned up test data';
    RAISE NOTICE '🎉 Cancellation request creation test PASSED!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Cancellation request creation test FAILED: %', SQLERRM;
        RAISE NOTICE 'Error detail: %', SQLSTATE;
END $$;

-- 4. Test admin query with user data simulation
DO $$
DECLARE
    request_record RECORD;
    request_count integer := 0;
BEGIN
    RAISE NOTICE 'Testing admin page query simulation...';
    
    -- Simulate the query used in the admin cancellation requests page
    FOR request_record IN
        SELECT 
            cr.*,
            o.id as order_id,
            o.order_number,
            o.total_amount,
            o.payment_status,
            o.payment_method,
            o.created_at as order_created_at,
            o.user_id as order_user_id
        FROM public.cancellation_requests cr
        INNER JOIN public.orders o ON cr.order_id = o.id
        ORDER BY cr.created_at DESC
        LIMIT 5
    LOOP
        request_count := request_count + 1;
        RAISE NOTICE 'Found request %: Order %, Status %, User %', 
            request_count, 
            request_record.order_number, 
            request_record.status,
            request_record.order_user_id;
    END LOOP;
    
    RAISE NOTICE '✅ Admin query simulation completed - found % requests', request_count;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Admin query simulation failed: %', SQLERRM;
END $$;

-- 5. Check RLS policies
DO $$
DECLARE
    policy_count integer;
BEGIN
    RAISE NOTICE 'Checking RLS policies for cancellation_requests...';
    
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename = 'cancellation_requests' AND schemaname = 'public';
    
    RAISE NOTICE 'Cancellation_requests table has % RLS policies', policy_count;
    
    -- List the policies
    FOR policy_count IN
        SELECT 1
        FROM pg_policies 
        WHERE tablename = 'cancellation_requests' AND schemaname = 'public'
    LOOP
        RAISE NOTICE 'Policy found: %', 
            (SELECT policyname FROM pg_policies 
             WHERE tablename = 'cancellation_requests' AND schemaname = 'public' 
             LIMIT 1 OFFSET policy_count - 1);
    END LOOP;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking policies: %', SQLERRM;
END $$;

-- 6. Check table permissions
DO $$
BEGIN
    RAISE NOTICE 'Checking table permissions for cancellation_requests...';
    
    -- Check if authenticated role has permissions
    IF EXISTS (
        SELECT 1 FROM information_schema.table_privileges 
        WHERE table_name = 'cancellation_requests' 
        AND table_schema = 'public' 
        AND grantee = 'authenticated'
        AND privilege_type = 'SELECT'
    ) THEN
        RAISE NOTICE '✅ Authenticated role has SELECT permission';
    ELSE
        RAISE NOTICE '❌ Authenticated role missing SELECT permission';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_privileges 
        WHERE table_name = 'cancellation_requests' 
        AND table_schema = 'public' 
        AND grantee = 'authenticated'
        AND privilege_type = 'INSERT'
    ) THEN
        RAISE NOTICE '✅ Authenticated role has INSERT permission';
    ELSE
        RAISE NOTICE '❌ Authenticated role missing INSERT permission';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM information_schema.table_privileges 
        WHERE table_name = 'cancellation_requests' 
        AND table_schema = 'public' 
        AND grantee = 'authenticated'
        AND privilege_type = 'UPDATE'
    ) THEN
        RAISE NOTICE '✅ Authenticated role has UPDATE permission';
    ELSE
        RAISE NOTICE '❌ Authenticated role missing UPDATE permission';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking permissions: %', SQLERRM;
END $$;

-- 7. Test data summary
DO $$
DECLARE
    total_requests integer;
    pending_requests integer;
    total_orders integer;
    total_users integer;
BEGIN
    RAISE NOTICE 'Data summary:';
    
    SELECT COUNT(*) INTO total_requests FROM public.cancellation_requests;
    SELECT COUNT(*) INTO pending_requests FROM public.cancellation_requests WHERE status = 'pending';
    SELECT COUNT(*) INTO total_orders FROM public.orders;
    SELECT COUNT(*) INTO total_users FROM auth.users;
    
    RAISE NOTICE 'Total cancellation requests: %', total_requests;
    RAISE NOTICE 'Pending requests: %', pending_requests;
    RAISE NOTICE 'Total orders: %', total_orders;
    RAISE NOTICE 'Total users: %', total_users;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error getting data summary: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Cancellation requests permission test completed!';
    RAISE NOTICE 'If you see "Cancellation request creation test PASSED!" above,';
    RAISE NOTICE 'the permissions are working correctly.';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now try accessing /admin/cancellation-requests';
    RAISE NOTICE 'The page should load without permission errors.';
    RAISE NOTICE '';
END $$;
