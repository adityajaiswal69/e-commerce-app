-- Add new columns to products table
alter table public.products
add column style text[],
add column colors text[],
add column sizes jsonb,
add column occasions text[];

-- Create indexes for new columns
create index products_style_idx on public.products using gin(style);
create index products_colors_idx on public.products using gin(colors);
create index products_occasions_idx on public.products using gin(occasions);

-- Update existing products with sample data (optional)
update public.products
set 
  style = array['Casual', 'Streetwear'],
  colors = array['Black', 'White'],
  sizes = '{"top": ["S", "M", "L"], "bottom": ["30", "32", "34"], "shoes": ["8", "9", "10"]}',
  occasions = array['Daily', 'Casual']
where style is null;

-- Add a function to match products with user preferences
create or replace function match_user_preferences(
  product_id uuid,
  user_id uuid
) returns float as $$
declare
  user_prefs record;
  product record;
  match_score float := 0;
begin
  -- Get user preferences
  select * from style_preferences
  where user_id = $2
  into user_prefs;

  -- Get product details
  select * from products
  where id = $1
  into product;

  -- Calculate style match
  if product.style && user_prefs.preferred_styles then
    match_score := match_score + 0.3;
  end if;

  -- Calculate color match
  if product.colors && user_prefs.preferred_colors then
    match_score := match_score + 0.2;
  end if;

  -- Calculate occasion match
  if product.occasions && user_prefs.occasion_preferences then
    match_score := match_score + 0.2;
  end if;

  -- Check if price is within budget range
  if product.price between user_prefs.budget_range[1] and user_prefs.budget_range[2] then
    match_score := match_score + 0.3;
  end if;

  return match_score;
end;
$$ language plpgsql;

-- Create a view for personalized product recommendations
create or replace view personalized_products as
select 
  p.*,
  match_user_preferences(p.id, auth.uid()) as match_score
from products p
where active = true
order by match_score desc; 