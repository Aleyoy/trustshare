-- Add platform-specific affiliate link columns to posts
alter table posts
  add column if not exists shopee_link text,
  add column if not exists tokopedia_link text,
  add column if not exists lazada_link text;
