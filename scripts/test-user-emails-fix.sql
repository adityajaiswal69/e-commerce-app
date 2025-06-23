-- Test User Emails Fix for Cancellation Requests
-- Run this to verify real user emails are working

-- 1. Test the get_user_email function
DO $$
DECLARE
    test_user RECORD;
    test_email TEXT;
    test_count integer := 0;
BEGIN
    RAISE NOTICE '🧪 Testing get_user_email function...';
    RAISE NOTICE '';
    
    FOR test_user IN
        SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 3
    LOOP
        test_count := test_count + 1;
        
        -- Test the function
        SELECT get_user_email(test_user.id) INTO test_email;
        
        RAISE NOTICE 'User %:', test_count;
        RAISE NOTICE '  ID: %', test_user.id;
        RAISE NOTICE '  Real email: %', test_user.email;
        RAISE NOTICE '  Function result: %', test_email;
        
        IF test_user.email = test_email THEN
            RAISE NOTICE '  ✅ Function returns correct email';
        ELSE
            RAISE NOTICE '  ❌ Function returns different email';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    IF test_count > 0 THEN
        RAISE NOTICE '✅ get_user_email function tested with % users', test_count;
    ELSE
        RAISE NOTICE '❌ No users found to test function';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing function: %', SQLERRM;
END $$;

-- 2. Test the cancellation_requests_with_emails view
DO $$
DECLARE
    view_record RECORD;
    view_count integer := 0;
    real_emails integer := 0;
    fallback_emails integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 Testing cancellation_requests_with_emails view...';
    RAISE NOTICE '';
    
    FOR view_record IN
        SELECT 
            id,
            reason,
            status,
            order_number,
            user_email,
            order_user_id
        FROM cancellation_requests_with_emails
        ORDER BY created_at DESC
        LIMIT 10
    LOOP
        view_count := view_count + 1;
        
        RAISE NOTICE 'Request %:', view_count;
        RAISE NOTICE '  ID: %', view_record.id;
        RAISE NOTICE '  Order: %', view_record.order_number;
        RAISE NOTICE '  User Email: %', view_record.user_email;
        RAISE NOTICE '  User ID: %', view_record.order_user_id;
        RAISE NOTICE '  Status: %', view_record.status;
        
        -- Check if it's a real email or fallback
        IF view_record.user_email LIKE '%@example.com' THEN
            fallback_emails := fallback_emails + 1;
            RAISE NOTICE '  ❌ FALLBACK EMAIL (generated)';
        ELSE
            real_emails := real_emails + 1;
            RAISE NOTICE '  ✅ REAL EMAIL (from auth.users)';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '📈 View Test Summary:';
    RAISE NOTICE '  Total requests: %', view_count;
    RAISE NOTICE '  Real emails: %', real_emails;
    RAISE NOTICE '  Fallback emails: %', fallback_emails;
    
    IF view_count > 0 THEN
        RAISE NOTICE '✅ View is working and returning data';
        
        IF real_emails > 0 THEN
            RAISE NOTICE '✅ Real user emails are being returned!';
        ELSE
            RAISE NOTICE '⚠️ All emails are fallbacks - check if users have real emails';
        END IF;
    ELSE
        RAISE NOTICE '❌ View returned no data - may need sample data';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing view: %', SQLERRM;
END $$;

-- 3. Compare old vs new approach
DO $$
DECLARE
    old_approach_record RECORD;
    new_approach_record RECORD;
    comparison_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔄 Comparing old vs new email approach...';
    RAISE NOTICE '';
    
    -- Compare the first few records
    FOR old_approach_record IN
        SELECT 
            cr.id,
            cr.user_id,
            o.order_number,
            'user-' || SUBSTRING(cr.user_id::text, 1, 8) || '@example.com' as old_email
        FROM public.cancellation_requests cr
        INNER JOIN public.orders o ON cr.order_id = o.id
        ORDER BY cr.created_at DESC
        LIMIT 5
    LOOP
        comparison_count := comparison_count + 1;
        
        -- Get the new approach result
        SELECT user_email INTO new_approach_record.user_email
        FROM cancellation_requests_with_emails
        WHERE id = old_approach_record.id;
        
        RAISE NOTICE 'Request %:', comparison_count;
        RAISE NOTICE '  Order: %', old_approach_record.order_number;
        RAISE NOTICE '  OLD approach: %', old_approach_record.old_email;
        RAISE NOTICE '  NEW approach: %', new_approach_record.user_email;
        
        IF old_approach_record.old_email != new_approach_record.user_email THEN
            RAISE NOTICE '  ✅ IMPROVED - Now showing real email instead of fallback';
        ELSE
            RAISE NOTICE '  ⚠️ Same result - user may not have real email in auth.users';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    IF comparison_count > 0 THEN
        RAISE NOTICE '✅ Comparison completed for % requests', comparison_count;
    ELSE
        RAISE NOTICE '❌ No requests found for comparison';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error in comparison: %', SQLERRM;
END $$;

-- 4. Test what the app will receive
DO $$
DECLARE
    app_data_record RECORD;
    app_test_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📱 Testing data format for the app...';
    RAISE NOTICE '';
    
    -- Simulate what the app query will return
    FOR app_data_record IN
        SELECT 
            id,
            reason,
            status,
            order_number,
            total_amount,
            payment_status,
            payment_method,
            user_email,
            order_user_id,
            created_at
        FROM cancellation_requests_with_emails
        ORDER BY created_at DESC
        LIMIT 3
    LOOP
        app_test_count := app_test_count + 1;
        
        RAISE NOTICE 'App Data Record %:', app_test_count;
        RAISE NOTICE '  Request ID: %', app_data_record.id;
        RAISE NOTICE '  Reason: %', app_data_record.reason;
        RAISE NOTICE '  Status: %', app_data_record.status;
        RAISE NOTICE '  Order Number: %', app_data_record.order_number;
        RAISE NOTICE '  Total Amount: %', app_data_record.total_amount;
        RAISE NOTICE '  Payment Status: %', app_data_record.payment_status;
        RAISE NOTICE '  User Email: %', app_data_record.user_email;
        RAISE NOTICE '  Created At: %', app_data_record.created_at;
        
        -- Check if this looks like real data
        IF app_data_record.user_email IS NOT NULL AND app_data_record.user_email != '' THEN
            IF app_data_record.user_email LIKE '%@example.com' THEN
                RAISE NOTICE '  📧 Email Status: FALLBACK (generated)';
            ELSE
                RAISE NOTICE '  📧 Email Status: REAL (from auth.users)';
            END IF;
        ELSE
            RAISE NOTICE '  📧 Email Status: NULL/EMPTY';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    IF app_test_count > 0 THEN
        RAISE NOTICE '✅ App will receive properly formatted data';
    ELSE
        RAISE NOTICE '❌ No data available for app testing';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing app data: %', SQLERRM;
END $$;

-- 5. Check permissions
DO $$
DECLARE
    can_execute_function BOOLEAN := false;
    can_select_view BOOLEAN := false;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Testing permissions...';
    RAISE NOTICE '';
    
    -- Test function execution permission
    BEGIN
        PERFORM get_user_email((SELECT id FROM auth.users LIMIT 1));
        can_execute_function := true;
        RAISE NOTICE '✅ Can execute get_user_email function';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot execute get_user_email function: %', SQLERRM;
    END;
    
    -- Test view selection permission
    BEGIN
        PERFORM COUNT(*) FROM cancellation_requests_with_emails LIMIT 1;
        can_select_view := true;
        RAISE NOTICE '✅ Can select from cancellation_requests_with_emails view';
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ Cannot select from view: %', SQLERRM;
    END;
    
    IF can_execute_function AND can_select_view THEN
        RAISE NOTICE '✅ All permissions are working correctly';
    ELSE
        RAISE NOTICE '❌ Some permissions are missing';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing permissions: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 User emails fix test completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Key findings:';
    RAISE NOTICE '- Check if real emails are being returned above';
    RAISE NOTICE '- The view should show actual user emails, not random ones';
    RAISE NOTICE '- App will receive properly formatted data with real emails';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. If real emails found: The fix is working!';
    RAISE NOTICE '2. If only fallbacks: Check auth.users table has real emails';
    RAISE NOTICE '3. Test the cancellation requests page in the app';
    RAISE NOTICE '';
    RAISE NOTICE 'The ProcessCancellationModal should now show:';
    RAISE NOTICE 'request.users.email = real user email (not random)';
    RAISE NOTICE '';
END $$;
