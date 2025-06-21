-- Update cancellation reasons with new options
-- This script updates the existing cancellation reasons table with the new reasons

-- First, clear existing reasons to avoid conflicts
DELETE FROM public.cancellation_reasons;

-- Insert the updated cancellation reasons with new descriptions
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

-- Display success message
DO $$
BEGIN
    RAISE NOTICE '✅ Cancellation reasons updated successfully!';
    RAISE NOTICE 'New reasons added:';
    RAISE NOTICE '1. The delivery is taking longer than expected';
    RAISE NOTICE '2. I no longer need the product';
    RAISE NOTICE '3. I changed my mind about the purchase';
    RAISE NOTICE '4. I have already bought the product from another source due to urgency';
    RAISE NOTICE '5. The product was for a specific occasion, which has now passed';
    RAISE NOTICE 'Plus 5 additional standard reasons';
END $$;
