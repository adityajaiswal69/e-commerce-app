-- Create ai_art table for storing AI-generated artwork
CREATE TABLE IF NOT EXISTS public.ai_art (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    prompt text NOT NULL,
    image_url text NOT NULL,
    svg_url text,
    original_image_url text,
    generation_params jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.ai_art ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_art table
CREATE POLICY "Users can view their own AI art"
    ON public.ai_art FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI art"
    ON public.ai_art FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI art"
    ON public.ai_art FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own AI art"
    ON public.ai_art FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_art_user_id ON public.ai_art(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_art_created_at ON public.ai_art(created_at DESC);

-- Create storage bucket for AI art images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ai-art-images',
    'ai-art-images',
    true,
    10485760, -- 10MB limit
    ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

-- Storage policies for AI art images
CREATE POLICY "Public Access to AI art images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'ai-art-images');

CREATE POLICY "Authenticated users can upload AI art images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'ai-art-images'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own AI art images"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'ai-art-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own AI art images"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'ai-art-images'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_art_updated_at
    BEFORE UPDATE ON public.ai_art
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
