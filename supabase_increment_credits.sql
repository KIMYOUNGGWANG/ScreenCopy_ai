-- Function to increment user credits safely
create or replace function public.increment_credits(user_id uuid, amount int)
returns void as $$
begin
  update public.profiles
  set credits = credits + amount,
      updated_at = now()
  where id = user_id;
end;
$$ language plpgsql security definer;
