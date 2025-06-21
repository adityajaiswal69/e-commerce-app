# Cancellation System Troubleshooting Guide

## 🚨 Common Error: "Error submitting cancellation request: {}"

This error typically occurs when the database tables for the cancellation system haven't been created yet.

## 🔧 Quick Fix

### Step 1: Run the Setup Script
Execute this SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of scripts/setup-cancellation-system.sql
-- Or run: \i scripts/setup-cancellation-system.sql
```

### Step 2: Verify Tables Exist
Check if the tables were created:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('cancellation_requests', 'cancellation_reasons');

-- Check cancellation reasons data
SELECT * FROM cancellation_reasons ORDER BY display_order;
```

### Step 3: Test the API Endpoint
Test the API directly in your browser or Postman:

```
GET /api/cancellation-requests/create?order_id=test
```

Should return an authentication error (which means the endpoint is working).

## 🐛 Debugging Steps

### 1. Check Browser Console
Open browser developer tools and look for detailed error messages:
- Network tab: Check if API calls are failing
- Console tab: Look for specific error messages

### 2. Check Database Connection
Verify your Supabase connection:
```javascript
// Test in browser console
const { data, error } = await supabase.from('orders').select('id').limit(1);
console.log('Database test:', { data, error });
```

### 3. Check Authentication
Verify user is logged in:
```javascript
// Test in browser console
const { data: { user } } = await supabase.auth.getUser();
console.log('Current user:', user);
```

### 4. Check RLS Policies
Ensure Row Level Security policies are set up correctly:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'cancellation_requests';
```

## 🔍 Common Issues & Solutions

### Issue 1: "relation 'cancellation_requests' does not exist"
**Solution:** Run the setup script to create the tables.

### Issue 2: "Authentication required"
**Solution:** Make sure user is logged in before trying to cancel an order.

### Issue 3: "A cancellation request already exists for this order"
**Solution:** This is expected behavior - each order can only have one cancellation request.

### Issue 4: "Order cannot be cancelled. Current status: shipped"
**Solution:** Orders can only be cancelled when status is pending, confirmed, or processing.

### Issue 5: Empty error object "{}"
**Solution:** This usually means a network error or the API endpoint isn't responding. Check:
- Is the development server running?
- Are there any network connectivity issues?
- Check the Network tab in browser dev tools

## 🧪 Testing Checklist

### Database Setup
- [ ] Tables `cancellation_requests` and `cancellation_reasons` exist
- [ ] Default cancellation reasons are inserted
- [ ] RLS policies are enabled and configured

### API Endpoints
- [ ] `/api/cancellation-requests/create` responds (even with auth error)
- [ ] Authentication is working
- [ ] User can access their own orders

### Frontend
- [ ] Order details page loads without errors
- [ ] Cancel button appears for eligible orders
- [ ] Modal opens with cancellation reasons
- [ ] Form validation works
- [ ] Success/error messages display

### End-to-End
- [ ] User can submit cancellation request
- [ ] Request appears in admin panel
- [ ] Admin can approve/reject request
- [ ] Email notifications work (if configured)

## 📞 Getting Help

If you're still experiencing issues:

1. **Check the browser console** for detailed error messages
2. **Run the setup script** to ensure database tables exist
3. **Verify authentication** is working properly
4. **Test with a simple order** that's eligible for cancellation

### Debug Information to Collect
When reporting issues, include:
- Browser console errors (full error messages)
- Network tab showing failed requests
- Current user authentication status
- Order status and details
- Database table existence confirmation

## 🎯 Quick Test

To quickly test if everything is working:

1. **Create a test order** with status "pending"
2. **Go to order details page** `/orders/[order-id]`
3. **Click "Cancel Order"** button
4. **Select a reason** and provide explanation
5. **Submit the request**
6. **Check admin panel** at `/admin/cancellation-requests`

If any step fails, check the corresponding section above for troubleshooting steps.

## ✅ Success Indicators

You'll know everything is working when:
- ✅ Order details page loads without console errors
- ✅ Cancel button appears for eligible orders
- ✅ Modal opens with 10 cancellation reasons
- ✅ Form validation prevents invalid submissions
- ✅ Success message appears after submission
- ✅ Request appears in admin panel
- ✅ No console errors during the entire process

The cancellation system should now work smoothly!
