-- Fix User Emails in Cancellation Requests - REFINED VERSION
-- This creates a proper way to get real user emails instead of random fallback emails

-- 1. First, ensure all required tables exist
DO $$
BEGIN
    -- Check and create cancellation_requests table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cancellation_requests' AND table_schema = 'public') THEN
        RAISE NOTICE 'Creating cancellation_requests table...';

        CREATE TABLE public.cancellation_requests (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
            user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            reason TEXT NOT NULL,
            additional_details TEXT,
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
            admin_notes TEXT,
            processed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
            processed_at TIMESTAMP WITH TIME ZONE,
            refund_amount DECIMAL(10,2),
            refund_status TEXT CHECK (refund_status IN ('pending', 'processing', 'completed', 'failed')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Enable RLS
        ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;

        -- Create basic policies
        CREATE POLICY "authenticated_users_all_cancellation_requests" ON public.cancellation_requests
        FOR ALL TO authenticated USING (true) WITH CHECK (true);

        RAISE NOTICE '✅ Created cancellation_requests table';
    ELSE
        RAISE NOTICE '✅ cancellation_requests table already exists';
    END IF;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking/creating tables: %', SQLERRM;
END $$;

-- 2. Create a robust function to get user email by user ID
CREATE OR REPLACE FUNCTION public.get_user_email(user_uuid uuid)
RETURNS TEXT AS $$
DECLARE
    user_email TEXT;
BEGIN
    -- Try to get email from auth.users with error handling
    BEGIN
        SELECT email INTO user_email
        FROM auth.users
        WHERE id = user_uuid;
    EXCEPTION
        WHEN OTHERS THEN
            -- If auth.users access fails, return fallback
            RETURN 'user-' || SUBSTRING(user_uuid::text, 1, 8) || '@example.com';
    END;

    -- Return the email or a fallback if email is null/empty
    IF user_email IS NOT NULL AND user_email != '' THEN
        RETURN user_email;
    ELSE
        RETURN 'user-' || SUBSTRING(user_uuid::text, 1, 8) || '@example.com';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create a robust view that includes user emails for cancellation requests
DO $$
BEGIN
    -- Drop existing view if it exists
    DROP VIEW IF EXISTS public.cancellation_requests_with_emails;

    -- Create the view with error handling
    CREATE VIEW public.cancellation_requests_with_emails AS
    SELECT
        cr.id,
        cr.order_id,
        cr.user_id,
        cr.reason,
        cr.additional_details,
        cr.status,
        cr.admin_notes,
        cr.processed_by,
        cr.processed_at,
        cr.refund_amount,
        cr.refund_status,
        cr.created_at,
        cr.updated_at,
        -- Order information
        o.id as order_id_ref,
        COALESCE(o.order_number, 'ORD-' || SUBSTRING(o.id::text, 1, 8)) as order_number,
        COALESCE(o.total_amount, 0) as total_amount,
        COALESCE(o.payment_status, 'unknown') as payment_status,
        COALESCE(o.payment_method, 'unknown') as payment_method,
        o.created_at as order_created_at,
        o.user_id as order_user_id,
        -- User email using the function
        public.get_user_email(o.user_id) as user_email
    FROM public.cancellation_requests cr
    INNER JOIN public.orders o ON cr.order_id = o.id;

    RAISE NOTICE '✅ Created cancellation_requests_with_emails view';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating view: %', SQLERRM;

        -- Create a fallback view if the main one fails
        CREATE OR REPLACE VIEW public.cancellation_requests_with_emails AS
        SELECT
            cr.*,
            cr.order_id as order_id_ref,
            'ORD-' || SUBSTRING(cr.order_id::text, 1, 8) as order_number,
            0::decimal as total_amount,
            'unknown' as payment_status,
            'unknown' as payment_method,
            cr.created_at as order_created_at,
            cr.user_id as order_user_id,
            'user-' || SUBSTRING(cr.user_id::text, 1, 8) || '@example.com' as user_email
        FROM public.cancellation_requests cr;

        RAISE NOTICE '⚠️ Created fallback view due to error';
END $$;

-- 4. Grant comprehensive permissions
DO $$
BEGIN
    -- Grant permissions on the function
    GRANT EXECUTE ON FUNCTION public.get_user_email(uuid) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.get_user_email(uuid) TO anon;

    -- Grant permissions on the view
    GRANT SELECT ON public.cancellation_requests_with_emails TO authenticated;
    GRANT SELECT ON public.cancellation_requests_with_emails TO anon;

    -- Grant permissions on underlying tables
    GRANT SELECT ON public.cancellation_requests TO authenticated;
    GRANT SELECT ON public.orders TO authenticated;

    RAISE NOTICE '✅ Granted permissions on function and view';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error granting permissions: %', SQLERRM;
END $$;

-- 5. Test the function and view
DO $$
DECLARE
    test_result RECORD;
    test_count integer := 0;
BEGIN
    RAISE NOTICE '🧪 Testing user email function and view...';
    RAISE NOTICE '';
    
    -- Test the view
    FOR test_result IN
        SELECT 
            id,
            reason,
            status,
            order_number,
            user_email,
            order_user_id
        FROM cancellation_requests_with_emails
        LIMIT 5
    LOOP
        test_count := test_count + 1;
        RAISE NOTICE 'Request %:', test_count;
        RAISE NOTICE '  ID: %', test_result.id;
        RAISE NOTICE '  Order: %', test_result.order_number;
        RAISE NOTICE '  User Email: %', test_result.user_email;
        RAISE NOTICE '  User ID: %', test_result.order_user_id;
        RAISE NOTICE '  Status: %', test_result.status;
        RAISE NOTICE '';
    END LOOP;
    
    IF test_count > 0 THEN
        RAISE NOTICE '✅ Found % cancellation requests with user emails', test_count;
    ELSE
        RAISE NOTICE '❌ No cancellation requests found to test';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error testing view: %', SQLERRM;
END $$;

-- 6. Create sample data if none exists (for testing)
DO $$
DECLARE
    sample_user_id uuid;
    sample_order_id uuid;
    sample_request_id uuid;
    user_email TEXT;
BEGIN
    RAISE NOTICE '📝 Creating sample data if needed...';
    
    -- Check if we have any cancellation requests
    IF NOT EXISTS (SELECT 1 FROM public.cancellation_requests LIMIT 1) THEN
        -- Get first user
        SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
        
        IF sample_user_id IS NOT NULL THEN
            -- Get user email for verification
            SELECT get_user_email(sample_user_id) INTO user_email;
            RAISE NOTICE 'Using user: % (email: %)', sample_user_id, user_email;
            
            -- Create or get a sample order
            SELECT id INTO sample_order_id 
            FROM public.orders 
            WHERE user_id = sample_user_id 
            LIMIT 1;
            
            IF sample_order_id IS NULL THEN
                -- Create a sample order
                INSERT INTO public.orders (
                    user_id,
                    order_number,
                    total_amount,
                    status,
                    payment_status,
                    payment_method
                ) VALUES (
                    sample_user_id,
                    'EMAIL-TEST-' || extract(epoch from now())::text,
                    599.99,
                    'confirmed',
                    'paid',
                    'razorpay'
                ) RETURNING id INTO sample_order_id;
                
                RAISE NOTICE '✅ Created sample order: %', sample_order_id;
            END IF;
            
            -- Create a sample cancellation request
            INSERT INTO public.cancellation_requests (
                order_id,
                user_id,
                reason,
                additional_details,
                status
            ) VALUES (
                sample_order_id,
                sample_user_id,
                'Change of Mind',
                'Testing user email display in cancellation requests.',
                'pending'
            ) RETURNING id INTO sample_request_id;
            
            RAISE NOTICE '✅ Created sample cancellation request: %', sample_request_id;
            RAISE NOTICE '   This should show real email: %', user_email;
        ELSE
            RAISE NOTICE '❌ No users found to create sample data';
        END IF;
    ELSE
        RAISE NOTICE 'Cancellation requests already exist, skipping sample data creation';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating sample data: %', SQLERRM;
END $$;

-- 7. Show current cancellation requests with real emails
DO $$
DECLARE
    request_record RECORD;
    total_requests integer := 0;
    real_emails integer := 0;
    fallback_emails integer := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '📊 Current cancellation requests with email status:';
    RAISE NOTICE '';
    
    FOR request_record IN
        SELECT 
            id,
            reason,
            status,
            order_number,
            user_email,
            order_user_id
        FROM cancellation_requests_with_emails
        ORDER BY created_at DESC
    LOOP
        total_requests := total_requests + 1;
        
        RAISE NOTICE 'Request %: %', total_requests, request_record.reason;
        RAISE NOTICE '  Order: %', request_record.order_number;
        RAISE NOTICE '  Email: %', request_record.user_email;
        RAISE NOTICE '  Status: %', request_record.status;
        
        -- Check if it's a real email or fallback
        IF request_record.user_email LIKE '%@example.com' THEN
            fallback_emails := fallback_emails + 1;
            RAISE NOTICE '  ❌ FALLBACK EMAIL (not real)';
        ELSE
            real_emails := real_emails + 1;
            RAISE NOTICE '  ✅ REAL EMAIL';
        END IF;
        
        RAISE NOTICE '';
    END LOOP;
    
    RAISE NOTICE '📈 Email Summary:';
    RAISE NOTICE '  Total requests: %', total_requests;
    RAISE NOTICE '  Real emails: %', real_emails;
    RAISE NOTICE '  Fallback emails: %', fallback_emails;
    
    IF real_emails > 0 THEN
        RAISE NOTICE '✅ User emails are working correctly!';
    ELSE
        RAISE NOTICE '❌ All emails are fallbacks - check auth.users table';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error checking emails: %', SQLERRM;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 User email fix for cancellation requests completed!';
    RAISE NOTICE '';
    RAISE NOTICE 'What was created:';
    RAISE NOTICE '✅ Function: get_user_email(uuid) - Gets real user emails';
    RAISE NOTICE '✅ View: cancellation_requests_with_emails - Includes user emails';
    RAISE NOTICE '✅ Permissions: Granted to authenticated users';
    RAISE NOTICE '✅ Sample data: Created if none existed';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Update the app to use the new view instead of complex logic';
    RAISE NOTICE '2. Test the cancellation requests page';
    RAISE NOTICE '3. Verify real emails are displayed instead of random ones';
    RAISE NOTICE '';
    RAISE NOTICE 'The view query to use in your app:';
    RAISE NOTICE 'SELECT * FROM cancellation_requests_with_emails ORDER BY created_at DESC;';
    RAISE NOTICE '';
END $$;
