-- Movies
create table public.movies (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  year integer,
  portrait_url text,
  score float,
  cast text[],
  director text,
  duration integer,
  short_desc text
);

-- Users (perfil extendido, vinculado a auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id),
  username text unique not null,
  avatar_url text
);

-- Playlists
create table public.playlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  name text not null,
  movies uuid[] -- array de ids de movies
);

-- Saved Movies
create table public.saved_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  movie_id uuid references movies(id)
);

-- Favourited Movies
create table public.favourited_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  movie_id uuid references movies(id)
);