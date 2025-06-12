-- Create designs table for storing custom uniform designs
CREATE TABLE public.designs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  elements JSONB NOT NULL DEFAULT '[]'::jsonb,
  canvas_width INTEGER NOT NULL DEFAULT 600,
  canvas_height INTEGER NOT NULL DEFAULT 600,
  product_view TEXT NOT NULL DEFAULT 'front' CHECK (product_view IN ('front', 'back')),
  preview_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own designs"
  ON public.designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own designs"
  ON public.designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON public.designs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON public.designs FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_designs_user_id ON public.designs(user_id);
CREATE INDEX idx_designs_product_id ON public.designs(product_id);
CREATE INDEX idx_designs_created_at ON public.designs(created_at DESC);

-- Create storage bucket for design images
INSERT INTO storage.buckets (id, name, public)
VALUES ('design-images', 'design-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for design images
CREATE POLICY "Public Access to design images"
ON storage.objects FOR SELECT
USING (bucket_id = 'design-images');

CREATE POLICY "Authenticated users can upload design images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'design-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own design images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'design-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own design images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'design-images'
  AND auth.role() = 'authenticated'
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_designs_updated_at
    BEFORE UPDATE ON public.designs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

