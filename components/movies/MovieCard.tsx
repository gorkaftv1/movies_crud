// components/movies/MovieCard.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MovieWithFavorite } from "../../lib/types";
import {
  HeartIcon,
  HeartFilledIcon,
  StarFilledIcon,
  ImageIcon,
  SpinnerIcon,
  EditIcon,
  TrashIcon,
} from "../../components/global/Icons";

interface MovieCardProps {
  movie: MovieWithFavorite;
  onToggleFavorite: (movieId: string) => Promise<void>;
  isAuthenticated: boolean;
  currentUserId: string | null;
  onRemoveFromPlaylist?: (movieId: string) => Promise<void>;
  isRemovingFromPlaylist?: boolean;
}

export default function MovieCard({ 
  movie, 
  onToggleFavorite, 
  isAuthenticated, 
  currentUserId,
  onRemoveFromPlaylist,
  isRemovingFromPlaylist = false
}: MovieCardProps) {
  const router = useRouter();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setIsTogglingFavorite(true);
    await onToggleFavorite(movie.id);
    setIsTogglingFavorite(false);
  };

  const handleRemoveFromPlaylist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onRemoveFromPlaylist && !isRemovingFromPlaylist) {
      await onRemoveFromPlaylist(movie.id);
    }
  };

  const isOwner = currentUserId && movie.user_id === currentUserId;

  return (
    <div 
      onClick={() => router.push(`/movies/${movie.id}`)}
      className="group rounded-lg shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md cursor-pointer bg-white"
    >
      <div className="aspect-[3/4] relative bg-gray-50 overflow-hidden">
        {movie.portrait_url ? (
          <img
            src={movie.portrait_url}
            alt={movie.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <ImageIcon size={48} />
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-2">
          {isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/movies/${movie.id}/edit`);
              }}
              className="p-2 rounded-full bg-white/90 hover:bg-white shadow-sm text-gray-700 hover:text-red-600 transition-colors"
            >
              <EditIcon size={18} />
            </button>
          )}

          <button
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            className="p-2 rounded-full bg-white/90 hover:bg-white shadow-sm transition-all"
          >
            {isTogglingFavorite ? (
              <SpinnerIcon size={18} className="animate-spin text-gray-400" />
            ) : movie.is_favorited ? (
              <HeartFilledIcon size={18} className="text-red-600" />
            ) : (
              <HeartIcon size={18} className="text-gray-400 hover:text-red-500" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{movie.title}</h3>

        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
          {movie.year && <span>{movie.year}</span>}
          {movie.score && (
            <div className="flex items-center gap-1">
              <StarFilledIcon size={14} className="text-yellow-500" />
              <span className="font-medium text-gray-700">{movie.score.toFixed(1)}</span>
            </div>
          )}
        </div>

        {movie.short_desc && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3 h-8">{movie.short_desc}</p>
        )}

        {movie.profiles && (
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-50">
            <span className="text-[10px] text-gray-400 italic">Por @{movie.profiles.username}</span>
          </div>
        )}

        {/* Botón para quitar de playlist (solo visible cuando se pasa la prop) */}
        {onRemoveFromPlaylist && (
          <button
            onClick={handleRemoveFromPlaylist}
            disabled={isRemovingFromPlaylist}
            className="w-full mt-3 py-2 px-3 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRemovingFromPlaylist ? (
              <>
                <SpinnerIcon size={14} className="animate-spin" />
                <span>Quitando...</span>
              </>
            ) : (
              <>
                <TrashIcon size={14} />
                <span>Quitar de esta playlist</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}