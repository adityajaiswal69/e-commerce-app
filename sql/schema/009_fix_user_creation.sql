-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create an improved trigger function for user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with explicit role to ensure it matches the check constraint
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error creating user profile: %', SQLERRM;
    RETURN new; -- Still return new to allow user creation even if profile fails
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- Added SECURITY DEFINER to run with owner privileges

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add missing RLS policies for insert
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
