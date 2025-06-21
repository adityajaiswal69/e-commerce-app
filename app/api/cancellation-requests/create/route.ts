import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { order_id, reason, additional_details } = body;

    if (!order_id || !reason || !additional_details) {
      return NextResponse.json(
        { error: 'Missing required fields: order_id, reason, and additional_details are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify the order belongs to the user
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, status, payment_status')
      .eq('id', order_id)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found or access denied' },
        { status: 404 }
      );
    }

    // Check if order is eligible for cancellation
    const eligibleStatuses = ['pending', 'confirmed', 'processing'];
    if (!eligibleStatuses.includes(order.status)) {
      return NextResponse.json(
        { error: `Order cannot be cancelled. Current status: ${order.status}` },
        { status: 400 }
      );
    }

    // Check if cancellation request already exists (with error handling)
    try {
      const { data: existingRequest, error: checkError } = await supabase
        .from('cancellation_requests')
        .select('id')
        .eq('order_id', order_id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is what we want
        console.warn('Error checking existing cancellation request:', checkError);
        // Continue anyway - better to allow duplicate than block legitimate requests
      }

      if (existingRequest) {
        return NextResponse.json(
          { error: 'A cancellation request already exists for this order' },
          { status: 409 }
        );
      }
    } catch (checkErr) {
      console.warn('Could not check for existing cancellation request:', checkErr);
      // Continue anyway - don't block the request due to check failure
    }

    // Create cancellation request with enhanced error handling
    const cancellationData = {
      order_id,
      user_id: user.id,
      reason,
      additional_details: additional_details.trim(),
      status: 'pending'
    };

    console.log('Attempting to insert cancellation request:', cancellationData);

    const { data: cancellationRequest, error: insertError } = await supabase
      .from('cancellation_requests')
      .insert([cancellationData])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);

      // Handle specific error types
      if (insertError.message.includes('relation') && insertError.message.includes('does not exist')) {
        return NextResponse.json(
          { error: 'Database not properly configured. Please run the database migration script.' },
          { status: 500 }
        );
      }

      if (insertError.message.includes('permission denied for table users')) {
        return NextResponse.json(
          { error: 'Database permission error. Please run the users table permission fix script.' },
          { status: 500 }
        );
      }

      if (insertError.code === '42501') { // Permission denied
        return NextResponse.json(
          { error: 'Database permission error. Please check RLS policies and table permissions.' },
          { status: 500 }
        );
      }

      // Generic error handling
      return NextResponse.json(
        { error: `Database error: ${insertError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Cancellation request submitted successfully',
      data: cancellationRequest
    });

  } catch (error: any) {
    console.error('Error creating cancellation request:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check if a cancellation request exists for an order
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const order_id = searchParams.get('order_id');

    if (!order_id) {
      return NextResponse.json(
        { error: 'order_id parameter is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get cancellation request for the order
    const { data: cancellationRequest, error } = await supabase
      .from('cancellation_requests')
      .select('*')
      .eq('order_id', order_id)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: cancellationRequest || null
    });

  } catch (error: any) {
    console.error('Error fetching cancellation request:', error);
    
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
