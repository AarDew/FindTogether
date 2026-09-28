-- Make 'footage' bucket public for read access
update storage.buckets set public = true where id = 'footage';

-- Create Storage RLS policies for the 'footage' bucket
-- Public read
drop policy if exists "Public read access for footage" on storage.objects;
create policy "Public read access for footage"
  on storage.objects for select
  using (bucket_id = 'footage');

-- Allow anyone to upload to 'footage'
drop policy if exists "Anyone can upload footage" on storage.objects;
create policy "Anyone can upload footage"
  on storage.objects for insert
  with check (bucket_id = 'footage');
