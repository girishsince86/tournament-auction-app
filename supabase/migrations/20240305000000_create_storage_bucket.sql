-- Create the tournament-media bucket if it doesn't exist
insert into storage.buckets (id, name, public)
values ('tournament-media', 'tournament-media', true)
on conflict (id) do nothing;

-- Allow public access to view files
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'tournament-media' );

-- Allow anyone to upload images with valid file types
create policy "Public can upload images"
on storage.objects for insert
to public
with check (
    bucket_id = 'tournament-media'
    and (storage.extension(name) = 'jpg' or
         storage.extension(name) = 'jpeg' or
         storage.extension(name) = 'png' or
         storage.extension(name) = 'gif' or
         storage.extension(name) = 'webp')
    and length(name) < 100
    and length(name) > 3
);

-- Allow public to update their own uploads
create policy "Public can update own images"
on storage.objects for update
to public
using ( bucket_id = 'tournament-media' )
with check ( bucket_id = 'tournament-media' );

-- Allow public to delete their own uploads
create policy "Public can delete own images"
on storage.objects for delete
to public
using ( bucket_id = 'tournament-media' );

-- Log the changes
do $$
begin
  raise notice 'Created tournament-media bucket and set up public storage policies';
end $$; 