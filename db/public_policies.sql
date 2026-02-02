-- Políticas públicas para la tabla movies
-- Permitir a cualquiera leer las películas (público)
create policy "Anyone can view movies"
on public.movies for select
using (true);

-- Solo usuarios autenticados pueden insertar películas
create policy "Authenticated users can insert movies"
on public.movies for insert
with check (auth.role() = 'authenticated');

-- Solo usuarios autenticados pueden actualizar películas
create policy "Authenticated users can update movies"
on public.movies for update
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Solo usuarios autenticados pueden eliminar películas
create policy "Authenticated users can delete movies"
on public.movies for delete
using (auth.role() = 'authenticated');

-- Habilitar RLS en la tabla movies
alter table public.movies enable row level security;