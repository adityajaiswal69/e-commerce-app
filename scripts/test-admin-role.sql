-- Test Admin Role Setup
-- Run this to verify admin roles are working

-- 1. Check all users and their roles
DO $$
DECLARE
    user_record RECORD;
    total_users integer := 0;
    admin_users integer := 0;
BEGIN
    RAISE NOTICE '👥 Checking all users and their admin status...';
    RAISE NOTICE '';
    
    FOR user_record IN
        SELECT 
            id,
            email,
            created_at,
            raw_user_meta_data,
            user_metadata,
            app_metadata
        FROM auth.users
        ORDER BY created_at DESC
    LOOP
        total_users := total_users + 1;
        
        RAISE NOTICE 'User %: %', total_users, user_record.email;
        RAISE NOTICE '  ID: %', user_record.id;
        RAISE NOTICE '  Created: %', user_record.created_at;
        
        -- Check all possible admin role locations
        DECLARE
            raw_meta_role TEXT := user_record.raw_user_meta_data->>'role';
            user_meta_role TEXT := user_record.user_metadata->>'role';
            app_meta_role TEXT := user_record.app_metadata->>'role';
            is_admin BOOLEAN := false;
        BEGIN
            RAISE NOTICE '  raw_user_meta_data.role: %', raw_meta_role;
            RAISE NOTICE '  user_metadata.role: %', user_meta_role;
            RAISE NOTICE '  app_metadata.role: %', app_meta_role;
            
            -- Check if user is admin
            is_admin := (raw_meta_role = 'admin' OR user_meta_role = 'admin' OR app_meta_role = 'admin');
            
            IF is_admin THEN
                admin_users := admin_users + 1;
                RAISE NOTICE '  ✅ ADMIN ACCESS: YES';
            ELSE
                RAISE NOTICE '  ❌ ADMIN ACCESS: NO';
            END IF;
        END;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '📊 Summary:';
    RAISE NOTICE '  Total users: %', total_users;
    RAISE NOTICE '  Admin users: %', admin_users;
    
    IF admin_users > 0 THEN
        RAISE NOTICE '✅ Admin access should work for % users', admin_users;
    ELSE
        RAISE NOTICE '❌ NO ADMIN USERS FOUND - run fix-admin-role.sql first!';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking users: %', SQLERRM;
END $$;

-- 2. Test the admin check logic used in the app
DO $$
DECLARE
    user_record RECORD;
    test_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Testing admin check logic (same as used in app)...';
    RAISE NOTICE '';
    
    FOR user_record IN
        SELECT 
            id,
            email,
            raw_user_meta_data,
            user_metadata,
            app_metadata
        FROM auth.users
        LIMIT 3  -- Test first 3 users
    LOOP
        test_count := test_count + 1;
        
        DECLARE
            rawMetaRole TEXT := user_record.user_metadata->>'role';
            appMetaRole TEXT := user_record.app_metadata->>'role';
            rawUserMetaRole TEXT := user_record.raw_user_meta_data->>'role';
            isAdmin BOOLEAN := false;
        BEGIN
            RAISE NOTICE 'Testing user %: %', test_count, user_record.email;
            RAISE NOTICE '  rawMetaRole (user_metadata.role): %', rawMetaRole;
            RAISE NOTICE '  appMetaRole (app_metadata.role): %', appMetaRole;
            RAISE NOTICE '  rawUserMetaRole (raw_user_meta_data.role): %', rawUserMetaRole;
            
            -- This is the exact logic from the app
            isAdmin := rawMetaRole = 'admin' OR appMetaRole = 'admin' OR rawUserMetaRole = 'admin';
            
            RAISE NOTICE '  isAdmin result: %', isAdmin;
            
            IF isAdmin THEN
                RAISE NOTICE '  ✅ This user WOULD PASS admin check';
            ELSE
                RAISE NOTICE '  ❌ This user WOULD FAIL admin check';
            END IF;
            
            RAISE NOTICE '';
        END;
    END LOOP;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing admin logic: %', SQLERRM;
END $$;

-- 3. Show what the browser console should display
DO $$
DECLARE
    user_record RECORD;
BEGIN
    RAISE NOTICE '🖥️  Expected browser console output:';
    RAISE NOTICE '';
    
    -- Get first user for simulation
    SELECT * INTO user_record
    FROM auth.users
    LIMIT 1;
    
    IF user_record.id IS NOT NULL THEN
        DECLARE
            rawMetaRole TEXT := user_record.user_metadata->>'role';
            appMetaRole TEXT := user_record.app_metadata->>'role';
            rawUserMetaRole TEXT := user_record.raw_user_meta_data->>'role';
            isAdmin BOOLEAN := false;
        BEGIN
            isAdmin := rawMetaRole = 'admin' OR appMetaRole = 'admin' OR rawUserMetaRole = 'admin';
            
            RAISE NOTICE '✅ User authenticated: %', user_record.email;
            RAISE NOTICE '🔍 Checking admin roles:';
            RAISE NOTICE '  - user_metadata.role: %', rawMetaRole;
            RAISE NOTICE '  - app_metadata.role: %', appMetaRole;
            RAISE NOTICE '  - raw_user_meta_data.role: %', rawUserMetaRole;
            RAISE NOTICE '  - user.email: %', user_record.email;
            RAISE NOTICE '🔐 User admin status: %', isAdmin;
            
            IF isAdmin THEN
                RAISE NOTICE '✅ Should proceed to load cancellation requests';
            ELSE
                RAISE NOTICE '❌ Should show "Insufficient permissions" error';
            END IF;
        END;
    ELSE
        RAISE NOTICE 'No users found to simulate';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error simulating console output: %', SQLERRM;
END $$;

-- 4. Quick fix suggestion if no admin users found
DO $$
DECLARE
    admin_count integer;
BEGIN
    SELECT COUNT(*) INTO admin_count
    FROM auth.users
    WHERE 
        raw_user_meta_data->>'role' = 'admin' OR
        user_metadata->>'role' = 'admin' OR
        app_metadata->>'role' = 'admin';
    
    IF admin_count = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '🚨 NO ADMIN USERS FOUND!';
        RAISE NOTICE '';
        RAISE NOTICE 'Quick fix - run this command:';
        RAISE NOTICE '';
        RAISE NOTICE 'UPDATE auth.users SET';
        RAISE NOTICE '  raw_user_meta_data = COALESCE(raw_user_meta_data, ''{}''::jsonb) || ''{"role": "admin"}''::jsonb,';
        RAISE NOTICE '  user_metadata = COALESCE(user_metadata, ''{}''::jsonb) || ''{"role": "admin"}''::jsonb';
        RAISE NOTICE 'WHERE email = ''your-email@example.com'';';
        RAISE NOTICE '';
        RAISE NOTICE 'Replace your-email@example.com with your actual email address.';
        RAISE NOTICE '';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '✅ Found % admin users - access should work!', admin_count;
        RAISE NOTICE '';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking admin count: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Admin role test completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'If you see admin users above, try accessing:';
    RAISE NOTICE '/admin/cancellation-requests';
    RAISE NOTICE '';
    RAISE NOTICE 'If you see "NO ADMIN USERS FOUND", run:';
    RAISE NOTICE 'scripts/fix-admin-role.sql';
    RAISE NOTICE '';
END $$;
