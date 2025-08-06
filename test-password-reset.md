# Password Reset Test Guide

## Current Configuration
- **App URL**: http://localhost:3002
- **Callback URL**: http://localhost:3002/auth/callback?type=recovery

## Required Supabase Settings

### 1. Site URL
```
http://localhost:3002
```

### 2. Redirect URLs
```
http://localhost:3002/auth/callback
http://localhost:3002/auth/callback?type=recovery
```

## Test Steps

1. **Go to**: http://localhost:3002/reset-password
2. **Enter your email address**
3. **Click "Reset Password"**
4. **Check your email** for the reset link
5. **Click the link** in your email
6. **You should be redirected to**: http://localhost:3002/auth/update-password
7. **Enter your new password**
8. **Click "Update Password"**
9. **You should be redirected to sign-in with success message**

## Troubleshooting

If you still get "Invalid or expired link":

1. **Double-check Supabase settings** match exactly
2. **Clear browser cookies** for localhost:3002
3. **Try in incognito/private mode**
4. **Check browser console** for any errors
5. **Verify email link** points to localhost:3002 (not 3000)

## Expected Email Link Format
```
https://pymuowzbfwsmxgufyogc.supabase.co/auth/v1/verify?token=...&type=recovery&redirect_to=http://localhost:3002/auth/callback?type=recovery
```

The `redirect_to` parameter should point to your correct port (3002).
