-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILES TABLE
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  credits integer default 3,
  tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- GENERATIONS TABLE
create table public.generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  image_url text not null,
  input_context jsonb not null,
  output_copy jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for generations
alter table public.generations enable row level security;

-- Generations policies
create policy "Users can view their own generations."
  on generations for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own generations."
  on generations for insert
  with check ( auth.uid() = user_id );

-- TRANSACTIONS TABLE
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount integer not null,
  type text not null, -- 'generation', 'purchase', 'refund', 'bonus'
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for transactions
alter table public.transactions enable row level security;

-- Transactions policies
create policy "Users can view their own transactions."
  on transactions for select
  using ( auth.uid() = user_id );

-- STORAGE BUCKET SETUP
-- Note: You'll need to create a bucket named 'screenshots' in the Storage dashboard manually if this doesn't work via SQL in your environment.
insert into storage.buckets (id, name, public)
values ('screenshots', 'screenshots', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Screenshot Access"
  on storage.objects for select
  using ( bucket_id = 'screenshots' );

create policy "Authenticated users can upload screenshots"
  on storage.objects for insert
  with check ( bucket_id = 'screenshots' and auth.role() = 'authenticated' );

-- TRIGGER FOR NEW USERS
-- Automatically create a profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 3);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
