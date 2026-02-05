// components/playlists/PlaylistDetailClient.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";
import { addMovieToPlaylist, getPlaylistWithDetails, removeMovieFromPlaylist } from "../../lib/playlists";
import { toggleFavorite } from "../../lib/favorites";
import MovieCard from "../movies/MovieCard";
import {
  SpinnerIcon,
  PlaylistIcon,
  MovieIcon,
  ImageIcon,
  UserIcon,
  LockIcon,
  UnlockIcon,
  EditIcon,
  PlusIcon,
  TrashIcon,
} from "../global/Icons";
import type { Movie, Playlist } from "../../lib/types";

interface PlaylistDetailClientProps {
  initialPlaylist: Playlist;
  initialMovies: Movie[];
  isOwner: boolean;
  currentUserId?: string;
}

export default function PlaylistDetailClient({ initialPlaylist, initialMovies, isOwner, currentUserId }: PlaylistDetailClientProps) {
  const router = useRouter();
  const { supabase } = useAuth();

  const [playlist] = useState<Playlist>(initialPlaylist);
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [error, setError] = useState("");
  const [showAddMoviesModal, setShowAddMoviesModal] = useState(false);
  const [availableMovies, setAvailableMovies] = useState<Movie[]>([]);
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [selectedMovieIds, setSelectedMovieIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [removingMovieId, setRemovingMovieId] = useState<string | null>(null);

  const handleDeletePlaylist = async () => {
    if (!isOwner || !supabase) return;

    try {
      setDeleting(true);
      console.log("🗑️ Deleting playlist:", playlist.id);

      const { error: deleteError } = await supabase.from("playlists").delete().eq("id", playlist.id).eq("user_id", currentUserId);

      if (deleteError) {
        console.error("❌ Error deleting playlist:", deleteError);
        throw deleteError;
      }

      console.log("✅ Playlist deleted successfully");
      router.push("/playlists");
    } catch (error: any) {
      console.error("💥 Error deleting playlist:", error);
      setError(error.message || "Error al eliminar la playlist");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const handleToggleFavorite = async (movieId: string) => {
    if (!supabase) return;
    
    await toggleFavorite(supabase, movieId);
    
    setMovies((prevMovies) => 
      prevMovies.map((movie) => 
        movie.id === movieId 
          ? { ...movie, is_favorited: !movie.is_favorited } 
          : movie
      )
    );
  };

  const handleRemoveFromPlaylist = async (movieId: string) => {
    if (!supabase || !isOwner) return;

    setRemovingMovieId(movieId);

    try {
      console.log("🗑️ Removing movie from playlist:", movieId);

      const result = await removeMovieFromPlaylist(supabase, playlist.id, movieId);

      if (result.success) {
        console.log("✅ Movie removed successfully");
        setMovies((prevMovies) => prevMovies.filter((movie) => movie.id !== movieId));
      } else {
        console.error("❌ Error removing movie:", result.error);
        setError(result.error || "Error al quitar la película");
        setTimeout(() => setError(""), 3000);
      }
    } catch (err: any) {
      console.error("💥 Unexpected error:", err);
      setError("Error al quitar la película");
      setTimeout(() => setError(""), 3000);
    } finally {
      setRemovingMovieId(null);
    }
  };

  const openAddMoviesModal = async () => {
    setShowAddMoviesModal(true);
    await loadAvailableMovies();
  };

  const loadAvailableMovies = async () => {
    if (!supabase) return;

    try {
      setLoadingMovies(true);
      console.log("🎬 Loading available movies...");

      const { data, error: fetchError } = await supabase
        .from("movies")
        .select(`
          *,
          profiles:user_id (
            username
          )
        `)
        .order("title", { ascending: true });

      if (fetchError) {
        console.error("❌ Error fetching movies:", fetchError);
        throw fetchError;
      }

      const currentMovieIds = movies.map((movie) => movie.id) || [];
      const available = (data || []).filter((m) => !currentMovieIds.includes(m.id));

      console.log(`✅ Available movies: ${available.length}`);
      setAvailableMovies(available);
    } catch (err: any) {
      console.error("💥 Error loading movies:", err);
      setError(err.message || "Error al cargar películas");
    } finally {
      setLoadingMovies(false);
    }
  };

  const toggleMovieSelection = (movieId: string) => {
    setSelectedMovieIds((prev) => (prev.includes(movieId) ? prev.filter((id) => id !== movieId) : [...prev, movieId]));
  };

  const addSelectedMoviesToPlaylist = async () => {
    if (selectedMovieIds.length === 0 || !supabase) return;

    try {
      setLoadingMovies(true);
      console.log("➕ Adding movies to playlist:", selectedMovieIds);

      for (const movieId of selectedMovieIds) {
        const result = await addMovieToPlaylist(supabase, playlist.id, movieId);
        if (!result.success) {
          throw new Error(result.error || "Error al añadir película");
        }
      }

      console.log("✅ Movies added successfully");

      const { data } = await getPlaylistWithDetails(supabase, playlist.id, { id: currentUserId });
      if (data) {
        const moviesArray = Array.isArray(data.movies) ? data.movies.flat() : [];
        setMovies(moviesArray);
      }

      setShowAddMoviesModal(false);
      setSelectedMovieIds([]);
    } catch (err: any) {
      console.error("💥 Error adding movies:", err);
      setError(err.message || "Error al añadir películas");
    } finally {
      setLoadingMovies(false);
    }
  };

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: "rgb(250 250 250)" }}>
      <div className="container mx-auto px-4">
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-100 border border-red-200 text-red-800">
            {error}
          </div>
        )}

        {/* Encabezado de la playlist */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center flex-1">
              <div className="p-4 rounded-full mr-4" style={{ backgroundColor: "rgba(198, 40, 40, 0.1)" }}>
                <PlaylistIcon size={32} color="rgb(198, 40, 40)" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2" style={{ color: "rgb(198, 40, 40)" }}>
                  {playlist.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MovieIcon size={16} className="mr-1" />
                    <span>
                      {movies.length} película{movies.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {playlist.profiles && (
                    <div className="flex items-center">
                      <UserIcon size={16} className="mr-1" />
                      <span>@{playlist.profiles.username}</span>
                    </div>
                  )}
                  <div className={`flex items-center px-2 py-1 rounded ${playlist.is_public ? "bg-green-100" : "bg-gray-100"}`}>
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
                  <button onClick={() => router.push(`/playlists/${playlist.id}/edit`)} className="px-4 py-2 rounded text-white transition-colors hover:bg-red-700 flex items-center gap-2" style={{ backgroundColor: "rgb(198, 40, 40)" }}>
                    <EditIcon size={20} color="white" />
                    Editar
                  </button>
                  <button onClick={openAddMoviesModal} className="px-4 py-2 rounded text-white transition-colors hover:bg-red-700 flex items-center gap-2" style={{ backgroundColor: "rgb(198, 40, 40)" }}>
                    <PlusIcon size={20} color="white" />
                    Añadir películas
                  </button>
                  <button onClick={() => setShowDeleteModal(true)} className="px-4 py-2 rounded bg-red-600 text-white transition-colors hover:bg-red-700 flex items-center gap-2" title="Eliminar playlist" style={{ backgroundColor: "rgb(198, 40, 40)" }}>
                    <TrashIcon size={20} color="white" />
                    Eliminar
                  </button>
                </>
              )}
              <button onClick={() => router.push("/playlists")} className="px-4 py-2 rounded text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
                Volver
              </button>
            </div>
          </div>

          {playlist.description && <p className="text-gray-700 mt-4">{playlist.description}</p>}

          <div className="text-xs text-gray-500 mt-4">
            Creada el{" "}
            {new Date(playlist.created_at).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Lista de películas */}
        {movies.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="flex justify-center mb-4">
              <MovieIcon size={96} color="rgb(156, 163, 175)" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Esta playlist está vacía</h3>
            <p className="text-gray-500">{isOwner ? "Añade películas para empezar a construir tu playlist" : "Aún no hay películas en esta playlist"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
              <MovieCard 
                key={movie.id} 
                movie={movie} 
                onToggleFavorite={handleToggleFavorite}
                isAuthenticated={!!currentUserId}
                currentUserId={currentUserId || null}
                onRemoveFromPlaylist={isOwner ? handleRemoveFromPlaylist : undefined}
                isRemovingFromPlaylist={removingMovieId === movie.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal para añadir películas - igual que antes */}
      {showAddMoviesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* ... resto del modal igual ... */}
        </div>
      )}

      {/* Modal de confirmación de eliminación - igual que antes */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          {/* ... resto del modal igual ... */}
        </div>
      )}
    </div>
  );
}