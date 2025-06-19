# Payment System Setup Guide

## Error: "Error creating order: {}"

If you're seeing this error, it means the payment system database tables haven't been created yet. Follow these steps to fix it:

## Quick Fix

### Step 1: Run Database Migration

**Option A: Simple Setup (Recommended)**
1. Open your **Supabase Dashboard**
2. Go to **SQL Editor**
3. Copy and paste the contents of `scripts/simple-payment-setup.sql`
4. Click **Run** to execute the script

**Option B: Full Setup (Advanced)**
1. Use `scripts/setup-payment-system.sql` for complete features
2. If you get errors, use Option A instead

### Step 2: Verify Setup

**Option 1: Check Success Messages**
After running the script, you should see messages like:
```
Payment system setup completed successfully!
Tables created: orders, order_items, payment_transactions, payment_settings
RLS policies enabled for security
Order number generation configured
You can now use the checkout functionality!
```

**Option 2: Run Test Script**
1. Copy and paste `scripts/test-payment-setup.sql` in SQL Editor
2. Click **Run** to verify everything is working
3. Look for "🎉 SUCCESS" message

### Step 3: Test Checkout

1. Add items to your cart
2. Go to checkout
3. Fill in shipping address
4. Select payment method
5. Place order

## What the Script Does

The setup script creates these essential tables:

### 1. **orders** table
- Stores order information (user, totals, addresses, status)
- Includes automatic order number generation
- Supports multiple payment methods (Razorpay, Stripe, Paytm, COD)

### 2. **order_items** table  
- Stores individual items in each order
- Links to products and designs
- Includes product snapshots for historical data

### 3. **payment_transactions** table
- Tracks payment gateway transactions
- Stores provider responses and status
- Supports multiple payment providers

### 4. **payment_settings** table
- Stores payment provider configurations
- Admin-only access for security
- Supports test/live mode switching

## Security Features

- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own orders
- Admin-only access to payment settings
- Secure payment provider credential storage

## Payment Provider Configuration

After setup, configure payment providers in the admin panel:

1. Go to `/admin/payment-settings`
2. Enable desired payment providers
3. Add API keys and credentials
4. Test in sandbox mode first

## Troubleshooting

### Error: "relation 'orders' does not exist"
- Run the setup script in Supabase SQL Editor

### Error: "permission denied for table orders"  
- Check RLS policies are created correctly
- Ensure user is authenticated

### Error: "invalid input syntax for type uuid"
- Check product IDs are valid UUIDs
- Verify user authentication

### Payment Gateway Errors
- Check API credentials in payment settings
- Verify webhook URLs are configured
- Test in sandbox mode first

## Manual Verification

You can verify the setup by running this query in Supabase SQL Editor:

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('orders', 'order_items', 'payment_transactions', 'payment_settings');

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('orders', 'order_items', 'payment_transactions', 'payment_settings');
```

## Support

If you continue to have issues:

1. Check the browser console for detailed error messages
2. Verify your Supabase connection
3. Ensure all environment variables are set
4. Check the database logs in Supabase Dashboard

## Next Steps

Once the payment system is set up:

1. Configure payment providers (Razorpay, Stripe, Paytm)
2. Test the complete checkout flow
3. Set up webhook endpoints for payment confirmations
4. Configure email notifications for orders
5. Set up order management in the admin panel

The checkout system now supports:
- ✅ Multiple payment methods
- ✅ Order tracking and management  
- ✅ Secure payment processing
- ✅ Admin order management
- ✅ Customer order history
