-- Test Payment System Setup
-- Run this after the setup script to verify everything works

-- Check if all tables exist
SELECT 
    'orders' as table_name,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'orders'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'order_items' as table_name,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'order_items'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'payment_transactions' as table_name,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'payment_transactions'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'payment_settings' as table_name,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'payment_settings'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check RLS is enabled
SELECT 
    schemaname,
    tablename,
    CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items', 'payment_transactions', 'payment_settings')
AND schemaname = 'public';

-- Check payment settings
SELECT 
    provider,
    is_active,
    is_test_mode,
    CASE WHEN settings::text != '{}' THEN '✅ CONFIGURED' ELSE '⚠️ NEEDS CONFIG' END as config_status
FROM public.payment_settings;

-- Test order number generation
SELECT generate_order_number() as sample_order_number;

-- Check if functions exist
SELECT 
    'generate_order_number' as function_name,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_name = 'generate_order_number'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
UNION ALL
SELECT 
    'set_order_number' as function_name,
    CASE WHEN EXISTS (
        SELECT FROM information_schema.routines 
        WHERE routine_schema = 'public' AND routine_name = 'set_order_number'
    ) THEN '✅ EXISTS' ELSE '❌ MISSING' END as status;

-- Check triggers
SELECT 
    trigger_name,
    event_object_table,
    '✅ ACTIVE' as status
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_set_order_number';

-- Final status message
DO $$
DECLARE
    orders_exists BOOLEAN;
    order_items_exists BOOLEAN;
    payment_transactions_exists BOOLEAN;
    payment_settings_exists BOOLEAN;
BEGIN
    -- Check if all tables exist
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orders') INTO orders_exists;
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'order_items') INTO order_items_exists;
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_transactions') INTO payment_transactions_exists;
    SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_settings') INTO payment_settings_exists;
    
    IF orders_exists AND order_items_exists AND payment_transactions_exists AND payment_settings_exists THEN
        RAISE NOTICE '🎉 SUCCESS: All payment system tables are set up correctly!';
        RAISE NOTICE '✅ You can now use the checkout functionality';
        RAISE NOTICE '⚙️ Configure payment providers in the admin panel';
    ELSE
        RAISE NOTICE '❌ ERROR: Some tables are missing. Please run the setup script again.';
        IF NOT orders_exists THEN RAISE NOTICE '  - Missing: orders table'; END IF;
        IF NOT order_items_exists THEN RAISE NOTICE '  - Missing: order_items table'; END IF;
        IF NOT payment_transactions_exists THEN RAISE NOTICE '  - Missing: payment_transactions table'; END IF;
        IF NOT payment_settings_exists THEN RAISE NOTICE '  - Missing: payment_settings table'; END IF;
    END IF;
END $$;
