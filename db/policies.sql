-- Permitir a los usuarios leer todas las películas
create policy "Public read access to movies"
  on public.movies
  for select
  using (true);

-- Permitir a los usuarios autenticados insertar, actualizar y borrar sus propios perfiles
create policy "Users can manage their own profile"
  on public.profiles
  for all
  using (auth.uid() = id);

-- Permitir a los usuarios autenticados gestionar sus playlists
create policy "Users can manage their own playlists"
  on public.playlists
  for all
  using (auth.uid() = user_id);

-- Permitir a los usuarios gestionar sus saved_movies
create policy "Users can manage their own saved movies"
  on public.saved_movies
  for all
  using (auth.uid() = user_id);

-- Permitir a los usuarios gestionar sus favourited_movies
create policy "Users can manage their own favourited movies"
  on public.favourited_movies
  for all
  using (auth.uid() = user_id);