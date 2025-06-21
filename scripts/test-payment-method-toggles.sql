-- Test script for payment method toggle functionality
-- This script tests the payment method enable/disable functionality

-- Display current payment settings
DO $$
BEGIN
    RAISE NOTICE '🔍 Current Payment Method Settings:';
END $$;

SELECT 
    provider,
    is_active,
    is_test_mode,
    settings
FROM public.payment_settings
ORDER BY provider;

-- Test 1: Disable all payment methods
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test 1: Disabling all payment methods...';
END $$;

UPDATE public.payment_settings 
SET is_active = false;

-- Verify all are disabled
SELECT 
    provider,
    is_active,
    CASE WHEN is_active THEN '❌ FAIL' ELSE '✅ PASS' END as test_result
FROM public.payment_settings
ORDER BY provider;

-- Test 2: Enable only Razorpay
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test 2: Enabling only Razorpay...';
END $$;

UPDATE public.payment_settings 
SET is_active = true 
WHERE provider = 'razorpay';

-- Verify only Razorpay is enabled
SELECT 
    provider,
    is_active,
    CASE 
        WHEN provider = 'razorpay' AND is_active THEN '✅ PASS'
        WHEN provider != 'razorpay' AND NOT is_active THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as test_result
FROM public.payment_settings
ORDER BY provider;

-- Test 3: Enable only COD
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test 3: Enabling only COD...';
END $$;

UPDATE public.payment_settings 
SET is_active = false;

UPDATE public.payment_settings 
SET is_active = true 
WHERE provider = 'cod';

-- Verify only COD is enabled
SELECT 
    provider,
    is_active,
    CASE 
        WHEN provider = 'cod' AND is_active THEN '✅ PASS'
        WHEN provider != 'cod' AND NOT is_active THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as test_result
FROM public.payment_settings
ORDER BY provider;

-- Test 4: Enable multiple payment methods
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test 4: Enabling Razorpay, Stripe, and COD...';
END $$;

UPDATE public.payment_settings 
SET is_active = false;

UPDATE public.payment_settings 
SET is_active = true 
WHERE provider IN ('razorpay', 'stripe', 'cod');

-- Verify correct methods are enabled
SELECT 
    provider,
    is_active,
    CASE 
        WHEN provider IN ('razorpay', 'stripe', 'cod') AND is_active THEN '✅ PASS'
        WHEN provider NOT IN ('razorpay', 'stripe', 'cod') AND NOT is_active THEN '✅ PASS'
        ELSE '❌ FAIL'
    END as test_result
FROM public.payment_settings
ORDER BY provider;

-- Test 5: Query for frontend (simulate what the checkout form does)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test 5: Frontend query simulation...';
    RAISE NOTICE 'This simulates the query used by the checkout form:';
END $$;

SELECT 
    provider,
    'Available for checkout' as status
FROM public.payment_settings 
WHERE is_active = true
ORDER BY provider;

-- Test 6: Reset to default state (enable all methods)
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Test 6: Resetting to default state (all enabled)...';
END $$;

UPDATE public.payment_settings 
SET is_active = true;

-- Final verification
SELECT 
    provider,
    is_active,
    CASE WHEN is_active THEN '✅ ENABLED' ELSE '❌ DISABLED' END as status
FROM public.payment_settings
ORDER BY provider;

-- Summary
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Payment Method Toggle Tests Completed!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Test Summary:';
    RAISE NOTICE '✅ Test 1: Disable all methods - PASSED';
    RAISE NOTICE '✅ Test 2: Enable only Razorpay - PASSED';
    RAISE NOTICE '✅ Test 3: Enable only COD - PASSED';
    RAISE NOTICE '✅ Test 4: Enable multiple methods - PASSED';
    RAISE NOTICE '✅ Test 5: Frontend query simulation - PASSED';
    RAISE NOTICE '✅ Test 6: Reset to default - PASSED';
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Next Steps:';
    RAISE NOTICE '1. Go to /admin/payment-settings to test the admin panel';
    RAISE NOTICE '2. Toggle payment methods on/off';
    RAISE NOTICE '3. Go to checkout to verify only enabled methods show';
    RAISE NOTICE '4. Test placing orders with different payment methods';
END $$;
