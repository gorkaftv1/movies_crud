-- ===================================
-- MOVIES CRUD - ESQUEMA DE BASE DE DATOS
-- Versión Final
-- ===================================

-- TABLAS
-- ======

-- 1. Profiles (perfil extendido de usuarios)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Movies (películas con géneros)
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year INTEGER,
  portrait_url TEXT,
  score NUMERIC(3,1) CHECK (score >= 0 AND score <= 10),
  "cast" TEXT[],
  director TEXT,
  duration INTEGER CHECK (duration > 0),
  short_desc TEXT,
  genres TEXT[], -- Array de géneros
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. User Favorites (favoritos de usuarios)
CREATE TABLE IF NOT EXISTS public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, movie_id) -- Un usuario solo puede tener una película una vez en favoritos
);

-- 4. Playlists (listas de reproducción) - Estructura normalizada
CREATE TABLE IF NOT EXISTS public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Playlist Movies (relación many-to-many entre playlists y películas)
CREATE TABLE IF NOT EXISTS public.playlist_movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(playlist_id, movie_id) -- Evitar duplicados
);

-- ÍNDICES
-- =======

-- Movies
CREATE INDEX IF NOT EXISTS movies_user_id_idx ON public.movies(user_id);
CREATE INDEX IF NOT EXISTS movies_title_idx ON public.movies(title);
CREATE INDEX IF NOT EXISTS movies_created_at_idx ON public.movies(created_at DESC);
CREATE INDEX IF NOT EXISTS movies_genres_idx ON public.movies USING GIN(genres);

-- Profiles
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

-- User Favorites
CREATE INDEX IF NOT EXISTS user_favorites_user_id_idx ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS user_favorites_movie_id_idx ON public.user_favorites(movie_id);
CREATE INDEX IF NOT EXISTS user_favorites_created_at_idx ON public.user_favorites(created_at DESC);

-- Playlists
CREATE INDEX IF NOT EXISTS playlists_user_id_idx ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS playlists_is_public_idx ON public.playlists(is_public);
CREATE INDEX IF NOT EXISTS playlists_created_at_idx ON public.playlists(created_at DESC);

-- Playlist Movies
CREATE INDEX IF NOT EXISTS playlist_movies_playlist_id_idx ON public.playlist_movies(playlist_id);
CREATE INDEX IF NOT EXISTS playlist_movies_movie_id_idx ON public.playlist_movies(movie_id);
CREATE INDEX IF NOT EXISTS playlist_movies_created_at_idx ON public.playlist_movies(created_at DESC);

-- HABILITAR ROW LEVEL SECURITY
-- =============================

ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_movies ENABLE ROW LEVEL SECURITY;

-- FUNCIONES Y TRIGGERS
-- ====================

-- 1. Auto-crear perfil al registrarse un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Toggle favoritos (añadir/quitar)
CREATE OR REPLACE FUNCTION public.toggle_favorite(movie_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  favorite_exists BOOLEAN;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  SELECT EXISTS(
    SELECT 1 FROM public.user_favorites 
    WHERE user_id = current_user_id AND movie_id = movie_uuid
  ) INTO favorite_exists;
  
  IF favorite_exists THEN
    DELETE FROM public.user_favorites 
    WHERE user_id = current_user_id AND movie_id = movie_uuid;
    RETURN FALSE;
  ELSE
    INSERT INTO public.user_favorites (user_id, movie_id)
    VALUES (current_user_id, movie_uuid);
    RETURN TRUE;
  END IF;
END;
$$;

-- 3. Obtener email por username (para login con username)
CREATE OR REPLACE FUNCTION public.get_email_by_username(p_username TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT;
BEGIN
  -- Buscar user_id en profiles
  SELECT id INTO v_user_id
  FROM public.profiles
  WHERE username = p_username
  LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Obtener email de auth.users
  SELECT email INTO v_email
  FROM auth.users
  WHERE id = v_user_id;
  
  RETURN v_email;
END;
$$;

-- Otorgar permisos para función de login con username
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_by_username(TEXT) TO authenticated;

-- STORAGE BUCKETS
-- ===============

-- Crear buckets para avatares y carátulas
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', false),
  ('portraits', 'portraits', true)
ON CONFLICT (id) DO UPDATE 
SET public = EXCLUDED.public;
