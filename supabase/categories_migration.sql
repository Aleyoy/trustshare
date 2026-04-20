-- Run in Supabase Dashboard > SQL Editor

alter table posts add column if not exists category text not null default 'general';
create index if not exists posts_category_idx on posts(category);

-- Enable realtime for posts table (needed for live feed updates)
alter publication supabase_realtime add table posts;
