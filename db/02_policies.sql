-- ===================================
-- MOVIES CRUD - POLÍTICAS RLS
-- Versión Final
-- ===================================

-- MOVIES POLICIES
-- ===============

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Anyone can view movies" ON public.movies;
DROP POLICY IF EXISTS "Authenticated users can insert movies" ON public.movies;
DROP POLICY IF EXISTS "Users can update own movies" ON public.movies;
DROP POLICY IF EXISTS "Users can delete own movies" ON public.movies;

-- Cualquiera puede ver todas las películas (lectura pública)
CREATE POLICY "Anyone can view movies"
  ON public.movies FOR SELECT
  USING (true);

-- Solo usuarios autenticados pueden insertar películas
CREATE POLICY "Authenticated users can insert movies"
  ON public.movies FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND user_id = auth.uid()
  );

-- Los usuarios solo pueden actualizar sus propias películas
CREATE POLICY "Users can update own movies"
  ON public.movies FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Los usuarios solo pueden eliminar sus propias películas
CREATE POLICY "Users can delete own movies"
  ON public.movies FOR DELETE
  USING (user_id = auth.uid());

-- PROFILES POLICIES
-- =================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;

-- Los usuarios pueden ver todos los perfiles (para mostrar quién añadió cada película)
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Los usuarios solo pueden gestionar su propio perfil
CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- USER FAVORITES POLICIES
-- =======================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;

-- Los usuarios solo pueden ver sus propios favoritos
CREATE POLICY "Users can view own favorites"
  ON public.user_favorites FOR SELECT
  USING (user_id = auth.uid());

-- Los usuarios solo pueden añadir sus propios favoritos
CREATE POLICY "Users can insert own favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' 
    AND user_id = auth.uid()
  );

-- Los usuarios solo pueden eliminar sus propios favoritos
CREATE POLICY "Users can delete own favorites"
  ON public.user_favorites FOR DELETE
  USING (user_id = auth.uid());

-- PLAYLISTS POLICIES
-- ==================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view public playlists and own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Anyone can view public playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can view own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can manage their own playlists" ON public.playlists;

-- Cualquiera puede ver playlists públicas (sin autenticación requerida)
CREATE POLICY "Anyone can view public playlists"
  ON public.playlists FOR SELECT
  USING (is_public = true);

-- Los usuarios autenticados pueden ver sus propias playlists (públicas o privadas)
CREATE POLICY "Users can view own playlists"
  ON public.playlists FOR SELECT
  USING (
    auth.role() = 'authenticated' 
    AND user_id = auth.uid()
  );

-- Los usuarios solo pueden gestionar sus propias playlists
CREATE POLICY "Users can manage their own playlists"
  ON public.playlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- STORAGE POLICIES - PORTRAITS
-- ============================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Public read access to portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portraits" ON storage.objects;

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

-- Permitir a usuarios autenticados actualizar carátulas
CREATE POLICY "Authenticated users can update portraits"
  ON storage.objects FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'portraits'
  );

-- Permitir a usuarios autenticados eliminar carátulas
CREATE POLICY "Authenticated users can delete portraits"
  ON storage.objects FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'portraits'
  );

-- STORAGE POLICIES - AVATARS
-- ===========================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Permitir lectura pública de avatares
CREATE POLICY "Users can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Permitir a usuarios subir su propio avatar
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    AND bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permitir a usuarios actualizar su propio avatar
CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Permitir a usuarios eliminar su propio avatar
CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (
    auth.role() = 'authenticated'
    AND bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
