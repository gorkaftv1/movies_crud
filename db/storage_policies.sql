-- ===================================
-- POLÍTICAS DE STORAGE (SUPABASE)
-- ===================================

-- 1. Crear buckets necesarios (si no existen)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', false),
  ('portraits', 'portraits', true)
ON CONFLICT (id) DO NOTHING;

-- 2. POLÍTICAS PARA BUCKET 'portraits' (carátulas de películas)
-- ============================================================

-- Permitir lectura pública de carátulas
CREATE POLICY "Public read access to portraits"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portraits');

-- Permitir a usuarios autenticados subir carátulas
CREATE POLICY "Authenticated users can upload portraits"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id = 'portraits'
  );

-- Permitir a usuarios autenticados actualizar sus carátulas
CREATE POLICY "Authenticated users can update portraits"
  ON storage.objects FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'portraits'
  );

-- Permitir a usuarios autenticados eliminar sus carátulas
CREATE POLICY "Authenticated users can delete portraits"
  ON storage.objects FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'portraits'
  );

-- 3. POLÍTICAS PARA BUCKET 'avatars' (avatares de usuarios)
-- =========================================================

-- Solo los usuarios autenticados pueden ver avatares
CREATE POLICY "Authenticated users can read avatars"
  ON storage.objects FOR SELECT
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'avatars'
  );

-- Los usuarios solo pueden subir sus propios avatares
CREATE POLICY "Users can upload own avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.uid()::text = (storage.foldername(name))[1]
    AND bucket_id = 'avatars'
  );

-- Los usuarios solo pueden actualizar sus propios avatares
CREATE POLICY "Users can update own avatars"
  ON storage.objects FOR UPDATE
  USING (
    auth.uid()::text = (storage.foldername(name))[1]
    AND bucket_id = 'avatars'
  );

-- Los usuarios solo pueden eliminar sus propios avatares
CREATE POLICY "Users can delete own avatars"
  ON storage.objects FOR DELETE
  USING (
    auth.uid()::text = (storage.foldername(name))[1]
    AND bucket_id = 'avatars'
  );