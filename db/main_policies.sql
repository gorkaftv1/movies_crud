-- ===================================
-- POLÍTICAS DE SEGURIDAD RLS
-- ===================================

-- MOVIES POLICIES
-- ================

-- Cualquiera puede ver todas las películas (público)
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

-- Los usuarios pueden ver todos los perfiles (para mostrar quién añadió qué)
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

-- Los usuarios solo pueden gestionar su propio perfil
CREATE POLICY "Users can manage their own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- FAVORITOS POLICIES
-- ==================

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

-- PLAYLISTS POLICIES (futuro)
-- ===========================

-- Los usuarios pueden ver playlists públicas y sus propias playlists
CREATE POLICY "Users can view public playlists and own playlists"
  ON public.playlists FOR SELECT
  USING (is_public = true OR user_id = auth.uid());

-- Los usuarios solo pueden gestionar sus propias playlists
CREATE POLICY "Users can manage their own playlists"
  ON public.playlists FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);