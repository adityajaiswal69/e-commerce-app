-- Drop the existing designs table if it exists
DROP TABLE IF EXISTS designs;

-- Create the designs table with the new schema
CREATE TABLE designs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    product_id uuid REFERENCES products(id) NOT NULL,
    name TEXT NOT NULL,
    elementsByView JSONB NOT NULL DEFAULT '{
        "front": [],
        "back": [],
        "left": [],
        "right": []
    }'::jsonb,
    canvas_width INTEGER NOT NULL,
    canvas_height INTEGER NOT NULL,
    preview_images JSONB NOT NULL DEFAULT '{}'::jsonb,
    product_view TEXT NOT NULL CHECK (product_view IN ('front', 'back', 'left', 'right')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own designs"
    ON designs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own designs"
    ON designs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
    ON designs
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
    ON designs
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX designs_user_id_idx ON designs(user_id);
CREATE INDEX designs_product_id_idx ON designs(product_id);
CREATE INDEX designs_created_at_idx ON designs(created_at DESC);

-- Add updated_at trigger
CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON designs
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();

-- Grant permissions
GRANT ALL ON designs TO authenticated;
GRANT SELECT ON designs TO anon;
