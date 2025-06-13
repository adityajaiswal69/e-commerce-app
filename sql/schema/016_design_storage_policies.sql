-- Create designs table
CREATE TABLE IF NOT EXISTS public.designs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    elementsByView jsonb NOT NULL DEFAULT '{
        "front": [],
        "back": [],
        "left": [],
        "right": []
    }',
    canvas_width integer NOT NULL DEFAULT 600,
    canvas_height integer NOT NULL DEFAULT 600,
    preview_images jsonb NOT NULL DEFAULT '{
        "front": null,
        "back": null,
        "left": null,
        "right": null
    }',
    product_view text NOT NULL DEFAULT 'front',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_product_view CHECK (product_view IN ('front', 'back', 'left', 'right'))
);

-- Create storage bucket for designs if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'designs',
    'designs',
    true,
    5242880, -- 5MB size limit
    ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/png', 'image/jpeg', 'image/webp'];

-- Enable Row Level Security
ALTER TABLE public.designs ENABLE ROW LEVEL SECURITY;

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS designs_user_id_idx ON public.designs(user_id);
CREATE INDEX IF NOT EXISTS designs_product_id_idx ON public.designs(product_id);
CREATE INDEX IF NOT EXISTS designs_created_at_idx ON public.designs(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_designs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_designs_modtime
    BEFORE UPDATE ON public.designs
    FOR EACH ROW
    EXECUTE FUNCTION update_designs_updated_at();

-- Create RLS Policies for designs table
-- View Policy: Users can view their own designs
CREATE POLICY "Users can view own designs"
    ON public.designs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Insert Policy: Authenticated users can create designs
CREATE POLICY "Users can create designs"
    ON public.designs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Update Policy: Users can update their own designs
CREATE POLICY "Users can update own designs"
    ON public.designs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Delete Policy: Users can delete their own designs
CREATE POLICY "Users can delete own designs"
    ON public.designs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Storage RLS Policies
-- Create policies for design images storage
CREATE POLICY "Anyone can view design images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'designs');

CREATE POLICY "Authenticated users can upload design images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'designs'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can update their own design images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'designs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'designs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can delete their own design images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'designs'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Function to get designs for a user
CREATE OR REPLACE FUNCTION get_user_designs(user_uuid uuid)
RETURNS SETOF designs AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM public.designs
    WHERE user_id = user_uuid
    ORDER BY updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get design by id (if user owns it)
CREATE OR REPLACE FUNCTION get_design_by_id(design_uuid uuid, user_uuid uuid)
RETURNS designs AS $$
DECLARE
    design_record designs;
BEGIN
    SELECT *
    INTO design_record
    FROM public.designs
    WHERE id = design_uuid AND user_id = user_uuid;
    
    RETURN design_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned design images
CREATE OR REPLACE FUNCTION cleanup_orphaned_design_images()
RETURNS void AS $$
DECLARE
    obj record;
BEGIN
    FOR obj IN 
        SELECT name 
        FROM storage.objects 
        WHERE bucket_id = 'designs'
    LOOP
        -- Check if the design still exists
        IF NOT EXISTS (
            SELECT 1 
            FROM public.designs d 
            WHERE 
                d.preview_images::jsonb ? obj.name
                OR d.elementsByView::jsonb ? obj.name
        ) THEN
            -- Delete orphaned file
            DELETE FROM storage.objects 
            WHERE bucket_id = 'designs' AND name = obj.name;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
