INSERT INTO storage.buckets (id, name, public) 
VALUES ('art-assets', 'art-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Art categories table (e.g. emojis, shapes, etc.)
CREATE TABLE IF NOT EXISTS public.art_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Art assets (each image uploaded under a category)
CREATE TABLE IF NOT EXISTS public.art_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.art_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  file_type TEXT CHECK (file_type IN ('svg', 'png', 'jpg', 'jpeg', 'webp')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- === art_categories policies ===
DROP POLICY IF EXISTS "Public view of active art categories" ON public.art_categories;
CREATE POLICY "Public view of active art categories" ON public.art_categories
  FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Admin can manage art categories" ON public.art_categories;
CREATE POLICY "Admin can manage art categories" ON public.art_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- === art_assets policies ===
DROP POLICY IF EXISTS "Public view of active art assets" ON public.art_assets;
CREATE POLICY "Public view of active art assets" ON public.art_assets
  FOR SELECT USING (
    active = true AND 
    EXISTS (
      SELECT 1 FROM public.art_categories 
      WHERE art_categories.id = art_assets.category_id 
      AND art_categories.active = true
    )
  );

DROP POLICY IF EXISTS "Users can manage their own art assets" ON public.art_assets;
CREATE POLICY "Users can manage their own art assets" ON public.art_assets
  FOR ALL USING (
    user_id = auth.uid() OR auth.role() = 'service_role'
  );

-- Drop existing policies for clean insert
DROP POLICY IF EXISTS "Public read for art-assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated upload to art-assets" ON storage.objects;

-- Public read access to art-assets bucket
CREATE POLICY "Public read for art-assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'art-assets');

-- Authenticated upload access to art-assets bucket
CREATE POLICY "Authenticated upload to art-assets" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'art-assets');
