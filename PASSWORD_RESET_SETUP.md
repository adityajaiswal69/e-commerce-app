# Password Reset Setup Guide

This guide will help you fix the password reset functionality in your Next.js + Supabase application.

## 🔧 Quick Fix Summary

The password reset links from Gmail weren't working due to:
1. Incorrect base URL configuration
2. Missing Supabase redirect URL configuration
3. Inadequate error handling in the auth callback

## ✅ Changes Made

### 1. Environment Configuration
- Fixed `NEXT_PUBLIC_BASE_URL` in `.env.local` from `https://localhost:3000/` to `http://localhost:3000`
- Removed trailing slash and corrected protocol for local development

### 2. Authentication Flow Improvements
- Updated `app/auth/callback/route.ts` to handle password recovery flows
- Added specific error handling for expired/invalid links
- Added logging for better debugging

### 3. Component Updates
- Modified `ResetPasswordForm.tsx` to use correct callback URL
- Added error message display from URL parameters
- Updated `UpdatePasswordForm.tsx` with better session validation
- Updated `ProfileInfo.tsx` to use consistent callback URL

### 4. Middleware Updates
- Improved `middleware.ts` to properly handle password reset flows
- Allow access to update-password page when user has valid session

## 🚀 Required Supabase Configuration

### Step 1: Configure Site URL
1. Go to your Supabase project dashboard
2. Navigate to **Authentication → Settings**
3. Set **Site URL** to: `http://localhost:3000` (for development)
4. For production, use your actual domain: `https://yourdomain.com`

### Step 2: Configure Redirect URLs
In the **Redirect URLs** section, add these URLs:

**For Development:**
```
http://localhost:3000/auth/callback
http://localhost:3000/auth/callback?type=recovery
```

**For Production:**
```
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/callback?type=recovery
```

### Step 3: Configure Email Templates
1. Go to **Authentication → Email Templates**
2. Select **Reset Password** template
3. Ensure the redirect URL in the template uses:
   ```
   {{ .SiteURL }}/auth/callback?type=recovery
   ```

## 🧪 Testing the Fix

### Method 1: Use the Debug Page
1. Visit `http://localhost:3000/debug-auth` in your browser
2. Click "Test Password Reset" button
3. Enter your email address
4. Check your email and click the reset link
5. The debug page will show detailed information about the auth flow

### Method 2: Manual Testing
1. Go to `http://localhost:3000/reset-password`
2. Enter your email address
3. Check your email for the reset link
4. Click the link in your email
5. You should be redirected to the update password page
6. Enter your new password and submit

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Issue: "Email link is invalid or has expired"
**Solution:** 
- Check that your Supabase Site URL matches your application URL exactly
- Ensure redirect URLs are configured correctly
- Links expire after 1 hour by default

#### Issue: "Invalid or expired password reset link"
**Solution:**
- The link may have been used already (links are single-use)
- Request a new password reset link
- Check browser console for detailed error messages

#### Issue: Redirect loops or 404 errors
**Solution:**
- Verify all redirect URLs in Supabase dashboard
- Check that `/auth/callback` route exists and is working
- Ensure middleware configuration is correct

#### Issue: "Session expired" error on update password page
**Solution:**
- This happens if too much time passes between clicking the email link and updating the password
- Request a new password reset link
- Complete the password update process quickly after clicking the email link

## 📝 Additional Notes

### Security Considerations
- Password reset links expire after 1 hour for security
- Links are single-use only
- Always use HTTPS in production
- Consider implementing rate limiting for password reset requests

### Development vs Production
- Use `http://localhost:3000` for local development
- Use `https://yourdomain.com` for production
- Update environment variables accordingly
- Test thoroughly in both environments

### Email Provider Considerations
- Some email providers (Gmail, Outlook) may modify links
- Test with different email providers
- Consider using a custom email service for production

## 🆘 Still Having Issues?

If you're still experiencing problems:

1. Check the browser console for JavaScript errors
2. Check the server logs for authentication errors
3. Use the debug page at `/debug-auth` to inspect the auth flow
4. Verify your Supabase project settings match this guide exactly
5. Try with a different email address or browser

## 📚 Related Documentation

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
