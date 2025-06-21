import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ProcessCancellationRequest } from '@/types/payment.types';

export async function POST(request: NextRequest) {
  try {
    const body: ProcessCancellationRequest = await request.json();
    const { cancellation_request_id, action, admin_notes, refund_amount } = body;

    if (!cancellation_request_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get current user (admin)
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify admin role (check user metadata from auth)
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get cancellation request with order details
    const { data: cancellationRequest, error: fetchError } = await supabase
      .from('cancellation_requests')
      .select(`
        *,
        orders (
          id,
          user_id,
          order_number,
          total_amount,
          payment_status,
          payment_method
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

    if (cancellationRequest.status !== 'pending') {
      return NextResponse.json(
        { error: 'Cancellation request has already been processed' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      admin_notes: admin_notes || null,
      processed_by: user.id,
      processed_at: new Date().toISOString()
    };

    // Handle refund for approved requests
    if (action === 'approve' && cancellationRequest.orders.payment_status === 'paid') {
      const finalRefundAmount = refund_amount || cancellationRequest.orders.total_amount;
      updateData.refund_amount = finalRefundAmount;
      updateData.refund_status = 'pending';

      // TODO: Integrate with actual payment gateway for refund processing
      // For now, we'll mark it as pending and handle it manually
    }

    // Update cancellation request
    const { error: updateError } = await supabase
      .from('cancellation_requests')
      .update(updateData)
      .eq('id', cancellation_request_id);

    if (updateError) {
      throw updateError;
    }

    // If approved, update order status
    if (action === 'approve') {
      const { error: orderError } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', cancellationRequest.order_id);

      if (orderError) {
        throw orderError;
      }
    }

    // Create notification record for email sending
    const { error: notificationError } = await supabase
      .from('cancellation_notifications')
      .insert({
        cancellation_request_id: cancellation_request_id,
        notification_type: action === 'approve' ? 'request_approved' : 'request_rejected',
        recipient_email: cancellationRequest.orders.user_id, // This will be resolved by the trigger
        email_status: 'pending'
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request for notification errors
    }

    return NextResponse.json({
      success: true,
      message: `Cancellation request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      data: {
        cancellation_request_id,
        action,
        refund_amount: updateData.refund_amount
      }
    });

  } catch (error) {
    console.error('Error processing cancellation request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get cancellation request details
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
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

    // Get cancellation request with related data
    const { data: cancellationRequest, error } = await supabase
      .from('cancellation_requests')
      .select(`
        *,
        orders (
          id,
          order_number,
          total_amount,
          payment_status,
          payment_method,
          created_at,
          user_id
        )
      `)
      .eq('id', id)
      .single();

    if (error || !cancellationRequest) {
      return NextResponse.json(
        { error: 'Cancellation request not found' },
        { status: 404 }
      );
    }

    // Check permissions - users can only see their own requests, admins can see all
    const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
    const isOwner = cancellationRequest.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add user email if admin is requesting (for display purposes)
    let responseData = cancellationRequest;
    if (isAdmin && cancellationRequest.orders?.user_id) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(cancellationRequest.orders.user_id);
        if (userData?.user) {
          responseData = {
            ...cancellationRequest,
            users: {
              email: userData.user.email,
              raw_user_meta_data: userData.user.user_metadata
            }
          };
        }
      } catch (err) {
        console.warn('Could not fetch user data:', err);
        // Continue without user data
      }
    }

    return NextResponse.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error fetching cancellation request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
