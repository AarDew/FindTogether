-- Create public 'footage' bucket and permissive policies for uploads
-- Ensure bucket exists
insert into storage.buckets (id, name, public)
values ('footage', 'footage', true)
on conflict (id) do nothing;

-- Policies for public read and open upload to 'footage' bucket
-- Allow anyone (anon or authenticated) to read files from the 'footage' bucket
create policy if not exists "Public read access for footage"
  on storage.objects for select
  using (bucket_id = 'footage');

-- Allow anyone (anon or authenticated) to upload files to the 'footage' bucket
create policy if not exists "Anyone can upload footage"
  on storage.objects for insert
  with check (bucket_id = 'footage');
