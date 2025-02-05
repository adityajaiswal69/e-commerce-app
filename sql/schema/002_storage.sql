-- Create storage bucket for product images
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);

-- Allow public access to product images
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- Allow authenticated users to upload images
create policy "Authenticated users can upload images"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
);

-- Allow authenticated users to delete images
create policy "Authenticated users can delete images"
on storage.objects for delete
using (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
); 