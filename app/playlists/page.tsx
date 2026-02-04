"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { getUserPlaylists } from '@/lib/playlists';
import { SpinnerIcon, PlusIcon, PlaylistIcon } from "@/components/Icons";
import PlaylistCard from "@/components/PlaylistCard";
import type { Playlist } from "@/lib/types";

export default function PlaylistsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Verificar autenticación y cargar playlists
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        fetchPlaylists();
      }
    }
  }, [authLoading, user?.id]);

  const fetchPlaylists = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError("");

      console.log('🎵 Fetching playlists for user', user?.id);

      const data = await getUserPlaylists(user.id);

      console.log(`✅ Playlists fetched successfully: ${data?.length} playlists found`);
      setPlaylists(data || []);
    } catch (err: any) {
      console.error('💥 Error fetching playlists:', err);
      setError(err.message || 'Error al cargar las playlists');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Mis Playlists</h1>
        <div className="flex justify-center">
          <SpinnerIcon size={48} color="rgb(198, 40, 40)" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8" style={{color: 'rgb(198, 40, 40)'}}>Mis Playlists</h1>
        <div className="text-center">
          <div className="border px-4 py-3 rounded max-w-md mx-auto" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
            {error}
          </div>
          <button
            onClick={() => fetchPlaylists()}
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
        <h1 className="text-3xl font-bold" style={{color: 'rgb(198, 40, 40)'}}>Mis Playlists</h1>
        <div className="flex items-center gap-4">
          <p className="text-gray-600">
            {playlists.length} playlist{playlists.length !== 1 ? 's' : ''}
          </p>
          <a
            href="/create-playlist"
            className="inline-flex items-center px-4 py-2 rounded-lg text-white transition-colors hover:bg-red-700"
            style={{backgroundColor: 'rgb(198, 40, 40)'}}
          >
            <PlusIcon size={20} className="mr-2" />
            Nueva Playlist
          </a>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <PlaylistIcon size={96} color="rgb(156, 163, 175)" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No tienes playlists
          </h3>
          <p className="text-gray-500 mb-6">
            ¡Crea tu primera playlist para organizar tus películas favoritas!
          </p>
          <a
            href="/create-playlist"
            className="inline-flex items-center px-6 py-3 rounded-lg text-white transition-colors hover:bg-red-700"
            style={{backgroundColor: 'rgb(198, 40, 40)'}}
          >
            <PlusIcon size={20} className="mr-2" />
            Crear Playlist
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {playlists.map((playlist) => (
            <PlaylistCard 
              key={playlist.id} 
              playlist={playlist} 
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
