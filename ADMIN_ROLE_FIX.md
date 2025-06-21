# Fix: "Insufficient permissions - admin access required"

## 🚨 Issue Analysis
**Error Location:** `app/admin/cancellation-requests/page.tsx` line 30
**Root Cause:** User doesn't have admin role set in their metadata

The error occurs because the admin check fails:
```typescript
const isAdmin = user.user_metadata?.role === 'admin' || user.app_metadata?.role === 'admin';
if (!isAdmin) {
  throw new Error('Insufficient permissions - admin access required');
}
```

## 🔍 Deep Analysis

### Why This Happens:
1. **New Supabase users** don't have admin role by default
2. **User metadata** is empty or doesn't contain `role: "admin"`
3. **App metadata** is not set with admin permissions
4. **Manual role assignment** was never done

### Where Admin Role Can Be Stored:
- `user_metadata.role` - User-editable metadata
- `app_metadata.role` - App-controlled metadata  
- `raw_user_meta_data.role` - Raw user metadata

## ⚡ Immediate Fix (3 Steps)

### Step 1: Check Current User Status
1. **Open Supabase Dashboard** → **SQL Editor**
2. **Run** `scripts/test-admin-role.sql`
3. **Look for** admin users in the output

### Step 2: Set Admin Role
1. **Run** `scripts/fix-admin-role.sql` 
2. **This will:**
   - Check all users and their current roles
   - Set admin role for all users (for testing)
   - Verify the role updates worked

### Step 3: Test Access
1. **Go to** `/admin/cancellation-requests`
2. **Should now work** without permission error

## 🛠️ Manual Fix (If Scripts Don't Work)

### Option 1: Set Specific User as Admin
```sql
-- Replace 'your-email@example.com' with your actual email
UPDATE auth.users 
SET 
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
  user_metadata = COALESCE(user_metadata, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE email = 'your-email@example.com';
```

### Option 2: Set All Users as Admin (Testing)
```sql
-- Make all users admin (for development/testing)
UPDATE auth.users 
SET 
  raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb,
  user_metadata = COALESCE(user_metadata, '{}'::jsonb) || '{"role": "admin"}'::jsonb;
```

### Option 3: Temporary Bypass (Development Only)
```typescript
// In app/admin/cancellation-requests/page.tsx
// Comment out the admin check temporarily:
/*
if (!isAdmin) {
  throw new Error('Insufficient permissions - admin access required');
}
*/
```

## 🎯 Expected Results

### ✅ **After Running Fix:**

**Browser Console Should Show:**
```
✅ User authenticated: your-email@example.com
🔍 Checking admin roles:
  - user_metadata.role: admin
  - app_metadata.role: null
  - raw_user_meta_data.role: admin
  - user.email: your-email@example.com
🔐 User admin status: true
📊 Fetching cancellation requests from database...
```

**Page Should:**
- Load without errors
- Show cancellation requests interface
- Display filter buttons and data

### ❌ **Before Fix (Error State):**
```
✅ User authenticated: your-email@example.com
🔍 Checking admin roles:
  - user_metadata.role: undefined
  - app_metadata.role: undefined  
  - raw_user_meta_data.role: undefined
🔐 User admin status: false
❌ Admin access denied. User metadata: {...}
Error: Insufficient permissions - admin access required
```

## 🔧 Verification Steps

### 1. Check User Metadata in Supabase
1. **Go to** Supabase Dashboard → **Authentication** → **Users**
2. **Click on your user**
3. **Check** Raw User Meta Data and User Meta Data
4. **Should see** `"role": "admin"`

### 2. Test Admin Check Function
```sql
-- Test the admin check for your email
SELECT * FROM check_user_admin_status('your-email@example.com');
```

### 3. Browser Console Verification
1. **Open** `/admin/cancellation-requests`
2. **Check console** for admin status logs
3. **Should see** `🔐 User admin status: true`

## 🚨 Troubleshooting

### Issue: "User not found"
**Solution:** Make sure you're using the correct email address

### Issue: "Still getting permission error"
**Solutions:**
1. Clear browser cache and cookies
2. Sign out and sign in again
3. Check if you're using the right Supabase project
4. Verify environment variables

### Issue: "Role not updating"
**Solutions:**
1. Check SQL execution was successful
2. Refresh the user session
3. Try setting both user_metadata and raw_user_meta_data

### Issue: "Multiple admin checks failing"
**Solution:** Use the temporary bypass option for development

## 📊 Understanding the Admin Check

The app checks for admin role in this order:
```typescript
const rawMetaRole = user.user_metadata?.role;        // User-editable
const appMetaRole = user.app_metadata?.role;         // App-controlled  
const rawUserMetaRole = user.raw_user_meta_data?.role; // Raw metadata

const isAdmin = rawMetaRole === 'admin' || 
               appMetaRole === 'admin' || 
               rawUserMetaRole === 'admin';
```

## 🎉 Success Indicators

You'll know the fix worked when:
- ✅ No "Insufficient permissions" error
- ✅ Cancellation requests page loads
- ✅ Console shows `🔐 User admin status: true`
- ✅ Can access other admin pages without issues

## 🔒 Security Notes

### For Production:
1. **Don't make all users admin** - only specific users
2. **Use app_metadata** for admin roles (more secure)
3. **Implement proper role-based access control**
4. **Regular audit** of admin users

### For Development:
1. **Making all users admin is OK** for testing
2. **Use the bypass option** if needed temporarily
3. **Remember to implement proper security** before going live

## 📞 Still Having Issues?

If the fix doesn't work:
1. **Share the output** of `scripts/test-admin-role.sql`
2. **Check browser console** for the exact admin check logs
3. **Verify your email address** in Supabase Auth dashboard
4. **Try the manual SQL commands** directly

The admin role fix should resolve the permission error immediately!
