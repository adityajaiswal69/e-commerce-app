-- Setup script for cancellation requests system
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create orders table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
    payment_method TEXT CHECK (payment_method IN ('razorpay', 'stripe', 'paytm', 'cod')),
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'INR',
    shipping_address JSONB,
    billing_address JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create cancellation_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.cancellation_requests (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_cancellation_requests_order_id ON public.cancellation_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_user_id ON public.cancellation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_status ON public.cancellation_requests(status);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_created_at ON public.cancellation_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Users can manage their own cancellation requests" ON public.cancellation_requests;
DROP POLICY IF EXISTS "Admins can manage all cancellation requests" ON public.cancellation_requests;

-- RLS Policies for orders
CREATE POLICY "Users can view their own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders" ON public.orders
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin' OR
                auth.users.user_metadata->>'role' = 'admin'
            )
        )
    );

-- RLS Policies for cancellation_requests
CREATE POLICY "Users can manage their own cancellation requests" ON public.cancellation_requests
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all cancellation requests" ON public.cancellation_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND (
                auth.users.raw_user_meta_data->>'role' = 'admin' OR
                auth.users.user_metadata->>'role' = 'admin'
            )
        )
    );

-- Add constraint to prevent duplicate cancellation requests for same order
ALTER TABLE public.cancellation_requests 
DROP CONSTRAINT IF EXISTS unique_order_cancellation_request;

ALTER TABLE public.cancellation_requests 
ADD CONSTRAINT unique_order_cancellation_request 
UNIQUE (order_id);

-- Insert some test data if tables are empty
DO $$
DECLARE
    test_user_id uuid;
    test_order_id uuid;
BEGIN
    -- Get a test user (first user in auth.users)
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Check if orders table is empty
        IF NOT EXISTS (SELECT 1 FROM public.orders LIMIT 1) THEN
            -- Insert test order
            INSERT INTO public.orders (
                user_id, 
                order_number, 
                status, 
                payment_status, 
                payment_method, 
                total_amount,
                currency
            ) VALUES (
                test_user_id,
                'TEST-' || extract(epoch from now())::text,
                'confirmed',
                'paid',
                'razorpay',
                1299.99,
                'INR'
            ) RETURNING id INTO test_order_id;
            
            -- Insert test cancellation request
            INSERT INTO public.cancellation_requests (
                order_id,
                user_id,
                reason,
                additional_details,
                status
            ) VALUES (
                test_order_id,
                test_user_id,
                'Change of Mind',
                'Customer decided to cancel the order due to change of mind. Please process refund.',
                'pending'
            );
            
            RAISE NOTICE 'Test data inserted successfully!';
        ELSE
            RAISE NOTICE 'Orders table already has data, skipping test data insertion.';
        END IF;
    ELSE
        RAISE NOTICE 'No users found in auth.users, skipping test data insertion.';
    END IF;
END $$;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Cancellation requests system setup completed!';
    RAISE NOTICE 'Tables: orders, cancellation_requests';
    RAISE NOTICE 'Indexes and RLS policies configured';
    RAISE NOTICE 'Test data inserted if tables were empty';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Ensure you have admin users with role = "admin" in user metadata';
    RAISE NOTICE '2. Test the admin cancellation requests page';
    RAISE NOTICE '3. Run the test script: node scripts/test-cancellation-db.js';
END $$;
