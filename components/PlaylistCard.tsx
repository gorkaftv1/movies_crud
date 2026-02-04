import Link from "next/link";
import { PlaylistIcon, MovieIcon, LockIcon, UnlockIcon, EditIcon } from "@/components/Icons";
import type { Playlist } from "@/lib/types";

interface PlaylistCardProps {
  playlist: Playlist;
  currentUserId?: string;
}

export default function PlaylistCard({ playlist, currentUserId }: PlaylistCardProps) {
  const movieCount = playlist.movies?.length || 0;
  const isOwner = currentUserId === playlist.user_id;
  
  return (
    <div className="rounded-lg shadow-lg overflow-hidden transition-shadow hover:shadow-xl bg-white p-6 relative">
      {/* Botón de editar (solo para el propietario) */}
      {isOwner && (
        <Link
          href={`/playlists/${playlist.id}/edit`}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-red-50 transition-colors z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <EditIcon size={20} color="rgb(198, 40, 40)" />
        </Link>
      )}

      {/* Contenido de la tarjeta */}
      <Link href={`/playlists/${playlist.id}`}>
        <div className="cursor-pointer hover:scale-[1.02] transition-transform">
          {/* Encabezado */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              <div className="p-3 rounded-full mr-3" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)'}}>
                <PlaylistIcon size={24} color="rgb(198, 40, 40)" />
              </div>
              <div>
                <h3 className="font-bold text-lg" style={{color: 'rgb(198, 40, 40)'}}>{playlist.name}</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <MovieIcon size={16} className="mr-1" />
                  <span>{movieCount} película{movieCount !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Descripción */}
          {playlist.description && (
            <p className="text-sm text-gray-700 mb-4 line-clamp-3">
              {playlist.description}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t">
            <span>Creada el {new Date(playlist.created_at).toLocaleDateString('es-ES')}</span>
            {/* Icono de visibilidad */}
            <div className={`p-2 rounded-full ${playlist.is_public ? 'bg-green-100' : 'bg-gray-100'}`}>
              {playlist.is_public ? (
                <UnlockIcon size={20} color="rgb(198, 40, 40)" />
              ) : (
                <LockIcon size={20} color="rgb(107, 114, 128)" />
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
