# Payment Method Toggle System

This document explains how to use the payment method toggle system that allows administrators to enable/disable payment methods dynamically.

## Overview

The payment method toggle system allows administrators to:
- Enable/disable individual payment methods (Razorpay, Stripe, Paytm, COD)
- Configure payment method settings only when they are active
- Automatically show only enabled payment methods to customers during checkout
- Handle cases where no payment methods are available

## Setup

### 1. Database Setup

First, run the COD support migration:

```sql
-- Run this in your Supabase SQL Editor
-- File: scripts/add-cod-payment-method.sql
```

This will:
- Add COD as a valid payment provider
- Create default COD settings
- Update database constraints

### 2. Admin Panel Usage

#### Accessing Payment Settings
1. Go to `/admin/payment-settings`
2. You'll see all available payment methods with toggle switches

#### Configuring Payment Methods

**For each payment method, you can:**
- **Toggle Active Status**: Use the "Active" toggle switch to enable/disable the payment method for orders
- **Configure Settings**: When a payment method is active, you can configure both test and live API keys
- **Test Mode**: For gateway providers (not COD), toggle between test and live mode for processing orders

**Payment Method Specific Settings:**

**Razorpay:**
- **Test Mode Configuration:**
  - Test Key ID (required)
  - Test Key Secret (required)
  - Test Webhook Secret (optional)
- **Live Mode Configuration:**
  - Live Key ID (required)
  - Live Key Secret (required)
  - Live Webhook Secret (optional)

**Stripe:**
- **Test Mode Configuration:**
  - Test Publishable Key (required)
  - Test Secret Key (required)
  - Test Webhook Secret (optional)
- **Live Mode Configuration:**
  - Live Publishable Key (required)
  - Live Secret Key (required)
  - Live Webhook Secret (optional)

**Paytm:**
- **Test Mode Configuration:**
  - Test Merchant ID (required)
  - Test Merchant Key (required)
  - Test Website (required)
  - Test Industry Type (required)
- **Live Mode Configuration:**
  - Live Merchant ID (required)
  - Live Merchant Key (required)
  - Live Website (required)
  - Live Industry Type (required)

**COD (Cash on Delivery):**
- Additional Charges (optional, in ₹)
- Description (optional)

#### Saving Settings
- Click "Save Settings" for each payment method after making changes
- Settings are saved individually for each provider
- You can save settings even when a payment method is disabled

## Frontend Behavior

### Checkout Page

**When payment methods are enabled:**
- Only enabled payment methods appear in the payment method selector
- COD appears only if specifically enabled
- Users can select from available methods

**When no payment methods are enabled:**
- A warning message appears: "No Payment Methods Available"
- The checkout button is disabled
- Users cannot complete their order

**Dynamic Updates:**
- If the currently selected payment method is disabled, the system automatically selects the first available method
- The checkout form adapts to show only available options

## Testing

### Manual Testing Steps

1. **Test Admin Panel:**
   ```
   1. Go to /admin/payment-settings
   2. Toggle different payment methods on/off
   3. Configure settings for enabled methods
   4. Save settings and verify success messages
   ```

2. **Test Checkout Integration:**
   ```
   1. Add items to cart and go to checkout
   2. Verify only enabled payment methods appear
   3. Try disabling all methods and check warning message
   4. Enable different combinations and verify updates
   ```

3. **Test Database Integration:**
   ```
   Run: scripts/test-payment-method-toggles.sql
   This will test all database operations
   ```

### Automated Testing

Run the test script to verify database functionality:

```bash
# In Supabase SQL Editor, run:
scripts/test-payment-method-toggles.sql
```

## API Integration

### Fetching Enabled Payment Methods

The checkout form uses this query to get enabled payment methods:

```javascript
const { data: settings } = await supabase
  .from('payment_settings')
  .select('provider')
  .eq('is_active', true);
```

### Payment Method Validation

Before processing payments, validate that the selected method is still enabled:

```javascript
const isMethodEnabled = await supabase
  .from('payment_settings')
  .select('is_active')
  .eq('provider', selectedMethod)
  .eq('is_active', true)
  .single();
```

## Security Considerations

- Only authenticated admin users can access `/admin/payment-settings`
- Payment credentials are stored securely in the database
- Sensitive fields (API keys, secrets) are masked in the UI
- Test mode settings help prevent accidental live transactions

## Troubleshooting

### Common Issues

**1. "No Payment Methods Available" message:**
- Check that at least one payment method is enabled in admin panel
- Verify database connection and payment_settings table exists

**2. Payment method not appearing in checkout:**
- Ensure the payment method is marked as active in admin panel
- Check browser console for any JavaScript errors
- Verify the payment method is properly configured

**3. Settings not saving:**
- Check admin authentication
- Verify database permissions
- Look for validation errors in browser console

### Database Queries for Debugging

```sql
-- Check current payment method status
SELECT provider, is_active, is_test_mode 
FROM payment_settings 
ORDER BY provider;

-- Check specific payment method settings
SELECT * FROM payment_settings 
WHERE provider = 'razorpay';

-- Enable all payment methods (emergency fix)
UPDATE payment_settings SET is_active = true;
```

## Migration Notes

If upgrading from a previous version:
1. Run `scripts/add-cod-payment-method.sql` to add COD support
2. Existing payment methods will remain enabled by default
3. Configure COD settings if you want to use Cash on Delivery
4. Test the admin panel and checkout flow thoroughly

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify database table structure matches the schema
3. Test with the provided SQL scripts
4. Check that all required environment variables are set
