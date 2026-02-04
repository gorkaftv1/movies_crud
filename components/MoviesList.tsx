"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { getAllMoviesWithOptionalFavorites, toggleFavorite } from "@/lib/favorites";
import { 
  PlusIcon, 
  MovieIcon,
  SpinnerIcon,
} from "@/components/Icons";
import MovieSearchBar from "@/components/MovieSearchBar";
import type { Movie, SearchFilters, MovieWithFavorite } from "@/lib/types";
import MovieCard from "@/components/MovieCard";

// MovieCard has been moved to components/MovieCard.tsx for reuse

// --- COMPONENTE PRINCIPAL: MoviesList ---
export default function MoviesList() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [allMovies, setAllMovies] = useState<MovieWithFavorite[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<MovieWithFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    searchQuery: "",
    sortBy: 'title',
    sortOrder: 'asc'
  });

  // 1. Cargar datos cuando la sesión esté lista
  useEffect(() => {
    if (!authLoading) {
      fetchMovies();
    }
  }, [authLoading, user?.id]); // Refrescar si el ID de usuario cambia (login/logout)

  const fetchMovies = async () => {
    try {
      setLoading(true);
      setError("");
      const { data, error: fetchError } = await getAllMoviesWithOptionalFavorites();

      console.log('fetchMovies result:', { length: data?.length ?? 0, error: fetchError });

      if (fetchError) throw new Error(fetchError);

      const movies = (data || []) as MovieWithFavorite[];
      setAllMovies(movies);
      applyFilters(movies, filters);
    } catch (err: any) {
      setError(err.message || 'Error al conectar con la base de datos');
    } finally {
      setLoading(false);
    }
  };

  // 2. Lógica de filtrado y ordenación
  const applyFilters = (moviesList: MovieWithFavorite[], currentFilters: SearchFilters) => {
    let result = [...moviesList];

    if (currentFilters.searchQuery) {
      const q = currentFilters.searchQuery.toLowerCase();
      result = result.filter(m => 
        m.title.toLowerCase().includes(q) || 
        m.director?.toLowerCase().includes(q)
      );
    }

    // ... (puedes añadir aquí el resto de filtros: yearFrom, minScore, etc.)

    result.sort((a, b) => {
      const factor = currentFilters.sortOrder === 'asc' ? 1 : -1;
      if (currentFilters.sortBy === 'title') return a.title.localeCompare(b.title) * factor;
      if (currentFilters.sortBy === 'year') return ((a.year || 0) - (b.year || 0)) * factor;
      if (currentFilters.sortBy === 'score') return ((a.score || 0) - (b.score || 0)) * factor;
      return 0;
    });

    setFilteredMovies(result);
  };

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    applyFilters(allMovies, newFilters);
  };

  // 3. Manejo de Favoritos con Actualización Optimista
  const handleToggleFavorite = async (movieId: string) => {
    if (!user) return;

    // Helper para actualizar el estado local
    const updateLocal = (list: MovieWithFavorite[]) => 
      list.map(m => m.id === movieId ? { ...m, is_favorited: !m.is_favorited } : m);

    setAllMovies(prev => updateLocal(prev));
    setFilteredMovies(prev => updateLocal(prev));

    const result = await toggleFavorite(movieId);
    
    if (!result.success) {
      // Si falla, revertimos el cambio
      setAllMovies(prev => updateLocal(prev));
      setFilteredMovies(prev => updateLocal(prev));
      alert("No se pudo actualizar favoritos: " + result.error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <SpinnerIcon size={40} className="animate-spin text-red-600 mb-4" />
        <p className="text-gray-500 animate-pulse">Cargando cartelera...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Descubrir <span className="text-red-600">Películas</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Explora {allMovies.length} títulos añadidos por la comunidad.
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="mb-10">
        <MovieSearchBar onSearch={handleSearch} initialFilters={filters} />
      </div>

      {/* Grid de Películas */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard 
              key={movie.id} 
              movie={movie} 
              onToggleFavorite={handleToggleFavorite}
              isAuthenticated={!!user}
              currentUserId={user?.id || null}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <MovieIcon size={64} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No se encontraron películas</h3>
          <p className="text-gray-500 max-w-xs mx-auto mt-2">
            Intenta ajustar los filtros o añade una nueva película a la colección.
          </p>
        </div>
      )}
      
      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-center text-sm">
          {error}
        </div>
      )}
    </div>
  );
}