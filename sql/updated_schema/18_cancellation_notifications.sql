-- =====================================================
-- CANCELLATION_NOTIFICATIONS TABLE SCHEMA
-- =====================================================
-- Email notifications for cancellation requests
-- =====================================================

-- Cancellation notifications table
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

-- Disable RLS for cancellation notifications (simplified approach)
ALTER TABLE public.cancellation_notifications DISABLE ROW LEVEL SECURITY;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS cancellation_notifications_request_id_idx ON public.cancellation_notifications(cancellation_request_id);
CREATE INDEX IF NOT EXISTS cancellation_notifications_status_idx ON public.cancellation_notifications(email_status);
CREATE INDEX IF NOT EXISTS cancellation_notifications_type_idx ON public.cancellation_notifications(notification_type);
CREATE INDEX IF NOT EXISTS cancellation_notifications_created_at_idx ON public.cancellation_notifications(created_at DESC);

-- Comments
COMMENT ON TABLE public.cancellation_notifications IS 'Email notifications for cancellation requests';
COMMENT ON COLUMN public.cancellation_notifications.id IS 'Unique identifier for the notification';
COMMENT ON COLUMN public.cancellation_notifications.cancellation_request_id IS 'Reference to the cancellation request';
COMMENT ON COLUMN public.cancellation_notifications.notification_type IS 'Type of notification (request_created, request_approved, request_rejected, refund_processed)';
COMMENT ON COLUMN public.cancellation_notifications.recipient_email IS 'Email address of the recipient';
COMMENT ON COLUMN public.cancellation_notifications.sent_at IS 'Timestamp when email was sent';
COMMENT ON COLUMN public.cancellation_notifications.email_status IS 'Email delivery status (pending, sent, failed)';
COMMENT ON COLUMN public.cancellation_notifications.error_message IS 'Error message if email failed to send';
COMMENT ON COLUMN public.cancellation_notifications.created_at IS 'Timestamp when notification was created'; 