-- =====================================================
-- BLOG_POSTS TABLE SCHEMA
-- =====================================================
-- Blog posts for the e-commerce website
-- =====================================================

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  image_url VARCHAR(500),
  image_bucket VARCHAR(100) DEFAULT 'blog-images',
  image_path VARCHAR(500),
  fallback_color VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  author VARCHAR(100) NOT NULL,
  date VARCHAR(50) NOT NULL,
  read_time VARCHAR(20) NOT NULL,
  featured BOOLEAN DEFAULT false,
  paragraph TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tags TEXT[]
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Blog posts policies
CREATE POLICY "Anyone can view blog posts" ON public.blog_posts
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage blog posts" ON public.blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON public.blog_posts USING btree (category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON public.blog_posts USING btree (author);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON public.blog_posts USING btree (featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON public.blog_posts USING btree (date);
CREATE INDEX IF NOT EXISTS idx_blog_posts_image_bucket ON public.blog_posts USING btree (image_bucket);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON public.blog_posts USING btree (created_at DESC);

-- Comments
COMMENT ON TABLE public.blog_posts IS 'Blog posts for the e-commerce website';
COMMENT ON COLUMN public.blog_posts.id IS 'Unique identifier for the blog post';
COMMENT ON COLUMN public.blog_posts.title IS 'Blog post title';
COMMENT ON COLUMN public.blog_posts.excerpt IS 'Short excerpt/summary of the post';
COMMENT ON COLUMN public.blog_posts.image_url IS 'URL to the blog post image';
COMMENT ON COLUMN public.blog_posts.image_bucket IS 'Storage bucket for the image';
COMMENT ON COLUMN public.blog_posts.image_path IS 'Path to the image in storage';
COMMENT ON COLUMN public.blog_posts.fallback_color IS 'Fallback color for the post';
COMMENT ON COLUMN public.blog_posts.category IS 'Blog post category';
COMMENT ON COLUMN public.blog_posts.author IS 'Author name';
COMMENT ON COLUMN public.blog_posts.date IS 'Publication date';
COMMENT ON COLUMN public.blog_posts.read_time IS 'Estimated reading time';
COMMENT ON COLUMN public.blog_posts.featured IS 'Whether this post is featured';
COMMENT ON COLUMN public.blog_posts.paragraph IS 'Main content of the blog post';
COMMENT ON COLUMN public.blog_posts.created_at IS 'Timestamp when post was created';
COMMENT ON COLUMN public.blog_posts.updated_at IS 'Timestamp when post was last updated';
COMMENT ON COLUMN public.blog_posts.tags IS 'Array of tags for the post'; 