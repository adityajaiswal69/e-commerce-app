# Fix: "Database permission error" for Cancellation Requests

## 🚨 Issue
Getting "Database permission error" when accessing `/admin/cancellation-requests` page.

## 🔍 Root Causes
This error can occur due to:
1. **Missing cancellation_requests table** or incorrect structure
2. **Restrictive RLS policies** blocking access to cancellation_requests
3. **Admin API permissions** - `supabase.auth.admin.listUsers()` requires special permissions
4. **Missing table permissions** for authenticated users
5. **Foreign key constraint issues** with orders/users tables

## ⚡ Quick Fix (3 Steps)

### Step 1: Run Permission Fix Script
1. **Open Supabase Dashboard** → **SQL Editor**
2. **Copy and paste** contents of `scripts/fix-cancellation-permissions.sql`
3. **Click "Run"** - this will:
   - Create/update cancellation_requests table
   - Grant proper permissions
   - Create permissive RLS policies
   - Add sample data

### Step 2: Test the Fix
1. **Copy and paste** contents of `scripts/test-cancellation-permissions.sql`
2. **Click "Run"** - look for "Cancellation request creation test PASSED!"

### Step 3: Try the Admin Page
1. **Go to** `/admin/cancellation-requests`
2. **Should now load** without permission errors

## 🛠️ What the Fix Does

### 1. **Creates Proper Table Structure**
```sql
CREATE TABLE IF NOT EXISTS public.cancellation_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reason TEXT NOT NULL,
    additional_details TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    processed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    -- ... more fields
);
```

### 2. **Grants Comprehensive Permissions**
```sql
-- Allow authenticated users full access
GRANT ALL ON public.cancellation_requests TO authenticated;
GRANT SELECT ON public.cancellation_requests TO anon;
```

### 3. **Creates Permissive RLS Policies**
```sql
-- Very permissive policies for testing
CREATE POLICY "authenticated_all_cancellation_requests" ON public.cancellation_requests
FOR ALL TO authenticated USING (true) WITH CHECK (true);
```

### 4. **Fixes Admin API Issues**
- Updated the page code to handle admin API failures gracefully
- Provides fallback user display when admin.listUsers() fails
- Better error handling for permission issues

### 5. **Creates Sample Data**
- Adds sample cancellation request if none exist
- Links to existing orders or creates test orders
- Ensures there's data to display

## 🎯 Expected Results

After running the fix:

### ✅ **Page Should Load Successfully**
- No "Database permission error"
- Shows cancellation requests (at least 1 sample)
- Filter buttons work (All, Pending, Approved, Rejected)

### ✅ **Test Results Should Show**
```
✅ Can access cancellation_requests table
✅ Complex query works - found X cancellation requests
✅ Created test cancellation request: [uuid]
🎉 Cancellation request creation test PASSED!
```

### ✅ **Admin Page Features**
- View cancellation requests list
- Filter by status
- Process requests (approve/reject)
- View order details

## 🔧 Alternative Fixes

### If Still Getting Permission Errors:

**Option 1: Disable RLS Temporarily**
```sql
ALTER TABLE public.cancellation_requests DISABLE ROW LEVEL SECURITY;
-- Test the page, then re-enable with proper policies
```

**Option 2: Check Service Role Key**
Make sure you're using the correct Supabase service role key in your environment variables:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Option 3: Manual Admin Role Setup**
```sql
-- Ensure your user has admin role
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

## 🧪 Testing Steps

After applying the fix:

1. **Check Browser Console** - should see debug logs:
   ```
   🔍 Fetching cancellation requests...
   ✅ Found X cancellation requests
   👥 Fetching user data for cancellation requests...
   ```

2. **Verify Page Elements**:
   - Filter buttons show counts
   - Cancellation requests table displays
   - Process buttons are clickable

3. **Test Functionality**:
   - Click different filter tabs
   - Try processing a request
   - Check modal opens correctly

## 📊 Common Error Messages & Solutions

### "permission denied for table cancellation_requests"
**Solution:** Run the permission fix script

### "relation 'public.cancellation_requests' does not exist"
**Solution:** The fix script creates the table

### "new row violates row-level security policy"
**Solution:** The permissive policies in the fix resolve this

### "permission denied for function auth.admin.listUsers"
**Solution:** Updated code handles this gracefully with fallback

### "foreign key constraint fails"
**Solution:** Ensure orders table exists and has proper data

## 🎉 Success Indicators

You'll know the fix worked when:
- ✅ `/admin/cancellation-requests` loads without errors
- ✅ Shows at least 1 sample cancellation request
- ✅ Filter buttons show proper counts
- ✅ No console errors in browser dev tools
- ✅ Process modal opens when clicking "Process" button

## 📞 Still Having Issues?

If the fix doesn't work:

1. **Share the exact error message** from browser console
2. **Run the test script** and share the output
3. **Check Supabase logs** in Dashboard → Logs → API
4. **Verify environment variables** are correct
5. **Confirm user has admin role** in Supabase Auth

## 🔄 Next Steps

Once cancellation requests are working:

1. **Test the full workflow**:
   - Customer creates cancellation request
   - Admin reviews and processes
   - Status updates correctly

2. **Add real data**:
   - Create actual orders
   - Submit real cancellation requests
   - Test with multiple users

3. **Customize the system**:
   - Add more cancellation reasons
   - Implement email notifications
   - Add refund processing

The permission fix is comprehensive and should resolve all database permission issues for cancellation requests!
