-- ScreenCopy.ai Complete Database Schema (Final Version)
-- This is the single source of truth for the database structure.

-- 1. Enable Extensions
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  credits integer default 3,
  tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. GENERATIONS TABLE
create table if not exists public.generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist
ALTER TABLE public.generations 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS input_context jsonb,
ADD COLUMN IF NOT EXISTS output_copy jsonb,
ADD COLUMN IF NOT EXISTS is_favorite boolean DEFAULT false;

-- 4. TRANSACTIONS TABLE
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount integer not null,
  type text not null, -- 'generation', 'purchase', 'refund', 'bonus'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Ensure all columns exist
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS reason text;

-- 5. ENABLE ROW LEVEL SECURITY (RLS)
alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.transactions enable row level security;

-- 6. RLS POLICIES

-- Profiles
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Generations
drop policy if exists "Users can view their own generations." on generations;
create policy "Users can view their own generations." on generations for select using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own generations." on generations;
create policy "Users can insert their own generations." on generations for insert with check ( auth.uid() = user_id );

drop policy if exists "Users can update own generations." on generations;
create policy "Users can update own generations." on generations for update using ( auth.uid() = user_id );

drop policy if exists "Users can delete own generations." on generations;
create policy "Users can delete own generations." on generations for delete using ( auth.uid() = user_id );

-- Transactions
drop policy if exists "Users can view their own transactions." on transactions;
create policy "Users can view their own transactions." on transactions for select using ( auth.uid() = user_id );

-- 7. STORAGE BUCKET
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- Storage Policies
drop policy if exists "Screenshot Access" on storage.objects;
create policy "Screenshot Access" on storage.objects for select using ( bucket_id = 'screenshots' );

drop policy if exists "Authenticated users can upload screenshots" on storage.objects;
create policy "Authenticated users can upload screenshots" on storage.objects for insert with check ( bucket_id = 'screenshots' and auth.role() = 'authenticated' );

-- 8. USER TRIGGER (Auto-create profile)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 3)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
