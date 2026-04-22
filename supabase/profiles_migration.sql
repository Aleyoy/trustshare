-- profiles table
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  bio text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile row when a new user signs up
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'full_name',
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Add user_id to posts if it doesn't exist (Supabase usually adds this via RLS)
-- This is a no-op if it already exists
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_name='posts' and column_name='user_id'
  ) then
    alter table posts add column user_id uuid references auth.users on delete set null;
  end if;
end $$;

-- Index for fast user post lookups
create index if not exists posts_user_id_idx on posts(user_id);

-- Backfill profiles for any existing auth users (run manually if needed)
-- insert into profiles (id, username)
-- select id, split_part(email, '@', 1) from auth.users
-- on conflict (id) do nothing;
