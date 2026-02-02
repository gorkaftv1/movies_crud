-- ===================================
-- CONFIGURACIÓN DE STORAGE PÚBLICO
-- ===================================

-- 1. Crear buckets públicos si no existen
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('portraits', 'portraits', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Public can view movie portraits" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view portraits" ON storage.objects;
DROP POLICY IF EXISTS "Public portraits read access" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload movie portraits" ON storage.objects;
DROP POLICY IF EXISTS "Auth users can upload portraits" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can update movie portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete movie portraits" ON storage.objects;

-- 3. Crear políticas para PORTRAITS (carátulas de películas)
-- Permitir a CUALQUIERA ver las carátulas
CREATE POLICY "Anyone can view portraits"
ON storage.objects FOR SELECT
USING (bucket_id = 'portraits');

-- Solo usuarios autenticados pueden subir carátulas
CREATE POLICY "Auth users can upload portraits"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'portraits' 
  AND auth.role() = 'authenticated'
);

-- Solo usuarios autenticados pueden actualizar carátulas
CREATE POLICY "Auth users can update portraits"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'portraits' 
  AND auth.role() = 'authenticated'
);

-- Solo usuarios autenticados pueden eliminar carátulas
CREATE POLICY "Auth users can delete portraits"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'portraits' 
  AND auth.role() = 'authenticated'
);

-- 4. Configurar políticas para AVATARS
DROP POLICY IF EXISTS "Public can view user avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Permitir a CUALQUIERA ver los avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Solo usuarios autenticados pueden subir avatars
CREATE POLICY "Auth users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Los usuarios pueden actualizar sus propios avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- Los usuarios pueden eliminar sus propios avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- 5. Asegurar que RLS esté habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 6. Verificar configuración (opcional - para debugging)
-- SELECT * FROM storage.buckets WHERE id IN ('portraits', 'avatars');
-- SELECT policyname, tablename FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';