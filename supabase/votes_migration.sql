-- Run this in Supabase Dashboard > SQL Editor

-- Votes table for deduplication
create table if not exists votes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  post_id    uuid not null references posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);

alter table votes enable row level security;

create policy "Users can read own votes"
  on votes for select using (auth.uid() = user_id);

create policy "Users can insert own votes"
  on votes for insert with check (auth.uid() = user_id);

create policy "Users can delete own votes"
  on votes for delete using (auth.uid() = user_id);

-- Atomic toggle: adds or removes vote and updates upvotes count
create or replace function toggle_upvote(p_post_id uuid)
returns json
language plpgsql
security definer
as $$
declare
  v_user_id     uuid := auth.uid();
  v_vote_exists boolean;
  v_new_upvotes integer;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select exists(
    select 1 from votes where user_id = v_user_id and post_id = p_post_id
  ) into v_vote_exists;

  if v_vote_exists then
    delete from votes where user_id = v_user_id and post_id = p_post_id;
    update posts set upvotes = greatest(0, upvotes - 1)
      where id = p_post_id returning upvotes into v_new_upvotes;
    return json_build_object('upvotes', v_new_upvotes, 'voted', false);
  else
    insert into votes (user_id, post_id) values (v_user_id, p_post_id);
    update posts set upvotes = upvotes + 1
      where id = p_post_id returning upvotes into v_new_upvotes;
    return json_build_object('upvotes', v_new_upvotes, 'voted', true);
  end if;
end;
$$;
