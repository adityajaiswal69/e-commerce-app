-- Create style preferences table
create table public.style_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  preferred_styles text[] not null,
  preferred_colors text[] not null,
  size_preferences jsonb not null,
  occasion_preferences text[] not null,
  budget_range int4range not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_preferences unique (user_id)
);

-- Enable RLS
alter table public.style_preferences enable row level security;

-- Policies
create policy "Users can view their own preferences"
  on style_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert their own preferences"
  on style_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can modify their own preferences"
  on style_preferences for update
  using (auth.uid() = user_id); 