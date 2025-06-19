import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentSystemTables } from '@/lib/utils/database-check';

export async function GET(request: NextRequest) {
  try {
    const results = await checkPaymentSystemTables();
    
    return NextResponse.json({
      success: true,
      tables: results,
      allTablesExist: results.orders && results.order_items && results.payment_transactions && results.payment_settings,
      message: results.errors.length > 0 
        ? 'Some payment system tables are missing or inaccessible'
        : 'All payment system tables are available'
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check database status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
