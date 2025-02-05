-- Create products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price decimal(10,2) not null check (price >= 0),
  image_url text not null,
  category text not null,
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true
);

-- Enable Row Level Security (RLS)
alter table public.products enable row level security;

-- Create policies
-- Allow anyone to read active products
create policy "Anyone can view active products" on public.products
  for select using (active = true);

-- Allow authenticated users to read all products
create policy "Authenticated users can view all products" on public.products
  for select using (auth.role() = 'authenticated');

-- Allow authenticated users to insert/update/delete products
create policy "Authenticated users can manage products" on public.products
  for all using (auth.role() = 'authenticated');

-- Create indexes
create index products_category_idx on public.products (category);
create index products_active_idx on public.products (active);
create index products_created_at_idx on public.products (created_at desc); 