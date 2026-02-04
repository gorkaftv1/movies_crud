'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getUserPlaylists, addMovieToPlaylist, getPlaylistsContainingMovie } from '@/lib/playlists';
import { toggleFavorite, isMovieFavorited } from '@/lib/favorites';
import { deleteMovie } from '@/lib/movies';
import { useAuth } from '@/lib/auth/AuthContext';
import { HeartIcon, HeartFilledIcon, EditIcon, TrashIcon } from '@/components/Icons';
import type { Movie, Playlist } from '@/lib/types';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, supabase, loading: authLoading } = useAuth();
  const movieId = params.id as string;
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlistsWithMovie, setPlaylistsWithMovie] = useState<string[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState('');
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);
  const [message, setMessage] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading || !supabase) return; // Wait for auth to initialize
      
      try {
        // Obtener detalles de la película
        const { data: movieData, error: movieError } = await supabase
          .from('movies')
          .select('*, profiles(username)')
          .eq('id', movieId)
          .single();

        if (movieError) {
          console.error('Error fetching movie:', movieError);
          router.push('/movies');
          return;
        }

        setMovie(movieData);

        if (user) {
          // Verificar si el usuario es el propietario
          setIsOwner(user.id === movieData.user_id);

          // Verificar si es favorito
          const { isFavorited } = await isMovieFavorited(supabase, movieId);
          setIsFav(isFavorited);

          // Obtener playlists del usuario
          const userPlaylists = await getUserPlaylists(supabase, user.id);
          setPlaylists(userPlaylists);

          // Obtener playlists que ya contienen esta película
          const playlistIds = await getPlaylistsContainingMovie(supabase, movieId, user.id);
          setPlaylistsWithMovie(playlistIds);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [movieId, router, user?.id, authLoading, supabase]);

  const handleToggleFavorite = async () => {
    if (!user || !supabase) {
      router.push('/login');
      return;
    }

    const result = await toggleFavorite(supabase, movieId);
    if (result.success) {
      setIsFav(result.isFavorited);
    }
  };

  const handleDeleteMovie = async () => {
    if (!user || !isOwner || !supabase) return;

    try {
      setDeleting(true);
      console.log('🗑️ Deleting movie:', movieId);

      // Usar la función mejorada que maneja cascadas
      const result = await deleteMovie(supabase, movieId, user.id);

      if (!result.success) {
        throw new Error(result.error || 'Error desconocido');
      }

      console.log('✅ Movie deleted successfully');
      
      // Redirigir a la lista de películas
      router.push('/movies');
    } catch (error: any) {
      console.error('💥 Error deleting movie:', error);
      alert('Error al eliminar la película: ' + error.message);
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleAddToPlaylist = async () => {
    if (!selectedPlaylist || !supabase) {
      setMessage('Por favor, selecciona una playlist');
      return;
    }

    setAddingToPlaylist(true);
    setMessage('');

    const result = await addMovieToPlaylist(supabase, selectedPlaylist, movieId);
    
    if (result.success) {
      setMessage('✅ Película añadida a la playlist');
      setPlaylistsWithMovie([...playlistsWithMovie, selectedPlaylist]);
      setSelectedPlaylist('');
    } else {
      setMessage(`❌ ${result.error}`);
    }

    setAddingToPlaylist(false);
    setTimeout(() => setMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(198,40,40)]"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Película no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="mb-6 text-[rgb(198,40,40)] hover:underline flex items-center gap-2"
        >
          ← Volver
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Poster */}
            <div className="md:w-1/3 bg-gray-900">
              {movie.portrait_url ? (
                <img
                  src={movie.portrait_url}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-gray-500">
                  Sin imagen
                </div>
              )}
            </div>

            {/* Detalles */}
            <div className="md:w-2/3 p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{movie.title}</h1>
                  <p className="text-gray-600">
                    Añadida por <span className="font-medium">{movie.profiles?.username}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {isOwner && (
                    <>
                      <button
                        onClick={() => router.push(`/movies/${movieId}/edit`)}
                        className="px-4 py-2 bg-[rgb(198,40,40)] text-white rounded-lg hover:bg-[rgb(178,35,35)] transition-colors flex items-center gap-2"
                        title="Editar película"
                      >
                        <EditIcon className="w-5 h-5" />
                        Editar
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        title="Eliminar película"
                      >
                        <TrashIcon className="w-5 h-5" />
                        Eliminar
                      </button>
                    </>
                  )}
                  {user && (
                    <button
                      onClick={handleToggleFavorite}
                      className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                      title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    >
                      {isFav ? (
                        <HeartFilledIcon className="w-8 h-8 text-[rgb(198,40,40)]" />
                      ) : (
                        <HeartIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Año</p>
                  <p className="text-lg font-medium text-gray-900">{movie.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Puntuación</p>
                  <p className="text-lg font-medium text-gray-900">
                    ⭐ {movie.score ? movie.score.toFixed(1) : 'N/A'}/10
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Descripción</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {movie.short_desc || 'Sin descripción disponible.'}
                </p>
              </div>

              {user && playlists.length > 0 && (
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Añadir a playlist</h2>
                  
                  {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${
                      message.includes('✅') 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {message}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <select
                      value={selectedPlaylist}
                      onChange={(e) => setSelectedPlaylist(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(198,40,40)] focus:border-transparent"
                      disabled={addingToPlaylist}
                    >
                      <option value="">Selecciona una playlist...</option>
                      {playlists.map((playlist) => {
                        const alreadyAdded = playlistsWithMovie.includes(playlist.id);
                        return (
                          <option 
                            key={playlist.id} 
                            value={playlist.id}
                            disabled={alreadyAdded}
                          >
                            {playlist.title} {alreadyAdded ? '✓ (Ya añadida)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={handleAddToPlaylist}
                      disabled={!selectedPlaylist || addingToPlaylist}
                      className="px-6 py-2 bg-[rgb(198,40,40)] text-white rounded-lg hover:bg-[rgb(178,35,35)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addingToPlaylist ? 'Añadiendo...' : 'Añadir'}
                    </button>
                  </div>

                  {playlists.length === playlistsWithMovie.length && playlists.length > 0 && (
                    <p className="mt-3 text-sm text-gray-500">
                      Esta película ya está en todas tus playlists
                    </p>
                  )}
                </div>
              )}

              {user && playlists.length === 0 && (
                <div className="border-t pt-6">
                  <div className="bg-gray-100 rounded-lg p-4 text-center">
                    <p className="text-gray-600 mb-3">No tienes playlists creadas</p>
                    <button
                      onClick={() => router.push('/create-playlist')}
                      className="px-4 py-2 bg-[rgb(198,40,40)] text-white rounded-lg hover:bg-[rgb(178,35,35)] transition-colors"
                    >
                      Crear playlist
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

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
              ¿Estás seguro de que deseas eliminar <strong>{movie?.title}</strong>? Esta acción no se puede deshacer.
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
                onClick={handleDeleteMovie}
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
