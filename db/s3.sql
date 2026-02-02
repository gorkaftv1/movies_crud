-- Permitir a los usuarios autenticados subir archivos a avatars y portraits
create policy "Authenticated users can upload files to avatars and portraits"
on storage.objects
for insert
with check (
  auth.role() = 'authenticated'
  and (bucket_id = 'avatars' or bucket_id = 'portraits')
);

-- Permitir a los usuarios autenticados leer archivos de avatars y portraits
create policy "Authenticated users can read files from avatars and portraits"
on storage.objects
for select
using (
  auth.role() = 'authenticated'
  and (bucket_id = 'avatars' or bucket_id = 'portraits')
);

-- Permitir a los usuarios borrar solo sus propios archivos en avatars y portraits
create policy "Users can delete their own files in avatars and portraits"
on storage.objects
for delete
using (
  auth.uid() = owner::uuid
  and (bucket_id = 'avatars' or bucket_id = 'portraits')
);

-- Permitir a los usuarios actualizar solo sus propios archivos en avatars y portraits
create policy "Users can update their own files in avatars and portraits"
on storage.objects
for update
with check (
  auth.uid() = owner::uuid
  and (bucket_id = 'avatars' or bucket_id = 'portraits')
);