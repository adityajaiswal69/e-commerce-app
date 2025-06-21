-- Fix Admin Role Using Profiles Table (Original System)
-- This uses your original role assignment system from sql/schema/004_profiles.sql

-- 1. Check if profiles table exists and has correct structure
DO $$
BEGIN
    RAISE NOTICE '🔍 Checking profiles table structure...';
    
    -- Check if profiles table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE '✅ Profiles table exists';
        
        -- Check if role column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role' AND table_schema = 'public') THEN
            RAISE NOTICE '✅ Role column exists in profiles table';
        ELSE
            RAISE NOTICE '❌ Role column missing in profiles table';
        END IF;
    ELSE
        RAISE NOTICE '❌ Profiles table does not exist';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking profiles table: %', SQLERRM;
END $$;

-- 2. Ensure profiles table exists with correct structure (from your schema)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid references auth.users(id) primary key,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable RLS if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create/update RLS policies (from your schema)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 5. Grant necessary permissions (from your schema)
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 6. Create/update the trigger function for new users (from your schema)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with explicit role to ensure it matches the check constraint
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error creating user profile: %', SQLERRM;
    RETURN new; -- Still return new to allow user creation even if profile fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create/update the trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Create/update the updated_at trigger function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- 9. Check existing users and create missing profiles
DO $$
DECLARE
    user_record RECORD;
    missing_profiles integer := 0;
    total_users integer := 0;
BEGIN
    RAISE NOTICE '👥 Checking for users without profiles...';
    
    FOR user_record IN
        SELECT u.id, u.email, u.created_at
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE p.id IS NULL
        ORDER BY u.created_at
    LOOP
        missing_profiles := missing_profiles + 1;
        
        -- Create missing profile with default 'user' role
        INSERT INTO public.profiles (id, role)
        VALUES (user_record.id, 'user')
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Created profile for user: % (ID: %)', user_record.email, user_record.id;
    END LOOP;
    
    SELECT COUNT(*) INTO total_users FROM auth.users;
    
    RAISE NOTICE '📊 Profile creation summary:';
    RAISE NOTICE '  Total users: %', total_users;
    RAISE NOTICE '  Missing profiles created: %', missing_profiles;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating missing profiles: %', SQLERRM;
END $$;

-- 10. Show current user roles
DO $$
DECLARE
    user_record RECORD;
    admin_count integer := 0;
    user_count integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '👤 Current user roles in profiles table:';
    RAISE NOTICE '';
    
    FOR user_record IN
        SELECT 
            u.email,
            u.id,
            p.role,
            p.created_at as profile_created
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        ORDER BY u.created_at DESC
    LOOP
        IF user_record.role = 'admin' THEN
            admin_count := admin_count + 1;
            RAISE NOTICE '👑 ADMIN: % (ID: %)', user_record.email, user_record.id;
        ELSIF user_record.role = 'user' THEN
            user_count := user_count + 1;
            RAISE NOTICE '👤 USER:  % (ID: %)', user_record.email, user_record.id;
        ELSE
            RAISE NOTICE '❓ NO PROFILE: % (ID: %)', user_record.email, user_record.id;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 Role summary:';
    RAISE NOTICE '  Admin users: %', admin_count;
    RAISE NOTICE '  Regular users: %', user_count;
    RAISE NOTICE '';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking user roles: %', SQLERRM;
END $$;

-- 11. Set specific user as admin (REPLACE EMAIL BELOW)
DO $$
DECLARE
    target_email TEXT := 'jaiswaladitya508@gmail.com'; -- CHANGE THIS TO YOUR EMAIL
    user_id uuid;
BEGIN
    RAISE NOTICE '🔧 Setting admin role for specific user...';
    RAISE NOTICE 'Target email: %', target_email;
    
    -- Get user ID from email
    SELECT id INTO user_id FROM auth.users WHERE email = target_email;
    
    IF user_id IS NOT NULL THEN
        -- Update or insert profile with admin role
        INSERT INTO public.profiles (id, role)
        VALUES (user_id, 'admin')
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            updated_at = now();
        
        RAISE NOTICE '✅ Successfully set admin role for: %', target_email;
        RAISE NOTICE '   User ID: %', user_id;
    ELSE
        RAISE NOTICE '❌ User not found with email: %', target_email;
        RAISE NOTICE '';
        RAISE NOTICE '📋 Available users:';
        
        -- Show available users
        FOR user_id IN
            SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 5
        LOOP
            RAISE NOTICE '   %', (SELECT email FROM auth.users WHERE id = user_id);
        END LOOP;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error setting admin role: %', SQLERRM;
END $$;

-- 12. Alternative: Set first user as admin (if email method fails)
/*
DO $$
DECLARE
    first_user_id uuid;
    first_user_email TEXT;
BEGIN
    RAISE NOTICE '🔧 Setting first user as admin (fallback method)...';
    
    -- Get first user
    SELECT id, email INTO first_user_id, first_user_email 
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    IF first_user_id IS NOT NULL THEN
        -- Set as admin
        INSERT INTO public.profiles (id, role)
        VALUES (first_user_id, 'admin')
        ON CONFLICT (id) 
        DO UPDATE SET 
            role = 'admin',
            updated_at = now();
        
        RAISE NOTICE '✅ Set first user as admin: %', first_user_email;
    ELSE
        RAISE NOTICE '❌ No users found in database';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error setting first user as admin: %', SQLERRM;
END $$;
*/

-- 13. Test the admin check (same logic as used in middleware)
DO $$
DECLARE
    test_user RECORD;
    admin_users integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🧪 Testing admin check logic (same as middleware)...';
    RAISE NOTICE '';
    
    FOR test_user IN
        SELECT 
            u.email,
            u.id,
            p.role
        FROM auth.users u
        JOIN public.profiles p ON u.id = p.id
        WHERE p.role = 'admin'
    LOOP
        admin_users := admin_users + 1;
        RAISE NOTICE '✅ Admin user found: % (role: %)', test_user.email, test_user.role;
    END LOOP;
    
    IF admin_users > 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 Found % admin users - admin access should work!', admin_users;
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '❌ NO ADMIN USERS FOUND!';
        RAISE NOTICE 'Please update the email in step 11 above and re-run this script.';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing admin check: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Profiles-based admin role system setup completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'What was done:';
    RAISE NOTICE '✅ Ensured profiles table exists with correct structure';
    RAISE NOTICE '✅ Set up proper RLS policies and permissions';
    RAISE NOTICE '✅ Created triggers for automatic profile creation';
    RAISE NOTICE '✅ Created missing profiles for existing users';
    RAISE NOTICE '✅ Set admin role using profiles table (not metadata)';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANT: Update the email in step 11 above to your email!';
    RAISE NOTICE 'Then re-run this script to set yourself as admin.';
    RAISE NOTICE '';
    RAISE NOTICE 'After setting admin role, try accessing:';
    RAISE NOTICE '/admin/cancellation-requests';
    RAISE NOTICE '';
END $$;
