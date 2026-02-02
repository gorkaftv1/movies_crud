-- ===================================
-- LIMPIEZA COMPLETA DE SUPABASE
-- ===================================
-- ⚠️  CUIDADO: Este script ELIMINA TODOS LOS DATOS
-- Solo ejecutar si quieres empezar desde cero

-- 1. ELIMINAR POLÍTICAS EXISTENTES
-- ================================

-- Storage policies
DROP POLICY IF EXISTS "Public read access to portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete portraits" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatars" ON storage.objects;

-- Políticas viejas que puedan existir
DROP POLICY IF EXISTS "Public read access to movies" ON public.movies;
DROP POLICY IF EXISTS "Anyone can view movies" ON public.movies;
DROP POLICY IF EXISTS "Authenticated users can insert movies" ON public.movies;
DROP POLICY IF EXISTS "Users can update own movies" ON public.movies;
DROP POLICY IF EXISTS "Users can delete own movies" ON public.movies;
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.user_favorites;
DROP POLICY IF EXISTS "Users can manage their own playlists" ON public.playlists;
DROP POLICY IF EXISTS "Users can view public playlists and own playlists" ON public.playlists;

-- Políticas de tablas que vamos a eliminar
DROP POLICY IF EXISTS "Users can manage their own saved movies" ON public.saved_movies;
DROP POLICY IF EXISTS "Users can manage their own favourited movies" ON public.favourited_movies;

-- 2. ELIMINAR TRIGGERS
-- ===================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_movies_updated_at ON public.movies;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_playlists_updated_at ON public.playlists;

-- 3. ELIMINAR FUNCIONES
-- ====================

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.toggle_favorite(UUID);
DROP FUNCTION IF EXISTS public.get_user_by_username_or_email(text);
DROP FUNCTION IF EXISTS public.get_user_favorites(UUID);
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- 4. ELIMINAR TABLAS (en orden correcto por dependencias)
-- ======================================================

-- Eliminar tablas con foreign keys primero
DROP TABLE IF EXISTS public.user_favorites CASCADE;
DROP TABLE IF EXISTS public.playlists CASCADE;
DROP TABLE IF EXISTS public.saved_movies CASCADE;
DROP TABLE IF EXISTS public.favourited_movies CASCADE;

-- Eliminar tabla movies (que puede tener foreign key a profiles)
DROP TABLE IF EXISTS public.movies CASCADE;

-- Eliminar profiles al final
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 5. LIMPIAR STORAGE BUCKETS
-- =========================

-- Eliminar todos los archivos de los buckets (opcional)
-- DELETE FROM storage.objects WHERE bucket_id IN ('avatars', 'portraits');

-- Eliminar buckets (opcional - descomenta si quieres eliminarlos)
-- DELETE FROM storage.buckets WHERE id IN ('avatars', 'portraits');

-- 6. LIMPIAR OBJETOS AUTH (OPCIONAL - ¡CUIDADO!)
-- ==============================================

-- ⚠️ DESCOMENTA SOLO SI QUIERES ELIMINAR TODOS LOS USUARIOS
-- ⚠️ ESTO NO SE PUEDE DESHACER
-- DELETE FROM auth.users;

-- ===================================
-- LIMPIEZA COMPLETADA
-- ===================================

-- Ahora puedes ejecutar en orden:
-- 1. init.sql
-- 2. functions.sql  
-- 3. main_policies.sql
-- 4. storage_policies.sql