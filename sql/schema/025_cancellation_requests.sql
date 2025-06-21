-- Create cancellation requests system
-- This schema supports customer cancellation requests and admin management

-- Create cancellation_requests table
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
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_order_id ON public.cancellation_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_user_id ON public.cancellation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_status ON public.cancellation_requests(status);
CREATE INDEX IF NOT EXISTS idx_cancellation_requests_created_at ON public.cancellation_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cancellation_requests
-- Users can view and create their own cancellation requests
CREATE POLICY "Users can manage their own cancellation requests" ON public.cancellation_requests
  FOR ALL USING (auth.uid() = user_id);

-- Admins can view and manage all cancellation requests
CREATE POLICY "Admins can manage all cancellation requests" ON public.cancellation_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_cancellation_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_cancellation_requests_updated_at ON public.cancellation_requests;
CREATE TRIGGER update_cancellation_requests_updated_at
  BEFORE UPDATE ON public.cancellation_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_cancellation_requests_updated_at();

-- Add constraint to prevent duplicate cancellation requests for same order
ALTER TABLE public.cancellation_requests 
ADD CONSTRAINT unique_order_cancellation_request 
UNIQUE (order_id);

-- Create predefined cancellation reasons (for reference)
CREATE TABLE IF NOT EXISTS public.cancellation_reasons (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  reason TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default cancellation reasons
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
('other', 'Other reason (please specify)', 10)
ON CONFLICT (reason) DO NOTHING;

-- Create notification preferences table for cancellation emails
CREATE TABLE IF NOT EXISTS public.cancellation_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  cancellation_request_id uuid REFERENCES public.cancellation_requests(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('request_created', 'request_approved', 'request_rejected', 'refund_processed')),
  recipient_email TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  email_status TEXT DEFAULT 'pending' CHECK (email_status IN ('pending', 'sent', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_cancellation_notifications_request_id ON public.cancellation_notifications(cancellation_request_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_notifications_status ON public.cancellation_notifications(email_status);

-- Enable RLS for notifications
ALTER TABLE public.cancellation_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policy for notifications (admin only)
CREATE POLICY "Admins can manage cancellation notifications" ON public.cancellation_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create function to automatically create notification records
CREATE OR REPLACE FUNCTION create_cancellation_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Create notification for request creation
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.cancellation_notifications (
      cancellation_request_id,
      notification_type,
      recipient_email
    )
    SELECT 
      NEW.id,
      'request_created',
      auth.users.email
    FROM auth.users 
    WHERE auth.users.id = NEW.user_id;
    
    RETURN NEW;
  END IF;
  
  -- Create notification for status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO public.cancellation_notifications (
      cancellation_request_id,
      notification_type,
      recipient_email
    )
    SELECT 
      NEW.id,
      CASE 
        WHEN NEW.status = 'approved' THEN 'request_approved'
        WHEN NEW.status = 'rejected' THEN 'request_rejected'
        ELSE 'request_created'
      END,
      auth.users.email
    FROM auth.users 
    WHERE auth.users.id = NEW.user_id;
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic notifications
DROP TRIGGER IF EXISTS create_cancellation_notification_trigger ON public.cancellation_requests;
CREATE TRIGGER create_cancellation_notification_trigger
  AFTER INSERT OR UPDATE ON public.cancellation_requests
  FOR EACH ROW
  EXECUTE FUNCTION create_cancellation_notification();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Cancellation requests system created successfully!';
    RAISE NOTICE 'Tables created: cancellation_requests, cancellation_reasons, cancellation_notifications';
    RAISE NOTICE 'RLS policies and triggers configured';
    RAISE NOTICE 'Default cancellation reasons inserted';
END $$;
