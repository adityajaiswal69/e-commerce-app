-- Disable the blog image deletion trigger if it's causing issues
-- This will rely on client-side deletion only

DROP TRIGGER IF EXISTS trigger_delete_blog_image ON blog_posts;
DROP FUNCTION IF EXISTS delete_blog_image_on_post_delete();

-- Note: After running this, image deletion will be handled entirely by the client-side code
-- in BlogPostForm.tsx, which has been improved with better error handling.
