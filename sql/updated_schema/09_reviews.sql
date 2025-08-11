-- =====================================================
-- REVIEWS TABLE SCHEMA
-- =====================================================
-- Product reviews and ratings system
-- =====================================================

-- Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT fk_profile FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT unique_user_product UNIQUE (user_id, product_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS reviews_product_id_idx ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_rating_idx ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);

-- Comments
COMMENT ON TABLE public.reviews IS 'Product reviews and ratings system';
COMMENT ON COLUMN public.reviews.id IS 'Unique identifier for the review';
COMMENT ON COLUMN public.reviews.user_id IS 'Reference to user who wrote the review';
COMMENT ON COLUMN public.reviews.product_id IS 'Reference to the product being reviewed';
COMMENT ON COLUMN public.reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN public.reviews.comment IS 'Review comment text';
COMMENT ON COLUMN public.reviews.created_at IS 'Timestamp when review was created'; 