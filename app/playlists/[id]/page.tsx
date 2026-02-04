"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { toggleFavorite } from "@/lib/favorites";
import { getPlaylistWithDetails, addMovieToPlaylist } from "@/lib/playlists";
import { SpinnerIcon, PlaylistIcon, MovieIcon, HeartIcon, HeartFilledIcon, StarFilledIcon, ImageIcon, UserIcon, LockIcon, UnlockIcon, EditIcon, PlusIcon, TrashIcon } from "@/components/Icons";
import type { Movie, Playlist } from "@/lib/types";

interface MovieCardProps {
  movie: Movie;
  onToggleFavorite: (movieId: string) => Promise<void>;
  isAuthenticated: boolean;
}

function MovieCard({ movie, onToggleFavorite, isAuthenticated }: MovieCardProps) {
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) return;
    
    setIsTogglingFavorite(true);
    await onToggleFavorite(movie.id);
    setIsTogglingFavorite(false);
  };

  return (
    <div className="rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl" style={{backgroundColor: 'white'}}>
      <div className="aspect-[3/4] relative overflow-hidden" style={{backgroundColor: 'rgb(248 248 248)'}}>
        {movie.portrait_url ? (
          <img
            src={movie.portrait_url}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const placeholder = (e.target as HTMLImageElement).parentElement?.querySelector('.image-placeholder');
              if (placeholder) {
                (placeholder as HTMLElement).style.display = 'flex';
              }
            }}
          />
        ) : null}
        
        <div className={`image-placeholder w-full h-full flex items-center justify-center text-gray-400 ${movie.portrait_url ? 'absolute inset-0 hidden' : ''}`}>
          <ImageIcon size={64} color="rgb(156, 163, 175)" />
        </div>
        
        {isAuthenticated && (
          <button
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            className="absolute top-2 right-2 p-2 rounded-full transition-all bg-white/80 hover:bg-white shadow-md"
          >
            {isTogglingFavorite ? (
              <SpinnerIcon size={20} color="rgb(156, 163, 175)" />
            ) : movie.is_favorited ? (
              <HeartFilledIcon size={20} color="rgb(198, 40, 40)" />
            ) : (
              <HeartIcon size={20} color="rgb(156, 163, 175)" />
            )}
          </button>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-2" style={{color: 'rgb(198, 40, 40)'}}>{movie.title}</h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          {movie.year && <span>{movie.year}</span>}
          {movie.score && (
            <div className="flex items-center">
              <StarFilledIcon size={16} color="rgb(255, 183, 0)" className="mr-1" />
              <span>{movie.score.toFixed(1)}</span>
            </div>
          )}
        </div>

        {movie.director && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Director:</span> {movie.director}
          </p>
        )}

        {movie.duration && (
          <p className="text-sm text-gray-600 mb-2">
            <span className="font-medium">Duración:</span> {movie.duration} min
          </p>
        )}

        {movie.short_desc && (
          <p className="text-sm text-gray-700 line-clamp-3 mb-3">
            {movie.short_desc}
          </p>
        )}

        {movie.profiles && (
          <div className="text-xs px-2 py-1 rounded text-white" style={{backgroundColor: 'rgb(198, 40, 40)'}}>
            <span className="font-medium">Añadido por:</span> @{movie.profiles.username}
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlaylistDetailPage() {
  const router = useRouter();
  const params = useParams();
  const playlistId = params?.id as string;
  const { user, loading: authLoading, supabase } = useAuth();
  
  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [showAddMoviesModal, setShowAddMoviesModal] = useState(false);
  const [availableMovies, setAvailableMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Effect for initial load and playlist ID changes
  useEffect(() => {
    if (!playlistId || authLoading || !supabase) return;
    fetchPlaylistData();
  }, [playlistId, authLoading, supabase]);

  // Effect for user changes
  useEffect(() => {
    if (!authLoading && playlist) {
      setIsOwner(user?.id === playlist.user_id);
    }
  }, [user?.id, playlist?.user_id, authLoading]);

  const fetchPlaylistData = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await getPlaylistWithDetails(supabase, playlistId, user);

      if (error) {
        throw new Error(error);
      }

      if (data) {
        setPlaylist(data.playlist);
        // Asegurar que movies sea un array plano, no anidado
        const moviesArray = Array.isArray(data.movies) ? data.movies.flat() : [];
        setMovies(moviesArray);
        setIsOwner(data.isOwner);
      }
      
      setLoading(false);
    } catch (err: any) {
      console.error('💥 Error:', err);
      setError(err.message || 'Error al cargar la playlist');
      setLoading(false);
    }
  };

  const handleDeletePlaylist = async () => {
    if (!user || !isOwner) return;

    try {
      setDeleting(true);
      console.log('🗑️ Deleting playlist:', playlistId);

      // Eliminar la playlist de la base de datos
      const { error: deleteError } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('❌ Error deleting playlist:', deleteError);
        throw deleteError;
      }

      console.log('✅ Playlist deleted successfully');
      
      // Redirigir a la lista de playlists
      router.push('/playlists');
    } catch (error: any) {
      console.error('💥 Error deleting playlist:', error);
      setError(error.message || 'Error al eliminar la playlist');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleToggleFavorite = async (movieId: string) => {
    if (!supabase) return;
    await toggleFavorite(supabase, movieId);
    // Update local state instead of refetching
    setMovies(prevMovies => 
      prevMovies.map(movie => 
        movie.id === movieId 
          ? { ...movie, is_favorited: !movie.is_favorited }
          : movie
      )
    );
  };

  const openAddMoviesModal = async () => {
    setShowAddMoviesModal(true);
    await loadAvailableMovies();
  };

  const loadAvailableMovies = async () => {
    try {
      setLoadingMovies(true);
      console.log('🎬 Loading available movies...');

      // Obtener todas las películas
      const { data, error: fetchError } = await supabase
        .from('movies')
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .order('title', { ascending: true });

      if (fetchError) {
        console.error('❌ Error fetching movies:', fetchError);
        throw fetchError;
      }

      // Filtrar películas que no están en la playlist
      const currentMovieIds = movies.map(movie => movie.id) || [];
      const available = (data || []).filter(m => !currentMovieIds.includes(m.id));
      
      console.log(`✅ Available movies: ${available.length}`);
      setAvailableMovies(available);
    } catch (err: any) {
      console.error('💥 Error loading movies:', err);
      setError(err.message || 'Error al cargar películas');
    } finally {
      setLoadingMovies(false);
    }
  };

  const toggleMovieSelection = (movieId: string) => {
    setSelectedMovieIds(prev => 
      prev.includes(movieId) 
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    );
  };

  const addSelectedMoviesToPlaylist = async () => {
    if (selectedMovieIds.length === 0) return;

    try {
      setLoadingMovies(true);
      console.log('➕ Adding movies to playlist:', selectedMovieIds);

      // Usar la nueva función addMovieToPlaylist para cada película seleccionada
      for (const movieId of selectedMovieIds) {
        const result = await addMovieToPlaylist(supabase, playlistId, movieId);
        if (!result.success) {
          throw new Error(result.error || 'Error al añadir película');
        }
      }

      console.log('✅ Movies added successfully');
      
      // Recargar la playlist
      await fetchPlaylistData();
      
      // Cerrar modal y limpiar selección
      setShowAddMoviesModal(false);
      setSelectedMovieIds([]);
    } catch (err: any) {
      console.error('💥 Error adding movies:', err);
      setError(err.message || 'Error al añadir películas');
    } finally {
      setLoadingMovies(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8" style={{backgroundColor: 'rgb(250 250 250)'}}>
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <SpinnerIcon size={48} color="rgb(198, 40, 40)" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !playlist) {
    return (
      <div className="min-h-screen py-8" style={{backgroundColor: 'rgb(250 250 250)'}}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="border px-4 py-3 rounded max-w-md mx-auto mb-4" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
              {error || 'Playlist no encontrada'}
            </div>
            <button
              onClick={() => router.push('/playlists')}
              className="px-4 py-2 rounded text-white transition-colors hover:bg-red-700"
              style={{backgroundColor: 'rgb(198, 40, 40)'}}
            >
              Volver a Playlists
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8" style={{backgroundColor: 'rgb(250 250 250)'}}>
      <div className="container mx-auto px-4">
        {/* Encabezado de la playlist */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center flex-1">
              <div className="p-4 rounded-full mr-4" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)'}}>
                <PlaylistIcon size={32} color="rgb(198, 40, 40)" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2" style={{color: 'rgb(198, 40, 40)'}}>{playlist.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MovieIcon size={16} className="mr-1" />
                    <span>{movies.length} película{movies.length !== 1 ? 's' : ''}</span>
                  </div>
                  {playlist.profiles && (
                    <div className="flex items-center">
                      <UserIcon size={16} className="mr-1" />
                      <span>@{playlist.profiles.username}</span>
                    </div>
                  )}
                  <div className={`flex items-center px-2 py-1 rounded ${playlist.is_public ? 'bg-green-100' : 'bg-gray-100'}`}>
                    {playlist.is_public ? (
                      <>
                        <UnlockIcon size={16} color="rgb(34, 197, 94)" className="mr-1" />
                        <span className="text-green-700 text-xs">Pública</span>
                      </>
                    ) : (
                      <>
                        <LockIcon size={16} color="rgb(107, 114, 128)" className="mr-1" />
                        <span className="text-gray-700 text-xs">Privada</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <>
                  <button
                    onClick={() => router.push(`/playlists/${playlistId}/edit`)}
                    className="px-4 py-2 rounded text-white transition-colors hover:bg-red-700 flex items-center gap-2"
                    style={{backgroundColor: 'rgb(198, 40, 40)'}}
                  >
                    <EditIcon size={20} color="white" />
                    Editar
                  </button>
                  <button
                    onClick={openAddMoviesModal}
                    className="px-4 py-2 rounded text-white transition-colors hover:bg-red-700 flex items-center gap-2"
                    style={{backgroundColor: 'rgb(198, 40, 40)'}}
                  >
                    <PlusIcon size={20} color="white" />
                    Añadir películas
                  </button>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 rounded bg-red-600 text-white transition-colors hover:bg-red-700 flex items-center gap-2"
                    title="Eliminar playlist"
                    style={{backgroundColor: 'rgb(198, 40, 40)'}}
                  >
                    <TrashIcon size={20} color="white" />
                    Eliminar
                  </button>
                </>
              )}
              <button
                onClick={() => router.push('/playlists')}
                className="px-4 py-2 rounded text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
            </div>
          </div>

          {playlist.description && (
            <p className="text-gray-700 mt-4">
              {playlist.description}
            </p>
          )}

          <div className="text-xs text-gray-500 mt-4">
            Creada el {new Date(playlist.created_at).toLocaleDateString('es-ES', { 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
        </div>

        {/* Lista de películas */}
        {movies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="flex justify-center mb-4">
              <MovieIcon size={96} color="rgb(156, 163, 175)" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Esta playlist está vacía
            </h3>
            <p className="text-gray-500">
              {isOwner ? 'Añade películas para empezar a construir tu playlist' : 'Aún no hay películas en esta playlist'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onToggleFavorite={handleToggleFavorite}
                isAuthenticated={!!user}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para añadir películas */}
      {showAddMoviesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Header del modal */}
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{color: 'rgb(198, 40, 40)'}}>
                Añadir películas a la playlist
              </h2>
              <button
                onClick={() => {
                  setShowAddMoviesModal(false);
                  setSelectedMovieIds([]);
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingMovies ? (
                <div className="flex justify-center py-12">
                  <SpinnerIcon size={48} color="rgb(198, 40, 40)" />
                </div>
              ) : availableMovies.length === 0 ? (
                <div className="text-center py-12">
                  <MovieIcon size={96} color="rgb(156, 163, 175)" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2 mt-4">
                    No hay películas disponibles
                  </h3>
                  <p className="text-gray-500">
                    Ya has añadido todas las películas a esta playlist
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Selecciona las películas que deseas añadir ({selectedMovieIds.length} seleccionadas)
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {availableMovies.map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => toggleMovieSelection(movie.id)}
                        className={`cursor-pointer rounded-lg border-2 transition-all ${
                          selectedMovieIds.includes(movie.id)
                            ? 'border-red-600 shadow-lg scale-95'
                            : 'border-gray-200 hover:border-red-300'
                        }`}
                      >
                        <div className="aspect-[3/4] relative overflow-hidden rounded-t-lg" style={{backgroundColor: 'rgb(248 248 248)'}}>
                          {movie.portrait_url ? (
                            <img
                              src={movie.portrait_url}
                              alt={movie.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon size={48} color="rgb(156, 163, 175)" />
                            </div>
                          )}
                          {selectedMovieIds.includes(movie.id) && (
                            <div className="absolute inset-0 bg-red-600 bg-opacity-20 flex items-center justify-center">
                              <div className="bg-red-600 text-white rounded-full p-2">
                                ✓
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-2">
                          <h4 className="text-sm font-semibold line-clamp-2" style={{color: 'rgb(198, 40, 40)'}}>
                            {movie.title}
                          </h4>
                          {movie.year && (
                            <p className="text-xs text-gray-500">{movie.year}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer del modal */}
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowAddMoviesModal(false);
                  setSelectedMovieIds([]);
                }}
                className="px-6 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={addSelectedMoviesToPlaylist}
                disabled={selectedMovieIds.length === 0 || loadingMovies}
                className="px-6 py-2 rounded text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{backgroundColor: 'rgb(198, 40, 40)'}}
              >
                {loadingMovies ? 'Añadiendo...' : `Añadir ${selectedMovieIds.length} película${selectedMovieIds.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Confirmar Eliminación
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar la playlist <strong>{playlist?.title}</strong>? Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeletePlaylist}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
