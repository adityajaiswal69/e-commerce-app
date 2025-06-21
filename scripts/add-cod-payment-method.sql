-- Add COD (Cash on Delivery) support to payment_settings table
-- This script updates the payment system to include COD as a configurable payment method

-- First, update the CHECK constraint to include 'cod' as a valid provider
ALTER TABLE public.payment_settings 
DROP CONSTRAINT IF EXISTS payment_settings_provider_check;

ALTER TABLE public.payment_settings 
ADD CONSTRAINT payment_settings_provider_check 
CHECK (provider IN ('razorpay', 'stripe', 'paytm', 'cod'));

-- Insert COD payment method if it doesn't exist
INSERT INTO public.payment_settings (provider, is_active, is_test_mode, settings) 
VALUES ('cod', true, false, '{"additional_charges": 20, "description": "Pay when your order is delivered"}')
ON CONFLICT (provider) DO NOTHING;

-- Update orders table payment_method constraint to include 'cod'
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_payment_method_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_payment_method_check 
CHECK (payment_method IN ('razorpay', 'stripe', 'paytm', 'cod'));

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ COD payment method added successfully!';
    RAISE NOTICE 'COD is now available as a configurable payment option.';
    RAISE NOTICE 'You can enable/disable it from the admin payment settings panel.';
END $$;
