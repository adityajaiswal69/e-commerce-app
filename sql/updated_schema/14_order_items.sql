-- =====================================================
-- ORDER_ITEMS TABLE SCHEMA
-- =====================================================
-- Individual items within customer orders
-- =====================================================

-- Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  design_id uuid REFERENCES public.designs(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  product_snapshot JSONB,
  customization_details JSONB,
  category TEXT,
  selected_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Order items policies
CREATE POLICY "Users can view their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create order items for their orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS order_items_product_id_idx ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS order_items_design_id_idx ON public.order_items(design_id);
CREATE INDEX IF NOT EXISTS order_items_category_idx ON public.order_items(category);
CREATE INDEX IF NOT EXISTS order_items_selected_size_idx ON public.order_items(selected_size);

-- Comments
COMMENT ON TABLE public.order_items IS 'Individual items within customer orders';
COMMENT ON COLUMN public.order_items.id IS 'Unique identifier for the order item';
COMMENT ON COLUMN public.order_items.order_id IS 'Reference to parent order';
COMMENT ON COLUMN public.order_items.product_id IS 'Reference to the product';
COMMENT ON COLUMN public.order_items.design_id IS 'Reference to custom design (optional)';
COMMENT ON COLUMN public.order_items.quantity IS 'Quantity ordered';
COMMENT ON COLUMN public.order_items.unit_price IS 'Price per unit';
COMMENT ON COLUMN public.order_items.total_price IS 'Total price for this item';
COMMENT ON COLUMN public.order_items.product_snapshot IS 'Snapshot of product data at time of order';
COMMENT ON COLUMN public.order_items.customization_details IS 'Customization details as JSON';
COMMENT ON COLUMN public.order_items.category IS 'Product category';
COMMENT ON COLUMN public.order_items.selected_size IS 'Selected size for this item';
COMMENT ON COLUMN public.order_items.created_at IS 'Timestamp when order item was created'; 