-- Test script to verify cancellation system is working
-- Run this to check if your cancellation system is properly set up

-- Check if tables exist
DO $$
BEGIN
    RAISE NOTICE '🔍 Checking cancellation system setup...';
    RAISE NOTICE '';
END $$;

-- Test 1: Check if cancellation_requests table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cancellation_requests') THEN
        RAISE NOTICE '✅ cancellation_requests table exists';
    ELSE
        RAISE NOTICE '❌ cancellation_requests table does NOT exist';
        RAISE NOTICE '   Run: scripts/setup-cancellation-system.sql';
    END IF;
END $$;

-- Test 2: Check if cancellation_reasons table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cancellation_reasons') THEN
        RAISE NOTICE '✅ cancellation_reasons table exists';
    ELSE
        RAISE NOTICE '❌ cancellation_reasons table does NOT exist';
        RAISE NOTICE '   Run: scripts/setup-cancellation-system.sql';
    END IF;
END $$;

-- Test 3: Check cancellation reasons data
DO $$
DECLARE
    reason_count INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cancellation_reasons') THEN
        SELECT COUNT(*) INTO reason_count FROM cancellation_reasons;
        
        IF reason_count > 0 THEN
            RAISE NOTICE '✅ Found % cancellation reasons', reason_count;
        ELSE
            RAISE NOTICE '❌ No cancellation reasons found';
            RAISE NOTICE '   Run: scripts/setup-cancellation-system.sql';
        END IF;
    END IF;
END $$;

-- Test 4: Display available cancellation reasons
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cancellation_reasons') THEN
        RAISE NOTICE '';
        RAISE NOTICE '📋 Available cancellation reasons:';
        
        FOR rec IN 
            SELECT display_order, description 
            FROM cancellation_reasons 
            WHERE is_active = true 
            ORDER BY display_order
        LOOP
            RAISE NOTICE '   %: %', rec.display_order, rec.description;
        END LOOP;
    END IF;
END $$;

-- Test 5: Check RLS policies
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cancellation_requests') THEN
        SELECT COUNT(*) INTO policy_count 
        FROM pg_policies 
        WHERE tablename = 'cancellation_requests';
        
        IF policy_count > 0 THEN
            RAISE NOTICE '✅ RLS policies configured (% policies)', policy_count;
        ELSE
            RAISE NOTICE '⚠️  No RLS policies found for cancellation_requests';
        END IF;
    END IF;
END $$;

-- Test 6: Check if orders table exists (required for foreign key)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') THEN
        RAISE NOTICE '✅ orders table exists (required for cancellation system)';
    ELSE
        RAISE NOTICE '❌ orders table does NOT exist';
        RAISE NOTICE '   The cancellation system requires an orders table';
    END IF;
END $$;

-- Summary
DO $$
DECLARE
    cancellation_table_exists BOOLEAN;
    reasons_table_exists BOOLEAN;
    orders_table_exists BOOLEAN;
    reason_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 SUMMARY:';
    
    -- Check table existence
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cancellation_requests') 
    INTO cancellation_table_exists;
    
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cancellation_reasons') 
    INTO reasons_table_exists;
    
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'orders') 
    INTO orders_table_exists;
    
    -- Count reasons if table exists
    IF reasons_table_exists THEN
        SELECT COUNT(*) INTO reason_count FROM cancellation_reasons WHERE is_active = true;
    END IF;
    
    -- Overall status
    IF cancellation_table_exists AND reasons_table_exists AND orders_table_exists AND reason_count > 0 THEN
        RAISE NOTICE '🎉 Cancellation system is FULLY CONFIGURED and ready to use!';
        RAISE NOTICE '';
        RAISE NOTICE 'You can now:';
        RAISE NOTICE '• Submit cancellation requests from order details pages';
        RAISE NOTICE '• View requests in admin panel at /admin/cancellation-requests';
        RAISE NOTICE '• Process requests with approve/reject actions';
    ELSE
        RAISE NOTICE '⚠️  Cancellation system is NOT fully configured';
        RAISE NOTICE '';
        RAISE NOTICE 'Missing components:';
        
        IF NOT cancellation_table_exists THEN
            RAISE NOTICE '• cancellation_requests table';
        END IF;
        
        IF NOT reasons_table_exists THEN
            RAISE NOTICE '• cancellation_reasons table';
        END IF;
        
        IF NOT orders_table_exists THEN
            RAISE NOTICE '• orders table (required dependency)';
        END IF;
        
        IF reason_count = 0 THEN
            RAISE NOTICE '• cancellation reason data';
        END IF;
        
        RAISE NOTICE '';
        RAISE NOTICE 'To fix: Run scripts/setup-cancellation-system.sql';
    END IF;
END $$;
