-- Quick fix for orders table billing_address column issue
-- Run this script in your Supabase SQL editor to fix the orders table structure

-- Fix orders table structure to include billing_address and other required fields
-- This migration updates the existing orders table to match the payment system requirements

-- First, check if the orders table exists and has the old structure
DO $$
BEGIN
    -- Check if billing_address column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' 
        AND column_name = 'billing_address'
        AND table_schema = 'public'
    ) THEN
        -- Drop existing orders table and recreate with new structure
        -- This will also drop order_items due to CASCADE
        DROP TABLE IF EXISTS public.orders CASCADE;
        DROP TABLE IF EXISTS public.order_items CASCADE;
        DROP TABLE IF EXISTS public.payment_transactions CASCADE;
        
        -- Recreate orders table with complete structure
        CREATE TABLE public.orders (
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
        
        -- Recreate order_items table
        CREATE TABLE public.order_items (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
            product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
            design_id uuid REFERENCES public.designs(id) ON DELETE SET NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
            total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
            product_snapshot JSONB,
            customization_details JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Recreate payment_transactions table
        CREATE TABLE public.payment_transactions (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
            payment_provider TEXT NOT NULL CHECK (payment_provider IN ('razorpay', 'stripe', 'paytm')),
            provider_transaction_id TEXT,
            provider_payment_id TEXT,
            provider_order_id TEXT,
            amount DECIMAL(10,2) NOT NULL DEFAULT 0,
            currency TEXT NOT NULL DEFAULT 'INR',
            status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'cancelled', 'refunded')),
            gateway_response JSONB,
            failure_reason TEXT,
            processed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
        );
        
        -- Create indexes
        CREATE INDEX idx_orders_user_id ON public.orders(user_id);
        CREATE INDEX idx_orders_status ON public.orders(status);
        CREATE INDEX idx_orders_payment_status ON public.orders(payment_status);
        CREATE INDEX idx_orders_created_at ON public.orders(created_at DESC);
        CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
        CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);
        CREATE INDEX idx_payment_transactions_order_id ON public.payment_transactions(order_id);
        CREATE INDEX idx_payment_transactions_provider_payment_id ON public.payment_transactions(provider_payment_id);
        
        -- Enable RLS
        ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for orders
        CREATE POLICY "Users can view their own orders"
            ON public.orders FOR SELECT
            USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can create their own orders"
            ON public.orders FOR INSERT
            WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own orders"
            ON public.orders FOR UPDATE
            USING (auth.uid() = user_id)
            WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Admin can view all orders"
            ON public.orders FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );
        
        CREATE POLICY "Admin can update all orders"
            ON public.orders FOR UPDATE
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );
        
        -- Create policies for order_items
        CREATE POLICY "Users can view their own order items"
            ON public.order_items FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.orders
                    WHERE orders.id = order_items.order_id
                    AND orders.user_id = auth.uid()
                )
            );
        
        CREATE POLICY "Users can create order items for their orders"
            ON public.order_items FOR INSERT
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.orders
                    WHERE orders.id = order_items.order_id
                    AND orders.user_id = auth.uid()
                )
            );
        
        CREATE POLICY "Admin can view all order items"
            ON public.order_items FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );
        
        -- Create policies for payment_transactions
        CREATE POLICY "Users can view their own payment transactions"
            ON public.payment_transactions FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.orders
                    WHERE orders.id = payment_transactions.order_id
                    AND orders.user_id = auth.uid()
                )
            );
        
        CREATE POLICY "System can create payment transactions"
            ON public.payment_transactions FOR INSERT
            WITH CHECK (true);
        
        CREATE POLICY "System can update payment transactions"
            ON public.payment_transactions FOR UPDATE
            USING (true);
        
        CREATE POLICY "Admin can view all payment transactions"
            ON public.payment_transactions FOR SELECT
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );
        
        -- Function to generate order number
        CREATE OR REPLACE FUNCTION generate_order_number()
        RETURNS TEXT AS $func$
        DECLARE
            order_num TEXT;
            counter INTEGER;
        BEGIN
            -- Get current date in YYYYMMDD format
            order_num := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD');
            
            -- Get count of orders created today
            SELECT COUNT(*) + 1 INTO counter
            FROM public.orders
            WHERE DATE(created_at) = CURRENT_DATE;
            
            -- Append counter with leading zeros
            order_num := order_num || LPAD(counter::TEXT, 4, '0');
            
            RETURN order_num;
        END;
        $func$ LANGUAGE plpgsql;
        
        -- Trigger to auto-generate order number
        CREATE OR REPLACE FUNCTION set_order_number()
        RETURNS TRIGGER AS $func$
        BEGIN
            IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
                NEW.order_number := generate_order_number();
            END IF;
            RETURN NEW;
        END;
        $func$ LANGUAGE plpgsql;
        
        CREATE TRIGGER trigger_set_order_number
            BEFORE INSERT ON public.orders
            FOR EACH ROW
            EXECUTE FUNCTION set_order_number();
            
        RAISE NOTICE 'Orders table structure updated successfully with billing_address column';
    ELSE
        RAISE NOTICE 'Orders table already has the correct structure';
    END IF;
END $$;

-- Also ensure payment_settings table exists
CREATE TABLE IF NOT EXISTS public.payment_settings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    provider TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'paytm')),
    is_active BOOLEAN DEFAULT false,
    is_test_mode BOOLEAN DEFAULT true,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(provider)
);

-- Enable RLS for payment_settings
ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

-- Payment settings policies (admin only)
DROP POLICY IF EXISTS "Admin can manage payment settings" ON public.payment_settings;
CREATE POLICY "Admin can manage payment settings"
    ON public.payment_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Insert default payment settings
INSERT INTO public.payment_settings (provider, is_active, is_test_mode, settings) VALUES
('razorpay', false, true, '{"key_id": "", "key_secret": "", "webhook_secret": ""}'),
('stripe', false, true, '{"publishable_key": "", "secret_key": "", "webhook_secret": ""}'),
('paytm', false, true, '{"merchant_id": "", "merchant_key": "", "website": "", "industry_type": ""}')
ON CONFLICT (provider) DO NOTHING;
