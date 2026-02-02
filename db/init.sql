-- ===================================
-- ESQUEMA PRINCIPAL DE MOVIES CRUD
-- ===================================

-- Users (perfil extendido, vinculado a auth.users) - CREAR PRIMERO
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Movies (actualizado con user_id) - CREAR DESPUÉS DE PROFILES
CREATE TABLE public.movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  year INTEGER,
  portrait_url TEXT,
  score NUMERIC(3,1) CHECK (score >= 0 AND score <= 10),
  "cast" TEXT[],
  director TEXT,
  duration INTEGER CHECK (duration > 0),
  short_desc TEXT,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Favoritos (requiere tanto profiles como movies)
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- Evitar duplicados: un usuario solo puede tener una película una vez en favoritos
  UNIQUE(user_id, movie_id)
);

-- Playlists (futuro)
CREATE TABLE public.playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  movies UUID[], -- array de ids de movies
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para mejor performance
CREATE INDEX IF NOT EXISTS movies_user_id_idx ON public.movies(user_id);
CREATE INDEX IF NOT EXISTS movies_title_idx ON public.movies(title);
CREATE INDEX IF NOT EXISTS movies_created_at_idx ON public.movies(created_at DESC);

CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);

CREATE INDEX IF NOT EXISTS user_favorites_user_id_idx ON public.user_favorites(user_id);
CREATE INDEX IF NOT EXISTS user_favorites_movie_id_idx ON public.user_favorites(movie_id);
CREATE INDEX IF NOT EXISTS user_favorites_created_at_idx ON public.user_favorites(created_at DESC);

CREATE INDEX IF NOT EXISTS playlists_user_id_idx ON public.playlists(user_id);
CREATE INDEX IF NOT EXISTS playlists_is_public_idx ON public.playlists(is_public);

-- Habilitar RLS en todas las tablas
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;