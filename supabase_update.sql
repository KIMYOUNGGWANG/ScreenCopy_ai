-- Safely create tables if they don't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  credits integer default 3,
  tier text default 'free',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.generations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  image_url text not null,
  input_context jsonb not null,
  output_copy jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  amount integer not null,
  type text not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS (safe to run multiple times)
alter table public.profiles enable row level security;
alter table public.generations enable row level security;
alter table public.transactions enable row level security;

-- Policies (Drop and recreate to ensure they are up to date)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

drop policy if exists "Users can view their own generations." on generations;
create policy "Users can view their own generations." on generations for select using ( auth.uid() = user_id );

drop policy if exists "Users can insert their own generations." on generations;
create policy "Users can insert their own generations." on generations for insert with check ( auth.uid() = user_id );

drop policy if exists "Users can view their own transactions." on transactions;
create policy "Users can view their own transactions." on transactions for select using ( auth.uid() = user_id );

-- Trigger (Safe replace)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, credits)
  values (new.id, new.email, 3)
  on conflict (id) do nothing; -- Safe insert
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
