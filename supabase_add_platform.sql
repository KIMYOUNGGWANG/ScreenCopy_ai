-- Add platform column to generations table
alter table public.generations 
add column if not exists platform text default 'app_store';

-- Update existing rows to have default value
update public.generations 
set platform = 'app_store' 
where platform is null;
