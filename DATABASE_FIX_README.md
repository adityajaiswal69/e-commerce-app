# Database Fix: Orders Table Missing billing_address Column

## Problem
When clicking "Proceed Order" in the checkout process, you encounter this error:
```
Error: Could not find the 'billing_address' column of 'orders' in the schema cache
```

## Root Cause
The issue occurs because there are two different schema definitions for the orders table:

1. **Original schema** (`sql/schema/003_orders.sql`): Simple table with only basic columns
2. **Payment system schema** (`sql/schema/023_payment_system.sql`): Complete table with `billing_address`, `shipping_address`, and payment-related columns

The checkout code expects the complete schema with `billing_address` column, but your database might still be using the old schema.

## Solution

### Option 1: Quick Fix (Recommended)
Run the migration script in your Supabase SQL editor:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/fix-orders-table.sql`
4. Run the script

This will:
- Check if your orders table has the correct structure
- Drop and recreate the orders table with all required columns if needed
- Preserve data safety by checking the structure first
- Set up all necessary indexes, policies, and triggers

### Option 2: Manual Database Update
If you prefer to run the migration manually:

1. Open your Supabase SQL editor
2. Run the migration file: `sql/schema/024_fix_orders_table.sql`

### What the Fix Does

The migration script will:

1. **Check Current Structure**: Verifies if `billing_address` column exists
2. **Recreate Tables**: If needed, drops and recreates:
   - `orders` table with complete structure
   - `order_items` table with proper relationships
   - `payment_transactions` table for payment processing
3. **Set Up Security**: Enables Row Level Security (RLS) and creates proper policies
4. **Create Indexes**: Adds performance indexes for common queries
5. **Add Triggers**: Sets up automatic order number generation

### New Orders Table Structure

After the fix, your orders table will have these columns:

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- order_number (text, unique, auto-generated)
- status (text, with constraints)
- payment_status (text, with constraints)
- payment_method (text, optional)
- subtotal (decimal)
- tax_amount (decimal)
- shipping_amount (decimal)
- discount_amount (decimal)
- total_amount (decimal)
- currency (text, default 'INR')
- shipping_address (jsonb) ← This was missing
- billing_address (jsonb) ← This was missing
- notes (text, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

## Verification

After running the fix:

1. Try the checkout process again
2. The "billing_address" error should be resolved
3. Orders should be created successfully
4. You can verify the table structure in Supabase Table Editor

## Important Notes

- **Data Loss Warning**: This migration drops and recreates the orders table. If you have existing order data, it will be lost. 
- **Development Environment**: This fix is designed for development environments. For production, consider a more careful migration strategy.
- **Backup**: Always backup your database before running migrations in production.

## Files Updated

- `sql/schema/024_fix_orders_table.sql` - Migration script
- `scripts/fix-orders-table.sql` - Quick fix script
- `types/database.types.ts` - Updated TypeScript types
- `sql/schema/023_payment_system.sql` - Updated to handle existing tables

## Need Help?

If you encounter any issues:

1. Check the Supabase logs for detailed error messages
2. Verify your database connection
3. Ensure you have proper permissions to modify the database schema
4. Try running the script in smaller parts if needed

The checkout process should work normally after applying this fix.
