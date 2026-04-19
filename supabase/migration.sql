-- TrustShare schema migration
-- Paste this into: Supabase Dashboard > SQL Editor > New Query

-- Posts table
create table if not exists posts (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  title        text not null,
  description  text not null,
  video_url    text,
  affiliate_link text,
  upvotes      integer not null default 0
);

-- Comments table
create table if not exists comments (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references posts(id) on delete cascade,
  content    text not null,
  created_at timestamptz not null default now()
);

-- Index for fast comment lookups per post
create index if not exists comments_post_id_idx on comments(post_id);

-- Stored procedure for atomic upvote increment (avoids race conditions)
create or replace function increment_upvotes(post_id uuid)
returns void
language sql
as $$
  update posts set upvotes = upvotes + 1 where id = post_id;
$$;

-- Enable Row Level Security
alter table posts    enable row level security;
alter table comments enable row level security;

-- Public read access
create policy "Public can read posts"
  on posts for select using (true);

create policy "Public can read comments"
  on comments for select using (true);

-- Public write access (tighten later with auth)
create policy "Public can insert posts"
  on posts for insert with check (true);

create policy "Public can insert comments"
  on comments for insert with check (true);

create policy "Public can update upvotes"
  on posts for update using (true);
