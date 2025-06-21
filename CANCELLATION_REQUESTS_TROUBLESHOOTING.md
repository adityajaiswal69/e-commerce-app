# Cancellation Requests Database Troubleshooting Guide

## 🔍 Issue: Not Getting Any Results from Database

The cancellation requests page is showing no data. This guide will help you diagnose and fix the issue.

## 🛠️ Step-by-Step Troubleshooting

### Step 1: Check Database Setup

1. **Run the setup script in Supabase SQL Editor:**
   ```sql
   -- Copy and paste the contents of scripts/setup-cancellation-tables.sql
   -- This will create tables, indexes, and RLS policies
   ```

2. **Verify tables exist:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('orders', 'cancellation_requests');
   ```

### Step 2: Check Authentication & Admin Access

1. **Verify you're logged in as admin:**
   - Check your user metadata in Supabase Auth dashboard
   - Ensure `role: "admin"` is set in user metadata

2. **Test admin access:**
   ```sql
   SELECT 
     id, 
     email, 
     raw_user_meta_data,
     user_metadata
   FROM auth.users 
   WHERE raw_user_meta_data->>'role' = 'admin' 
      OR user_metadata->>'role' = 'admin';
   ```

### Step 3: Check Data Existence

1. **Check if you have orders:**
   ```sql
   SELECT COUNT(*) as order_count FROM public.orders;
   SELECT * FROM public.orders LIMIT 5;
   ```

2. **Check if you have cancellation requests:**
   ```sql
   SELECT COUNT(*) as request_count FROM public.cancellation_requests;
   SELECT * FROM public.cancellation_requests LIMIT 5;
   ```

### Step 4: Test the Query

1. **Test the exact query used in the app:**
   ```sql
   SELECT 
     cr.*,
     o.id as order_id,
     o.order_number,
     o.total_amount,
     o.payment_status,
     o.payment_method,
     o.created_at as order_created_at,
     o.user_id as order_user_id
   FROM public.cancellation_requests cr
   INNER JOIN public.orders o ON cr.order_id = o.id
   ORDER BY cr.created_at DESC;
   ```

### Step 5: Check RLS Policies

1. **Verify RLS policies are working:**
   ```sql
   -- This should return policies for both tables
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
   FROM pg_policies 
   WHERE tablename IN ('orders', 'cancellation_requests');
   ```

2. **Test RLS bypass (as service role):**
   ```sql
   SET role postgres; -- or your service role
   SELECT COUNT(*) FROM public.cancellation_requests;
   SELECT COUNT(*) FROM public.orders;
   ```

## 🔧 Quick Fixes

### Fix 1: Create Test Data

If you have no data, run this to create test data:

```sql
-- Insert test order
INSERT INTO public.orders (
  user_id, 
  order_number, 
  status, 
  payment_status, 
  payment_method, 
  total_amount
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'TEST-' || extract(epoch from now())::text,
  'confirmed',
  'paid',
  'razorpay',
  999.99
);

-- Insert test cancellation request
INSERT INTO public.cancellation_requests (
  order_id,
  user_id,
  reason,
  additional_details,
  status
) VALUES (
  (SELECT id FROM public.orders ORDER BY created_at DESC LIMIT 1),
  (SELECT id FROM auth.users LIMIT 1),
  'Test Reason',
  'This is a test cancellation request',
  'pending'
);
```

### Fix 2: Update Admin Role

If you're not recognized as admin:

```sql
-- Update your user to be admin
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

### Fix 3: Fix RLS Policies

If RLS is blocking access:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_requests DISABLE ROW LEVEL SECURITY;

-- Test your queries, then re-enable:
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancellation_requests ENABLE ROW LEVEL SECURITY;
```

## 🧪 Testing Tools

### 1. Run the Database Test Script

```bash
node scripts/test-cancellation-db.js
```

This will:
- Test database connection
- Check table existence
- Verify data access
- Create test data if needed

### 2. Check Browser Console

1. Open browser dev tools (F12)
2. Go to Console tab
3. Look for debug messages starting with:
   - `🔍 Fetching cancellation requests...`
   - `✅ Found X cancellation requests`
   - `❌ Database fetch error:`

### 3. Check Network Tab

1. Open Network tab in dev tools
2. Reload the page
3. Look for failed requests to Supabase
4. Check response status and error messages

## 🚨 Common Issues & Solutions

### Issue: "Authentication failed"
**Solution:** Make sure you're logged in and have admin role

### Issue: "Table doesn't exist"
**Solution:** Run the setup SQL script in Supabase

### Issue: "No data returned"
**Solutions:**
1. Create test data using the SQL above
2. Check RLS policies
3. Verify admin access

### Issue: "RLS policy violation"
**Solutions:**
1. Update user role to admin
2. Check policy definitions
3. Temporarily disable RLS for testing

### Issue: "Join query fails"
**Solution:** Ensure foreign key relationships exist between tables

## 📊 Expected Results

After fixing, you should see:

1. **In Browser Console:**
   ```
   🔍 Fetching cancellation requests...
   ✅ User authenticated: admin@example.com
   🔐 User admin status: true
   📊 Fetching cancellation requests from database...
   ✅ Found 1 cancellation requests
   ```

2. **In UI:**
   - Filter buttons showing counts: "All (1)", "Pending (1)", etc.
   - Table with cancellation request data
   - No "No cancellation requests" message

## 🎯 Next Steps

Once you see data:

1. Test filtering (All, Pending, Approved, Rejected)
2. Test the "Process" button on pending requests
3. Verify the modal opens correctly
4. Test approve/reject functionality

## 📞 Still Having Issues?

If you're still not seeing data:

1. Share the browser console output
2. Share the results of the test script
3. Confirm your Supabase project settings
4. Check if you have the correct environment variables

The enhanced error handling and debugging will help identify exactly where the issue is occurring!
