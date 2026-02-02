-- Crear buckets de Storage si no existen
insert into storage.buckets (id, name, public)
values 
  ('portraits', 'portraits', true),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Configurar políticas RLS para el bucket 'portraits'
create policy "Public can view movie portraits"
on storage.objects for select
using (bucket_id = 'portraits');

create policy "Authenticated users can upload movie portraits"
on storage.objects for insert
with check (
  bucket_id = 'portraits' 
  and auth.role() = 'authenticated'
);

create policy "Authenticated users can update movie portraits"
on storage.objects for update
with check (
  bucket_id = 'portraits' 
  and auth.role() = 'authenticated'
);

create policy "Authenticated users can delete movie portraits"
on storage.objects for delete
using (
  bucket_id = 'portraits' 
  and auth.role() = 'authenticated'
);

-- Configurar políticas RLS para el bucket 'avatars'
create policy "Public can view user avatars"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "Users can upload their own avatars"
on storage.objects for insert
with check (
  bucket_id = 'avatars' 
  and auth.role() = 'authenticated'
);

create policy "Users can update their own avatars"
on storage.objects for update
with check (
  bucket_id = 'avatars' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own avatars"
on storage.objects for delete
using (
  bucket_id = 'avatars' 
  and auth.uid()::text = (storage.foldername(name))[1]
);