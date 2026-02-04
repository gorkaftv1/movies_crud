'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import type { MovieWithFavorite } from '@/lib/types';
import { getMoviesWithFavorites, toggleFavorite} from '@/lib/favorites';
import { HeartFilledIcon, StarFilledIcon, ImageIcon } from '@/components/Icons';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, loading: authLoading, supabase } = useAuth();
  const [favorites, setFavorites] = useState<MovieWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndFetchFavorites();
  }, [user, authLoading]);

  const checkAuthAndFetchFavorites = async () => {
    if (authLoading || !supabase) return; // Wait for auth to initialize
    
    if (!user) {
      router.push('/login');
      return;
    }

    const { data, error } = await getMoviesWithFavorites(supabase);
    
    if (error) {
      console.error('Error fetching favorites:', error);
    } else if (data) {
      // Filter only favorited movies
      const favoritedMovies = data.filter(movie => movie.is_favorited);
      setFavorites(favoritedMovies);
    }
    
    setLoading(false);
  };

  const handleRemoveFavorite = async (movieId: string) => {
    if (!supabase) return;
    
    setRemovingId(movieId);
    
    const result = await toggleFavorite(supabase, movieId);
    
    if (result.success) {
      // Eliminar de la lista local
      setFavorites(favorites.filter(fav => fav.id !== movieId));
    }
    
    setRemovingId(null);
  };

  const handleCardClick = (movieId: string) => {
    router.push(`/movies/${movieId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(198,40,40)]"></div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Favoritos</h1>
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="mb-6">
              <HeartFilledIcon size={64} color="rgb(198, 40, 40)" className="mx-auto opacity-50" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">
              No tienes películas favoritas
            </h2>
            <p className="text-gray-500 mb-6">
              Empieza a agregar películas a tus favoritos para verlas aquí
            </p>
            <button
              onClick={() => router.push('/movies')}
              className="px-6 py-3 bg-[rgb(198,40,40)] text-white rounded-lg hover:bg-[rgb(178,35,35)] transition-colors"
            >
              Explorar películas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Favoritos</h1>
          <p className="text-gray-600 mt-2">
            {favorites.length} {favorites.length === 1 ? 'película' : 'películas'} en favoritos
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="relative rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl cursor-pointer bg-white group"
            >
              {/* Imagen */}
              <div 
                onClick={() => handleCardClick(favorite.id)}
                className="aspect-[3/4] relative overflow-hidden bg-gray-100"
              >
                {favorite.portrait_url ? (
                  <img
                    src={favorite.portrait_url}
                    alt={favorite.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon size={64} color="rgb(156, 163, 175)" />
                  </div>
                )}
                
                {/* Botón de quitar de favoritos */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFavorite(favorite.id);
                  }}
                  disabled={removingId === favorite.id}
                  className="absolute top-2 right-2 p-2 rounded-full bg-white/90 hover:bg-white shadow-md transition-all disabled:opacity-50"
                  title="Quitar de favoritos"
                >
                  <HeartFilledIcon 
                    size={20} 
                    color={removingId === favorite.id ? "rgb(156, 163, 175)" : "rgb(198, 40, 40)"} 
                  />
                </button>
              </div>

              {/* Información */}
              <div 
                onClick={() => handleCardClick(favorite.id)}
                className="p-4"
              >
                <h3 className="font-bold text-lg mb-1 line-clamp-2 text-[rgb(198,40,40)]">
                  {favorite.title}
                </h3>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  {favorite.year && <span>{favorite.year}</span>}
                  {favorite.score && (
                    <div className="flex items-center">
                      <StarFilledIcon size={16} color="rgb(255, 183, 0)" className="mr-1" />
                      <span>{favorite.score.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
