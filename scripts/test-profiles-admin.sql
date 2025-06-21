-- Test Profiles-Based Admin System
-- Run this to verify the profiles table admin system is working

-- 1. Check profiles table structure and data
DO $$
DECLARE
    table_exists BOOLEAN := false;
    total_profiles integer := 0;
    admin_profiles integer := 0;
    user_profiles integer := 0;
BEGIN
    RAISE NOTICE '🔍 Testing profiles table structure and data...';
    RAISE NOTICE '';
    
    -- Check if table exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles' AND table_schema = 'public'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ Profiles table exists';
        
        -- Get counts
        SELECT COUNT(*) INTO total_profiles FROM public.profiles;
        SELECT COUNT(*) INTO admin_profiles FROM public.profiles WHERE role = 'admin';
        SELECT COUNT(*) INTO user_profiles FROM public.profiles WHERE role = 'user';
        
        RAISE NOTICE '📊 Profile statistics:';
        RAISE NOTICE '  Total profiles: %', total_profiles;
        RAISE NOTICE '  Admin profiles: %', admin_profiles;
        RAISE NOTICE '  User profiles: %', user_profiles;
        
        IF admin_profiles > 0 THEN
            RAISE NOTICE '✅ Admin users found in profiles table';
        ELSE
            RAISE NOTICE '❌ NO admin users found in profiles table';
        END IF;
    ELSE
        RAISE NOTICE '❌ Profiles table does not exist!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking profiles table: %', SQLERRM;
END $$;

-- 2. Show all users with their profile roles
DO $$
DECLARE
    user_record RECORD;
    users_with_profiles integer := 0;
    users_without_profiles integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👥 All users and their profile roles:';
    RAISE NOTICE '';
    
    FOR user_record IN
        SELECT 
            u.id,
            u.email,
            u.created_at as user_created,
            p.role,
            p.created_at as profile_created
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        ORDER BY u.created_at DESC
    LOOP
        IF user_record.role IS NOT NULL THEN
            users_with_profiles := users_with_profiles + 1;
            
            IF user_record.role = 'admin' THEN
                RAISE NOTICE '👑 ADMIN: % (ID: %)', user_record.email, user_record.id;
            ELSE
                RAISE NOTICE '👤 USER:  % (ID: %)', user_record.email, user_record.id;
            END IF;
            
            RAISE NOTICE '     Profile created: %', user_record.profile_created;
        ELSE
            users_without_profiles := users_without_profiles + 1;
            RAISE NOTICE '❓ NO PROFILE: % (ID: %)', user_record.email, user_record.id;
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '  Users with profiles: %', users_with_profiles;
    RAISE NOTICE '  Users without profiles: %', users_without_profiles;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking user profiles: %', SQLERRM;
END $$;

-- 3. Test the exact admin check logic used in the app
DO $$
DECLARE
    test_user RECORD;
    test_count integer := 0;
    admin_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Testing admin check logic (same as used in app)...';
    RAISE NOTICE '';
    
    -- Test the exact query used in the app
    FOR test_user IN
        SELECT 
            u.id,
            u.email,
            p.role
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        ORDER BY u.created_at DESC
        LIMIT 5
    LOOP
        test_count := test_count + 1;
        
        RAISE NOTICE 'Testing user %: %', test_count, test_user.email;
        RAISE NOTICE '  User ID: %', test_user.id;
        RAISE NOTICE '  Profile role: %', COALESCE(test_user.role, 'NULL');
        
        -- This is the exact logic from the app
        IF test_user.role = 'admin' THEN
            admin_count := admin_count + 1;
            RAISE NOTICE '  ✅ ADMIN CHECK: PASS - User would have admin access';
        ELSE
            RAISE NOTICE '  ❌ ADMIN CHECK: FAIL - User would be denied admin access';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '📊 Admin check results:';
    RAISE NOTICE '  Users tested: %', test_count;
    RAISE NOTICE '  Users with admin access: %', admin_count;
    
    IF admin_count > 0 THEN
        RAISE NOTICE '✅ Admin access should work for % users', admin_count;
    ELSE
        RAISE NOTICE '❌ NO USERS WOULD HAVE ADMIN ACCESS!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing admin check logic: %', SQLERRM;
END $$;

-- 4. Test middleware admin check simulation
DO $$
DECLARE
    test_user RECORD;
    middleware_result TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🛡️  Testing middleware admin check simulation...';
    RAISE NOTICE '';
    
    -- Get first user for testing
    SELECT 
        u.id,
        u.email,
        p.role
    INTO test_user
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    ORDER BY u.created_at DESC
    LIMIT 1;
    
    IF test_user.id IS NOT NULL THEN
        RAISE NOTICE 'Simulating middleware check for: %', test_user.email;
        RAISE NOTICE 'User ID: %', test_user.id;
        RAISE NOTICE 'Profile role: %', COALESCE(test_user.role, 'NULL');
        
        -- Simulate the middleware logic
        IF test_user.role = 'admin' THEN
            middleware_result := 'ALLOW - Proceed to admin page';
            RAISE NOTICE '✅ Middleware result: %', middleware_result;
        ELSE
            middleware_result := 'DENY - Redirect to homepage';
            RAISE NOTICE '❌ Middleware result: %', middleware_result;
        END IF;
        
        RAISE NOTICE '';
        RAISE NOTICE 'Expected behavior:';
        IF test_user.role = 'admin' THEN
            RAISE NOTICE '  - /admin/cancellation-requests should load successfully';
            RAISE NOTICE '  - No "Insufficient permissions" error';
        ELSE
            RAISE NOTICE '  - User would be redirected to homepage by middleware';
            RAISE NOTICE '  - Would not reach the cancellation-requests page';
        END IF;
    ELSE
        RAISE NOTICE 'No users found for testing';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing middleware simulation: %', SQLERRM;
END $$;

-- 5. Check RLS policies on profiles table
DO $$
DECLARE
    policy_record RECORD;
    policy_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔒 Checking RLS policies on profiles table...';
    RAISE NOTICE '';
    
    FOR policy_record IN
        SELECT 
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
        ORDER BY policyname
    LOOP
        policy_count := policy_count + 1;
        RAISE NOTICE 'Policy %: %', policy_count, policy_record.policyname;
        RAISE NOTICE '  Command: %', policy_record.cmd;
        RAISE NOTICE '  Roles: %', policy_record.roles;
        RAISE NOTICE '';
    END LOOP;
    
    IF policy_count > 0 THEN
        RAISE NOTICE '✅ Found % RLS policies on profiles table', policy_count;
    ELSE
        RAISE NOTICE '❌ No RLS policies found on profiles table';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking RLS policies: %', SQLERRM;
END $$;

-- 6. Test profile creation trigger
DO $$
DECLARE
    trigger_exists BOOLEAN := false;
    function_exists BOOLEAN := false;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '⚙️  Checking profile creation trigger...';
    RAISE NOTICE '';
    
    -- Check if trigger exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created' 
        AND event_object_table = 'users'
        AND event_object_schema = 'auth'
    ) INTO trigger_exists;
    
    -- Check if function exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'handle_new_user' 
        AND routine_schema = 'public'
    ) INTO function_exists;
    
    IF trigger_exists THEN
        RAISE NOTICE '✅ Profile creation trigger exists';
    ELSE
        RAISE NOTICE '❌ Profile creation trigger missing';
    END IF;
    
    IF function_exists THEN
        RAISE NOTICE '✅ Profile creation function exists';
    ELSE
        RAISE NOTICE '❌ Profile creation function missing';
    END IF;
    
    IF trigger_exists AND function_exists THEN
        RAISE NOTICE '✅ New users should automatically get profiles';
    ELSE
        RAISE NOTICE '❌ New users may not get profiles automatically';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking trigger: %', SQLERRM;
END $$;

-- 7. Quick admin role assignment helper
DO $$
DECLARE
    user_record RECORD;
    user_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🔧 Quick admin role assignment helper...';
    RAISE NOTICE '';
    RAISE NOTICE 'To set a user as admin, run one of these commands:';
    RAISE NOTICE '';
    
    FOR user_record IN
        SELECT 
            u.id,
            u.email,
            p.role
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        ORDER BY u.created_at DESC
        LIMIT 3
    LOOP
        user_count := user_count + 1;
        
        RAISE NOTICE '-- Set % as admin:', user_record.email;
        RAISE NOTICE 'UPDATE public.profiles SET role = ''admin'' WHERE id = ''%'';', user_record.id;
        RAISE NOTICE '';
    END LOOP;
    
    IF user_count = 0 THEN
        RAISE NOTICE 'No users found for admin assignment';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error generating admin assignment commands: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Profiles-based admin system test completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'Key findings:';
    RAISE NOTICE '- Check if admin users were found above';
    RAISE NOTICE '- If no admin users, use the commands in step 7';
    RAISE NOTICE '- Admin access should work through middleware + page checks';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. If admin users found: Try /admin/cancellation-requests';
    RAISE NOTICE '2. If no admin users: Run admin assignment command above';
    RAISE NOTICE '3. The system now uses profiles table (not metadata)';
    RAISE NOTICE '';
END $$;
