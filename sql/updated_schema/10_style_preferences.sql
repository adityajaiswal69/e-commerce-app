-- =====================================================
-- STYLE_PREFERENCES TABLE SCHEMA
-- =====================================================
-- User style preferences for personalized recommendations
-- =====================================================

-- Style preferences table
CREATE TABLE IF NOT EXISTS public.style_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  preferred_styles TEXT[] NOT NULL,
  preferred_colors TEXT[] NOT NULL,
  size_preferences JSONB NOT NULL,
  occasion_preferences TEXT[] NOT NULL,
  budget_range int4range NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.style_preferences ENABLE ROW LEVEL SECURITY;

-- Style preferences policies
CREATE POLICY "Users can view their own preferences" ON style_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON style_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own preferences" ON style_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_style_preferences_updated_at ON public.style_preferences;
CREATE TRIGGER update_style_preferences_updated_at
  BEFORE UPDATE ON public.style_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS style_preferences_user_id_idx ON public.style_preferences(user_id);
CREATE INDEX IF NOT EXISTS style_preferences_preferred_styles_idx ON public.style_preferences USING gin(preferred_styles);
CREATE INDEX IF NOT EXISTS style_preferences_preferred_colors_idx ON public.style_preferences USING gin(preferred_colors);
CREATE INDEX IF NOT EXISTS style_preferences_occasion_preferences_idx ON public.style_preferences USING gin(occasion_preferences);

-- Comments
COMMENT ON TABLE public.style_preferences IS 'User style preferences for personalized recommendations';
COMMENT ON COLUMN public.style_preferences.id IS 'Unique identifier for the preference set';
COMMENT ON COLUMN public.style_preferences.user_id IS 'Reference to user';
COMMENT ON COLUMN public.style_preferences.preferred_styles IS 'Array of preferred style types';
COMMENT ON COLUMN public.style_preferences.preferred_colors IS 'Array of preferred colors';
COMMENT ON COLUMN public.style_preferences.size_preferences IS 'Size preferences as JSON object';
COMMENT ON COLUMN public.style_preferences.occasion_preferences IS 'Array of preferred occasions';
COMMENT ON COLUMN public.style_preferences.budget_range IS 'Budget range as PostgreSQL range type';
COMMENT ON COLUMN public.style_preferences.created_at IS 'Timestamp when preferences were created';
COMMENT ON COLUMN public.style_preferences.updated_at IS 'Timestamp when preferences were last updated'; 