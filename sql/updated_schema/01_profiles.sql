-- =====================================================
-- PROFILES TABLE SCHEMA
-- =====================================================
-- Extends auth.users with additional user information
-- =====================================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can insert profiles" ON profiles
  FOR INSERT TO service_role WITH CHECK (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (new.id, 'user');
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating user profile: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comments
COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with additional information';
COMMENT ON COLUMN public.profiles.id IS 'References auth.users(id) - the user ID';
COMMENT ON COLUMN public.profiles.full_name IS 'User full name';
COMMENT ON COLUMN public.profiles.role IS 'User role: user or admin';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp when profile was created';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp when profile was last updated'; 