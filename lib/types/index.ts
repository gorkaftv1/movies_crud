// Tipo base de película (sin metadatos de favoritos)
export interface MovieBase {
  id: string;
  title: string;
  year?: number;
  director?: string;
  portrait_url?: string;
  score?: number;
  cast?: string[];
  duration?: number;
  short_desc?: string;
  genres?: string[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: Profile;
}

// Movie con información de favorito (usado en UI donde hay usuario autenticado)
export interface Movie extends MovieBase {
  is_favorited: boolean;
}

// Alias para compatibilidad (deprecado, usar Movie)
export type MovieWithFavorite = Movie;

// Tipos para perfiles de usuario
export interface Profile {
  id?: string;
  username: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipos para playlists
export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  movies?: string[]; // Mantener temporalmente para compatibilidad
  movieCount?: number; // Conteo de películas desde playlist_movies
  created_at: string;
  updated_at: string;
  profiles?: Profile;
}

// Tipos para la tabla de unión playlist-movies
export interface PlaylistMovie {
  playlist_id: string;
  movie_id: string;
  created_at: string;
}

// Tipos para favoritos
export interface Favorite {
  id: string;
  user_id: string;
  movie_id: string;
  created_at: string;
}

// Tipos para formularios
export interface AddMovieFormData {
  title: string;
  year: string;
  director: string;
  duration: string;
  score: string;
  short_desc: string;
  cast: string;
  genres: string;
}

export interface AddPlaylistFormData {
  name: string;
  description: string;
  isPublic: boolean;
}

// Tipos para búsqueda y filtros
export interface SearchFilters {
  searchQuery: string;
  yearFrom?: number;
  yearTo?: number;
  minScore?: number;
  genres?: string[];
  sortBy: 'title' | 'year' | 'score' | 'created_at';
  sortOrder: 'asc' | 'desc';
}

// Tipos de resultado para operaciones
export interface UploadResult {
  url?: string;
  path?: string;
  error?: string;
}

export interface OperationResult {
  error?: string;
}
