-- Add media columns to posts
alter table posts
  add column if not exists media_url text,
  add column if not exists media_type text; -- 'image' or 'video'

-- Storage bucket policy (run after creating 'post-media' bucket in dashboard)
-- Allow authenticated users to upload
insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

create policy "Anyone can view post media"
  on storage.objects for select using (bucket_id = 'post-media');

create policy "Auth users can upload post media"
  on storage.objects for insert
  with check (bucket_id = 'post-media' and auth.role() = 'authenticated');

create policy "Users can delete own post media"
  on storage.objects for delete
  using (bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]);
