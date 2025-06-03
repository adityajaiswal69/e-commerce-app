# How to Fix the "Database error saving new user" Issue

This guide will help you apply the SQL fix to resolve the user creation error in your Supabase database.

## Option 1: Using the Supabase Dashboard (Recommended)

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Select your project: "pymuowzbfwsmxgufyogc"
3. Go to the SQL Editor in the left sidebar
4. Create a new query
5. Copy and paste the contents of the `sql/schema/009_fix_user_creation.sql` file
6. Click "Run" to execute the SQL commands

## Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run:

```bash
supabase db push --db-url "your-connection-string" sql/schema/009_fix_user_creation.sql
```

## Verification

After applying the fix, try to create a new user again. The error should be resolved.

## What This Fix Does

1. Drops and recreates the user creation trigger with better error handling
2. Adds the missing RLS (Row Level Security) policies for user insertion
3. Grants the necessary permissions to the Supabase roles
4. Uses SECURITY DEFINER to ensure the function runs with elevated privileges

If you continue to experience issues, please check the Supabase logs for more detailed error messages.
