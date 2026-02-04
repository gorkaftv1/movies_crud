-- Script simplificado: Recrear estructura de playlists sin migración de datos
-- ELIMINA TODOS LOS DATOS DE PLAYLISTS EXISTENTES

-- 1. Eliminar tabla playlist_movies si existe (por si se ejecutó parcialmente antes)
DROP TABLE IF EXISTS playlist_movies CASCADE;

-- 2. Eliminar tabla playlists (esto elimina todos los datos)
DROP TABLE IF EXISTS playlists CASCADE;

-- 3. Recrear tabla playlists SIN la columna movies
CREATE TABLE playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de unión playlist_movies
CREATE TABLE playlist_movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  movie_id UUID NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar duplicados
  UNIQUE(playlist_id, movie_id)
);

-- 5. Crear índices para rendimiento
CREATE INDEX idx_playlists_user_id ON playlists(user_id);
CREATE INDEX idx_playlists_is_public ON playlists(is_public);
CREATE INDEX idx_playlists_created_at ON playlists(created_at);

CREATE INDEX idx_playlist_movies_playlist_id ON playlist_movies(playlist_id);
CREATE INDEX idx_playlist_movies_movie_id ON playlist_movies(movie_id);
CREATE INDEX idx_playlist_movies_created_at ON playlist_movies(created_at);

-- 6. Configurar Row Level Security (RLS) para playlists
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

-- Política para leer playlists: públicas o propias
CREATE POLICY "Users can view public playlists or their own" ON playlists
  FOR SELECT USING (
    is_public = true OR user_id = auth.uid()
  );

-- Política para insertar: solo autenticados pueden crear
CREATE POLICY "Authenticated users can create playlists" ON playlists
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Política para actualizar: solo el dueño
CREATE POLICY "Users can update their own playlists" ON playlists
  FOR UPDATE USING (user_id = auth.uid());

-- Política para eliminar: solo el dueño
CREATE POLICY "Users can delete their own playlists" ON playlists
  FOR DELETE USING (user_id = auth.uid());

-- 7. Configurar Row Level Security (RLS) para playlist_movies
ALTER TABLE playlist_movies ENABLE ROW LEVEL SECURITY;

-- Política para leer: solo si tienes acceso a la playlist (pública o eres el dueño)
CREATE POLICY "Users can view playlist_movies if they can view the playlist" ON playlist_movies
  FOR SELECT USING (
    playlist_id IN (
      SELECT id FROM playlists 
      WHERE is_public = true 
        OR user_id = auth.uid()
    )
  );

-- Política para insertar: solo si eres el dueño de la playlist
CREATE POLICY "Users can insert into their playlists" ON playlist_movies
  FOR INSERT WITH CHECK (
    playlist_id IN (
      SELECT id FROM playlists 
      WHERE user_id = auth.uid()
    )
  );

-- Política para eliminar: solo si eres el dueño de la playlist
CREATE POLICY "Users can delete from their playlists" ON playlist_movies
  FOR DELETE USING (
    playlist_id IN (
      SELECT id FROM playlists 
      WHERE user_id = auth.uid()
    )
  );

-- 8. Verificación
DO $$
BEGIN
  RAISE NOTICE 'Estructura de playlists recreada exitosamente';
  RAISE NOTICE '- Tabla playlists: SIN columna movies (estructura normalizada)';
  RAISE NOTICE '- Tabla playlist_movies: Relaciones many-to-many';
  RAISE NOTICE '- Políticas RLS: Configuradas';
  RAISE NOTICE '- Índices: Creados para rendimiento';
END $$;