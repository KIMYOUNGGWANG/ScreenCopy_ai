
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  credits integer default 3,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Generations table
create table public.generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  input_context jsonb not null,
  output_copy jsonb not null,
  is_favorite boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.generations enable row level security;

-- Policies for generations
create policy "Users can view own generations" on public.generations
  for select using (auth.uid() = user_id);

create policy "Users can insert own generations" on public.generations
  for insert with check (auth.uid() = user_id);

create policy "Users can update own generations" on public.generations
  for update using (auth.uid() = user_id);

create policy "Users can delete own generations" on public.generations
  for delete using (auth.uid() = user_id);

-- Transactions table (for credit history)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  amount integer not null,
  type text not null, -- 'signup', 'generation', 'purchase'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.transactions enable row level security;

-- Policies for transactions
create policy "Users can view own transactions" on public.transactions
  for select using (auth.uid() = user_id);

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 3);
  
  insert into public.transactions (user_id, amount, type)
  values (new.id, 3, 'signup');
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
