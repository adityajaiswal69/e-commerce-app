-- Create orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  total_price decimal(10,2) not null check (total_price >= 0),
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create order items table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) not null,
  quantity integer not null check (quantity > 0),
  price_at_time decimal(10,2) not null check (price_at_time >= 0)
);

-- Enable RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Policies for orders
create policy "Users can view their own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create their own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Policies for order items
create policy "Users can view their order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Users can create their order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Indexes
create index orders_user_id_idx on public.orders(user_id);
create index orders_status_idx on public.orders(status);
create index order_items_order_id_idx on public.order_items(order_id);
create index order_items_product_id_idx on public.order_items(product_id); 