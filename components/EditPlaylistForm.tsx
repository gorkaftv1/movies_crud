"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { getPlaylistById, updatePlaylist } from "@/lib/playlists";
import type { AddPlaylistFormData } from "@/lib/types";
import PlaylistForm from "@/components/PlaylistForm";

interface EditPlaylistFormProps {
  playlistId: string;
}

export default function EditPlaylistForm({ playlistId }: EditPlaylistFormProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<AddPlaylistFormData>({
    name: "",
    description: "",
    isPublic: false,
  });

  // Verificar autenticación y cargar datos de la playlist
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else {
        loadPlaylist();
      }
    }
  }, [user, authLoading, playlistId]);

  const loadPlaylist = async () => {
    try {
      setLoadingPlaylist(true);
      setError("");

      console.log('🎵 Loading playlist:', playlistId);

      const playlist = await getPlaylistById(playlistId);

      if (!playlist) {
        throw new Error('Playlist no encontrada');
      }

      // Verificar que el usuario sea el propietario
      if (playlist.user_id !== user?.id) {
        throw new Error('No tienes permisos para editar esta playlist');
      }

      console.log('✅ Playlist loaded:', playlist);

      // Cargar datos en el formulario
      setFormData({
        name: playlist.title,
        description: playlist.description || "",
        isPublic: playlist.is_public,
      });

    } catch (err: any) {
      console.error('💥 Error loading playlist:', err);
      setError(err.message || 'Error al cargar la playlist');
    } finally {
      setLoadingPlaylist(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validación básica
      if (!formData.name.trim()) {
        throw new Error("El nombre es obligatorio");
      }

      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      console.log('🎬 Updating playlist:', playlistId);

      // Preparar los datos para actualizar
      const updateData = {
        title: formData.name.trim(),
        description: formData.description.trim() || null,
        is_public: formData.isPublic,
      };

      console.log('📝 Update data:', updateData);

      // Actualizar la playlist en la base de datos
      const updated = await updatePlaylist(playlistId, user.id, updateData);
      console.log('✅ Playlist updated successfully:', updated);
      setSuccess(true);

      // Redirigir a la lista de playlists después de unos segundos
      setTimeout(() => {
        router.push('/playlists');
      }, 1500);

    } catch (error: any) {
      console.error('💥 Error updating playlist:', error);
      setError(error.message || 'Error al actualizar la playlist');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación o se carga la playlist
  if (authLoading || loadingPlaylist) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">
            {authLoading ? 'Verificando autenticación...' : 'Cargando playlist...'}
          </div>
        </div>
      </div>
    );
  }

  // Si no hay usuario o hay error de permisos, mostrar error
  if (!user || (error && error.includes('permisos'))) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mb-4 p-4 rounded border" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
            {error || 'No tienes acceso a esta página'}
          </div>
          <button
            onClick={() => router.push('/playlists')}
            className="px-4 py-2 rounded text-white transition-colors hover:bg-red-700"
            style={{backgroundColor: 'rgb(198, 40, 40)'}}
          >
            Volver a Mis Playlists
          </button>
        </div>
      </div>
    );
  }

  return (
    <PlaylistForm
      formData={formData}
      onChange={handleInputChange}
      onSubmit={handleSubmit}
      loading={loading}
      error={error && !error.includes('permisos') ? error : undefined}
      success={success}
      submitLabel={loading ? 'Actualizando...' : 'Actualizar Playlist'}
      showCancel
      onCancel={() => router.push('/playlists')}
    />
  );
}
