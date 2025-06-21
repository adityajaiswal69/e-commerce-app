import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  generateCancellationRequestEmail,
  generateCancellationApprovedEmail,
  generateCancellationRejectedEmail,
  sendCancellationEmail,
  CancellationEmailData
} from '@/lib/email/cancellation-notifications';

export async function POST(request: NextRequest) {
  try {
    const { cancellation_request_id, notification_type } = await request.json();

    if (!cancellation_request_id || !notification_type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get cancellation request with order and user details
    const { data: cancellationRequest, error: fetchError } = await supabase
      .from('cancellation_requests')
      .select(`
        *,
        orders (
          id,
          order_number,
          total_amount,
          payment_status,
          payment_method,
          user_id
        )
      `)
      .eq('id', cancellation_request_id)
      .single();

    if (fetchError || !cancellationRequest) {
      return NextResponse.json(
        { error: 'Cancellation request not found' },
        { status: 404 }
      );
    }

    // Get user details
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, raw_user_meta_data')
      .eq('id', cancellationRequest.orders.user_id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Prepare email data
    const emailData: CancellationEmailData = {
      customerEmail: userData.email,
      customerName: userData.raw_user_meta_data?.name || userData.raw_user_meta_data?.full_name,
      orderNumber: cancellationRequest.orders.order_number || cancellationRequest.orders.id.slice(0, 8),
      orderAmount: cancellationRequest.orders.total_amount,
      cancellationReason: cancellationRequest.reason,
      adminNotes: cancellationRequest.admin_notes,
      refundAmount: cancellationRequest.refund_amount,
      refundStatus: cancellationRequest.refund_status
    };

    // Generate appropriate email content based on notification type
    let emailContent;
    switch (notification_type) {
      case 'request_created':
        emailContent = generateCancellationRequestEmail(emailData);
        break;
      case 'request_approved':
        emailContent = generateCancellationApprovedEmail(emailData);
        break;
      case 'request_rejected':
        emailContent = generateCancellationRejectedEmail(emailData);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    // Send email
    const emailSent = await sendCancellationEmail(emailContent);

    // Update notification status
    const { error: updateError } = await supabase
      .from('cancellation_notifications')
      .update({
        sent_at: emailSent ? new Date().toISOString() : null,
        email_status: emailSent ? 'sent' : 'failed',
        error_message: emailSent ? null : 'Failed to send email'
      })
      .eq('cancellation_request_id', cancellation_request_id)
      .eq('notification_type', notification_type);

    if (updateError) {
      console.error('Error updating notification status:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: emailSent ? 'Email sent successfully' : 'Failed to send email',
      data: {
        cancellation_request_id,
        notification_type,
        email_sent: emailSent,
        recipient: emailData.customerEmail
      }
    });

  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get notification history for a cancellation request
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cancellation_request_id = searchParams.get('cancellation_request_id');

    if (!cancellation_request_id) {
      return NextResponse.json(
        { error: 'Cancellation request ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get notifications for the cancellation request
    const { data: notifications, error } = await supabase
      .from('cancellation_notifications')
      .select('*')
      .eq('cancellation_request_id', cancellation_request_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: notifications || []
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
