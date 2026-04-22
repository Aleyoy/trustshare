-- Run in Supabase Dashboard > SQL Editor > New Query
-- Name it: "Click Tracking"

alter table posts add column if not exists clicks integer not null default 0;

create or replace function track_click(p_post_id uuid)
returns void
language sql
security definer
as $$
  update posts set clicks = clicks + 1 where id = p_post_id;
$$;
