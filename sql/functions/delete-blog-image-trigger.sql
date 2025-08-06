-- Function to delete blog image from storage when blog post is deleted
CREATE OR REPLACE FUNCTION delete_blog_image_on_post_delete()
RETURNS TRIGGER AS $$
DECLARE
    image_path TEXT;
    delete_result RECORD;
BEGIN
    -- Extract the image path from the URL if it exists
    IF OLD.image_url IS NOT NULL AND OLD.image_url != '' THEN
        -- Extract path from Supabase storage URL
        -- Format: https://[project].supabase.co/storage/v1/object/public/blog-images/[filename]
        IF OLD.image_url LIKE '%/storage/v1/object/public/blog-images/%' THEN
            -- Extract the filename from the URL
            image_path := SUBSTRING(OLD.image_url FROM '.*/storage/v1/object/public/blog-images/(.*)');

            -- Try to delete the file from storage (ignore errors to not block post deletion)
            BEGIN
                DELETE FROM storage.objects
                WHERE bucket_id = 'blog-images'
                AND name = image_path;
            EXCEPTION WHEN OTHERS THEN
                -- Log the error but don't fail the deletion
                RAISE NOTICE 'Failed to delete image from storage: %', SQLERRM;
            END;
        END IF;
    END IF;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically delete blog images when blog post is deleted
DROP TRIGGER IF EXISTS trigger_delete_blog_image ON blog_posts;
CREATE TRIGGER trigger_delete_blog_image
    BEFORE DELETE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION delete_blog_image_on_post_delete();

-- Alternative: If the trigger causes issues, you can disable it and rely on client-side deletion
-- To disable the trigger, run: DROP TRIGGER IF EXISTS trigger_delete_blog_image ON blog_posts;
