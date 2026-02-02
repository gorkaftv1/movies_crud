-- ===================================
-- FUNCIONES Y TRIGGERS NECESARIOS
-- ===================================

-- 1. Función para auto-crear profile al registrarse
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

-- Eliminar trigger existente si existe y crear nuevo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Función para toggle favoritos (añadir o quitar)
CREATE OR REPLACE FUNCTION public.toggle_favorite(movie_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id UUID;
  favorite_exists BOOLEAN;
BEGIN
  -- Obtener el ID del usuario autenticado
  current_user_id := auth.uid();
  
  -- Verificar que hay un usuario autenticado
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Verificar si ya existe en favoritos
  SELECT EXISTS(
    SELECT 1 FROM public.user_favorites 
    WHERE user_id = current_user_id AND movie_id = movie_uuid
  ) INTO favorite_exists;
  
  IF favorite_exists THEN
    -- Si existe, eliminarlo
    DELETE FROM public.user_favorites 
    WHERE user_id = current_user_id AND movie_id = movie_uuid;
    RETURN FALSE; -- Indica que se quitó de favoritos
  ELSE
    -- Si no existe, añadirlo
    INSERT INTO public.user_favorites (user_id, movie_id)
    VALUES (current_user_id, movie_uuid);
    RETURN TRUE; -- Indica que se añadió a favoritos
  END IF;
END;
$$;

-- 3. Función para buscar usuario por username o email
CREATE OR REPLACE FUNCTION public.get_user_by_username_or_email(identifier text)
RETURNS TABLE(user_id uuid, email text, username text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar si el identificador es un email (contiene @)
  IF identifier LIKE '%@%' THEN
    -- Buscar por email
    RETURN QUERY
    SELECT au.id, au.email::text, p.username
    FROM auth.users au
    JOIN public.profiles p ON au.id = p.id
    WHERE au.email = identifier;
  ELSE
    -- Buscar por username
    RETURN QUERY
    SELECT au.id, au.email::text, p.username
    FROM auth.users au
    JOIN public.profiles p ON au.id = p.id
    WHERE p.username = identifier;
  END IF;
END;
$$;

-- 4. Función para obtener favoritos de un usuario
CREATE OR REPLACE FUNCTION public.get_user_favorites(user_uuid UUID DEFAULT auth.uid())
RETURNS TABLE(
  movie_id UUID,
  title TEXT,
  year INTEGER,
  director TEXT,
  portrait_url TEXT,
  score NUMERIC,
  favorited_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que hay un usuario autenticado
  IF user_uuid IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;
  
  -- Solo permitir que los usuarios vean sus propios favoritos
  IF user_uuid != auth.uid() THEN
    RAISE EXCEPTION 'No tienes permisos para ver los favoritos de otro usuario';
  END IF;
  
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.year,
    m.director,
    m.portrait_url,
    m.score,
    f.created_at
  FROM public.user_favorites f
  JOIN public.movies m ON f.movie_id = m.id
  WHERE f.user_id = user_uuid
  ORDER BY f.created_at DESC;
END;
$$;

-- 5. Función para actualizar timestamp de updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger de updated_at a las tablas necesarias
DROP TRIGGER IF EXISTS update_movies_updated_at ON public.movies;
CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON public.movies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_playlists_updated_at ON public.playlists;
CREATE TRIGGER update_playlists_updated_at
  BEFORE UPDATE ON public.playlists
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();