// Movie + favorite metadata (normalizada)
export interface MovieWithFavorite {
  id: string;
  title: string;
  year?: number;
  director?: string;
  portrait_url?: string;
  score?: number;
  cast?: string[];
  duration?: number;
  short_desc?: string;
  user_id?: string;
  is_favorited: boolean;
  profiles?: Profile;
}
// Tipos para películas
export interface Movie {
  id: string;
  title: string;
  year?: number;
  portrait_url?: string;
  score?: number;
  cast?: string[];
  director?: string;
  duration?: number;
  short_desc?: string;
  genres?: string[];
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  is_favorited?: boolean;
  profiles?: Profile;
}

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
