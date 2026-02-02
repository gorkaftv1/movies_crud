"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/supabase/favorites";
import { HeartIcon, HeartFilledIcon, StarFilledIcon, ImageIcon, UserIcon, SpinnerIcon, PlusIcon, MovieIcon } from "@/components/Icons";

interface Movie {
  id: string;
  title: string;
  year?: number;
  portrait_url?: string;
  score?: number;
  cast?: string[];
  director?: string;
  duration?: number;
  short_desc?: string;
  user_id?: string;
  is_favorited?: boolean;
  profiles?: {
    username: string;
  };
}

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
      {/* Carátula */}
      <div className="aspect-[3/4] relative overflow-hidden" style={{backgroundColor: 'rgb(248 248 248)'}}>
        {movie.portrait_url ? (
          <img
            src={movie.portrait_url}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.error('Error loading image:', movie.portrait_url);
              // En caso de error de carga, mostrar placeholder
              (e.target as HTMLImageElement).style.display = 'none';
              const placeholder = (e.target as HTMLImageElement).parentElement?.querySelector('.image-placeholder');
              if (placeholder) {
                (placeholder as HTMLElement).style.display = 'flex';
              }
            }}
            onLoad={() => {
              console.log('Image loaded successfully:', movie.portrait_url);
            }}
          />
        ) : null}
        
        {/* Placeholder que se muestra siempre como fallback */}
        <div className={`image-placeholder w-full h-full flex items-center justify-center text-gray-400 ${movie.portrait_url ? 'absolute inset-0 hidden' : ''}`}>
          <ImageIcon size={64} color="rgb(156, 163, 175)" />
        </div>
        
        {/* Botón de favoritos */}
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

      {/* Información de la película */}
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

        {movie.cast && movie.cast.length > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            <span className="font-medium">Reparto:</span> {movie.cast.slice(0, 3).join(", ")}
            {movie.cast.length > 3 && "..."}
          </div>
        )}

        {/* Usuario que añadió la película */}
        {movie.profiles && (
          <div className="text-xs px-2 py-1 rounded text-white" style={{backgroundColor: 'rgb(198, 40, 40)'}}>
            <span className="font-medium">Añadido por:</span> @{movie.profiles.username}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MoviesList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndFetchMovies();
    
    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        // Recargar películas cuando cambie el estado de autenticación
        await fetchMovies();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthAndFetchMovies = async () => {
    try {
      // Verificar autenticación
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
      }
      
      setUser(user);
      setIsAuthenticated(!!user);
      
      // Obtener películas
      await fetchMovies(!!user);
    } catch (error) {
      console.error('Error checking auth and fetching movies:', error);
      await fetchMovies(false);
    }
  };

  const fetchMovies = async (userAuthenticated?: boolean) => {
    const authenticated = userAuthenticated ?? isAuthenticated;
    try {
      setLoading(true);
      setError("");

      console.log('🎬 Fetching movies...');

      let query;
      
      if (authenticated) {
        // Si el usuario está autenticado, incluir información de favoritos
        query = supabase
          .from('movies')
          .select(`
            *,
            profiles:user_id (
              username
            ),
            user_favorites!left(
              user_id
            )
          `)
          .order('title');
      } else {
        // Si no está autenticado, solo obtener datos básicos
        query = supabase
          .from('movies')
          .select(`
            *,
            profiles:user_id (
              username
            )
          `)
          .order('title');
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('❌ Error fetching movies:', fetchError);
        
        // Si el error es de RLS/autenticación, mostramos mensaje específico
        if (fetchError.message.includes('row-level security') || 
            fetchError.message.includes('policy') ||
            fetchError.message.includes('permission')) {
          throw new Error('Las políticas de seguridad no están configuradas correctamente. Ejecuta el script storage_public.sql en tu Supabase.');
        }
        
        throw fetchError;
      }

      console.log(`✅ Movies fetched successfully: ${data?.length} movies found`);
      if (data?.length > 0) {
        console.log('📸 Portrait URLs found:');
        data.forEach(movie => {
          if (movie.portrait_url) {
            console.log(`- ${movie.title}: ${movie.portrait_url}`);
          }
        });
      }

      // Procesar los datos para incluir información de favoritos
      const processedMovies = (data || []).map(movie => ({
        ...movie,
        is_favorited: authenticated && movie.user_favorites ? movie.user_favorites.length > 0 : false
      }));

      setMovies(processedMovies);
    } catch (err: any) {
      console.error('💥 Error fetching movies:', err);
      setError(err.message || 'Error al cargar las películas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Películas</h1>
        <div className="flex justify-center">
          <SpinnerIcon size={48} color="rgb(198, 40, 40)" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8" style={{color: 'rgb(198, 40, 40)'}}>Películas</h1>
        <div className="text-center">
          <div className="border px-4 py-3 rounded max-w-md mx-auto" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
            {error}
          </div>
          <button
            onClick={fetchMovies}
            className="mt-4 px-4 py-2 rounded text-white transition-colors hover:bg-red-700"
            style={{backgroundColor: 'rgb(198, 40, 40)'}}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{backgroundColor: 'rgb(250 250 250)', minHeight: '100vh'}}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold" style={{color: 'rgb(198, 40, 40)'}}>Películas</h1>
        <p className="text-gray-600">
          {movies.length} película{movies.length !== 1 ? 's' : ''} encontrada{movies.length !== 1 ? 's' : ''}
        </p>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <MovieIcon size={96} color="rgb(156, 163, 175)" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No hay películas
          </h3>
          <p className="text-gray-500 mb-6">
            ¡Añade tu primera película para empezar!
          </p>
          <a
            href="/add-movie"
            className="inline-flex items-center px-6 py-3 rounded-lg text-white transition-colors hover:bg-red-700"
            style={{backgroundColor: 'rgb(198, 40, 40)'}}
          >
            <PlusIcon size={20} className="mr-2" />
            Añadir Película
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onToggleFavorite={handleToggleFavorite}
              isAuthenticated={isAuthenticated}
            />
          ))}
        </div>
      )}
    </div>
  );
}