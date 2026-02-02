"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

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
}

interface MovieCardProps {
  movie: Movie;
}

function MovieCard({ movie }: MovieCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Carátula */}
      <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden">
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
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {/* Información de la película */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-2">{movie.title}</h3>
        
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          {movie.year && <span>{movie.year}</span>}
          {movie.score && (
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
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
          <div className="text-xs text-gray-500">
            <span className="font-medium">Reparto:</span> {movie.cast.slice(0, 3).join(", ")}
            {movie.cast.length > 3 && "..."}
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

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError("");

      console.log('🎬 Fetching movies...');

      // Usar el cliente público para obtener películas sin autenticación
      const { data, error: fetchError } = await supabase
        .from('movies')
        .select('*')
        .order('title');

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

      setMovies(data || []);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Películas</h1>
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mx-auto">
            {error}
          </div>
          <button
            onClick={fetchMovies}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Películas</h1>
        <p className="text-gray-600">
          {movies.length} película{movies.length !== 1 ? 's' : ''} encontrada{movies.length !== 1 ? 's' : ''}
        </p>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-24 w-24 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h3a1 1 0 110 2h-1v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6H4a1 1 0 110-2h3z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No hay películas
          </h3>
          <p className="text-gray-500 mb-6">
            ¡Añade tu primera película para empezar!
          </p>
          <a
            href="/add-movie"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Añadir Película
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}