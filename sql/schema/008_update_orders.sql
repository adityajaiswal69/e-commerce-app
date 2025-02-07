-- Add category column to order_items
alter table public.order_items
add column category text,
add column selected_size text;

-- Update existing order_items with product categories (optional)
update order_items oi
set category = p.category
from products p
where oi.product_id = p.id; 