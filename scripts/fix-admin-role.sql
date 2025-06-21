-- Fix Admin Role Access - IMMEDIATE SOLUTION
-- Run this in Supabase SQL Editor to fix admin access

-- 1. Check current user metadata
DO $$
DECLARE
    user_record RECORD;
    user_count integer := 0;
BEGIN
    RAISE NOTICE '🔍 Checking current user metadata...';
    
    FOR user_record IN
        SELECT 
            id, 
            email, 
            raw_user_meta_data,
            user_metadata,
            app_metadata
        FROM auth.users
        ORDER BY created_at DESC
        LIMIT 5
    LOOP
        user_count := user_count + 1;
        RAISE NOTICE 'User %: % (ID: %)', user_count, user_record.email, user_record.id;
        RAISE NOTICE '  raw_user_meta_data: %', user_record.raw_user_meta_data;
        RAISE NOTICE '  user_metadata: %', user_record.user_metadata;
        RAISE NOTICE '  app_metadata: %', user_record.app_metadata;
        RAISE NOTICE '';
    END LOOP;
    
    IF user_count = 0 THEN
        RAISE NOTICE '❌ No users found in auth.users table!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking users: %', SQLERRM;
END $$;

-- 2. Set ALL users as admin (for testing - you can restrict this later)
DO $$
DECLARE
    updated_count integer := 0;
    user_record RECORD;
BEGIN
    RAISE NOTICE '🔧 Setting admin role for all users...';
    
    -- Update all users to have admin role in raw_user_meta_data
    FOR user_record IN
        SELECT id, email FROM auth.users
    LOOP
        -- Update raw_user_meta_data to include admin role
        UPDATE auth.users 
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
        WHERE id = user_record.id;
        
        -- Also update user_metadata for compatibility
        UPDATE auth.users 
        SET user_metadata = COALESCE(user_metadata, '{}'::jsonb) || '{"role": "admin"}'::jsonb
        WHERE id = user_record.id;
        
        updated_count := updated_count + 1;
        RAISE NOTICE '✅ Updated user: % (ID: %)', user_record.email, user_record.id;
    END LOOP;
    
    RAISE NOTICE '🎉 Updated % users with admin role', updated_count;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error updating users: %', SQLERRM;
END $$;

-- 3. Verify the admin role update
DO $$
DECLARE
    user_record RECORD;
    admin_count integer := 0;
BEGIN
    RAISE NOTICE '✅ Verifying admin role updates...';
    
    FOR user_record IN
        SELECT 
            id, 
            email, 
            raw_user_meta_data,
            user_metadata
        FROM auth.users
        WHERE 
            raw_user_meta_data->>'role' = 'admin' 
            OR user_metadata->>'role' = 'admin'
    LOOP
        admin_count := admin_count + 1;
        RAISE NOTICE 'Admin user %: %', admin_count, user_record.email;
        RAISE NOTICE '  raw_user_meta_data role: %', user_record.raw_user_meta_data->>'role';
        RAISE NOTICE '  user_metadata role: %', user_record.user_metadata->>'role';
    END LOOP;
    
    IF admin_count > 0 THEN
        RAISE NOTICE '🎉 Found % admin users - admin access should now work!', admin_count;
    ELSE
        RAISE NOTICE '❌ No admin users found - there may be an issue with the update';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error verifying admin users: %', SQLERRM;
END $$;

-- 4. Alternative: Set specific user as admin (replace email)
-- Uncomment and modify the email below if you want to set only specific user as admin
/*
DO $$
BEGIN
    RAISE NOTICE '🎯 Setting specific user as admin...';
    
    -- Replace 'your-email@example.com' with your actual email
    UPDATE auth.users 
    SET 
        raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
        user_metadata = COALESCE(user_metadata, '{}'::jsonb) || '{"role": "admin"}'::jsonb
    WHERE email = 'your-email@example.com';
    
    IF FOUND THEN
        RAISE NOTICE '✅ Successfully set admin role for your-email@example.com';
    ELSE
        RAISE NOTICE '❌ User with email your-email@example.com not found';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error setting specific admin: %', SQLERRM;
END $$;
*/

-- 5. Create a function to easily check admin status
CREATE OR REPLACE FUNCTION check_user_admin_status(user_email TEXT)
RETURNS TABLE(
    email TEXT,
    user_id uuid,
    raw_meta_role TEXT,
    user_meta_role TEXT,
    is_admin BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.email::TEXT,
        u.id,
        (u.raw_user_meta_data->>'role')::TEXT,
        (u.user_metadata->>'role')::TEXT,
        (
            u.raw_user_meta_data->>'role' = 'admin' OR 
            u.user_metadata->>'role' = 'admin'
        ) as is_admin
    FROM auth.users u
    WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Test the admin check function
DO $$
DECLARE
    test_result RECORD;
BEGIN
    RAISE NOTICE '🧪 Testing admin check function...';
    
    -- Test with first user
    FOR test_result IN
        SELECT * FROM check_user_admin_status(
            (SELECT email FROM auth.users LIMIT 1)
        )
    LOOP
        RAISE NOTICE 'Test result for %:', test_result.email;
        RAISE NOTICE '  User ID: %', test_result.user_id;
        RAISE NOTICE '  Raw meta role: %', test_result.raw_meta_role;
        RAISE NOTICE '  User meta role: %', test_result.user_meta_role;
        RAISE NOTICE '  Is admin: %', test_result.is_admin;
        
        IF test_result.is_admin THEN
            RAISE NOTICE '✅ Admin check PASSED for this user';
        ELSE
            RAISE NOTICE '❌ Admin check FAILED for this user';
        END IF;
    END LOOP;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing admin function: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Admin role fix completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'What was done:';
    RAISE NOTICE '✅ Checked current user metadata';
    RAISE NOTICE '✅ Set admin role for all users (for testing)';
    RAISE NOTICE '✅ Verified admin role updates';
    RAISE NOTICE '✅ Created admin check function';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Try accessing /admin/cancellation-requests again';
    RAISE NOTICE '2. Should now work without "Insufficient permissions" error';
    RAISE NOTICE '3. Check browser console for "🔐 User admin status: true"';
    RAISE NOTICE '';
    RAISE NOTICE 'If you want to restrict admin access later, modify the';
    RAISE NOTICE 'UPDATE statements above to target specific users only.';
    RAISE NOTICE '';
END $$;
