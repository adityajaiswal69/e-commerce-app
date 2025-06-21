-- Quick setup script for cancellation system
-- Run this if you're getting table not found errors

-- Check if cancellation_requests table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cancellation_requests') THEN
        RAISE NOTICE 'Creating cancellation_requests table...';
        
        -- Create cancellation_requests table
        CREATE TABLE public.cancellation_requests (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          order_id uuid NOT NULL,
          user_id uuid NOT NULL,
          reason TEXT NOT NULL,
          additional_details TEXT,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
          admin_notes TEXT,
          processed_by uuid,
          processed_at TIMESTAMP WITH TIME ZONE,
          refund_amount DECIMAL(10,2),
          refund_status TEXT CHECK (refund_status IN ('pending', 'processing', 'completed', 'failed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        -- Create indexes
        CREATE INDEX idx_cancellation_requests_order_id ON public.cancellation_requests(order_id);
        CREATE INDEX idx_cancellation_requests_user_id ON public.cancellation_requests(user_id);
        CREATE INDEX idx_cancellation_requests_status ON public.cancellation_requests(status);

        -- Enable RLS
        ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Users can manage their own cancellation requests" ON public.cancellation_requests
          FOR ALL USING (auth.uid() = user_id);

        RAISE NOTICE '✅ cancellation_requests table created successfully!';
    ELSE
        RAISE NOTICE '✅ cancellation_requests table already exists';
    END IF;
END $$;

-- Check if cancellation_reasons table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cancellation_reasons') THEN
        RAISE NOTICE 'Creating cancellation_reasons table...';
        
        -- Create cancellation_reasons table
        CREATE TABLE public.cancellation_reasons (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          reason TEXT NOT NULL UNIQUE,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          display_order INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );

        RAISE NOTICE '✅ cancellation_reasons table created successfully!';
    ELSE
        RAISE NOTICE '✅ cancellation_reasons table already exists';
    END IF;
END $$;

-- Insert default cancellation reasons if table is empty
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM public.cancellation_reasons) = 0 THEN
        RAISE NOTICE 'Inserting default cancellation reasons...';
        
        INSERT INTO public.cancellation_reasons (reason, description, display_order) VALUES
        ('delivery_delay', 'The delivery is taking longer than expected', 1),
        ('no_longer_needed', 'I no longer need the product', 2),
        ('change_of_mind', 'I changed my mind about the purchase', 3),
        ('purchased_elsewhere', 'I have already bought the product from another source due to urgency', 4),
        ('time_sensitive_requirement', 'The product was for a specific occasion, which has now passed', 5),
        ('wrong_item', 'Ordered wrong item/size/color', 6),
        ('financial_reasons', 'Financial constraints', 7),
        ('duplicate_order', 'Accidentally placed duplicate order', 8),
        ('quality_concerns', 'Concerns about product quality', 9),
        ('other', 'Other reason (please specify)', 10);

        RAISE NOTICE '✅ Default cancellation reasons inserted successfully!';
    ELSE
        RAISE NOTICE '✅ Cancellation reasons already exist';
    END IF;
END $$;

-- Final success message
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Cancellation system setup completed successfully!';
    RAISE NOTICE '';
    RAISE NOTICE 'You can now:';
    RAISE NOTICE '1. Submit cancellation requests from order details pages';
    RAISE NOTICE '2. View and manage requests in the admin panel';
    RAISE NOTICE '3. Test the complete cancellation workflow';
    RAISE NOTICE '';
    RAISE NOTICE 'If you still get errors, check:';
    RAISE NOTICE '- Database connection is working';
    RAISE NOTICE '- User authentication is set up';
    RAISE NOTICE '- RLS policies are properly configured';
END $$;
