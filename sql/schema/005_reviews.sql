-- Create reviews table
create table public.reviews (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  rating integer check (rating >= 1 and rating <= 5) not null,
  comment text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint fk_profile
    foreign key (user_id) 
    references public.profiles(id)
    on delete cascade,
  constraint unique_user_product 
    unique (user_id, product_id)
);

-- Enable RLS
alter table public.reviews enable row level security;

-- Policies
create policy "Anyone can read reviews"
  on public.reviews
  for select
  using (true);

create policy "Users can create reviews"
  on public.reviews
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.reviews
  for update
  using (auth.uid() = user_id);

create policy "Users can delete own reviews"
  on public.reviews
  for delete
  using (auth.uid() = user_id);

-- Create indexes
create index reviews_product_id_idx on public.reviews(product_id);
create index reviews_user_id_idx on public.reviews(user_id);
create index reviews_rating_idx on public.reviews(rating);
create index reviews_created_at_idx on public.reviews(created_at desc); 