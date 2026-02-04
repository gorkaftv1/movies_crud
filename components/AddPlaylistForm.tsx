"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { createPlaylist } from "@/lib/playlists";
import type { AddPlaylistFormData } from "@/lib/types";
import PlaylistForm from "@/components/PlaylistForm";

export default function AddPlaylistForm() {
  const router = useRouter();
  const { user, loading: authLoading, supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState<AddPlaylistFormData>({
    name: "",
    description: "",
    isPublic: false,
  });

  // Verificar autenticación al montar el componente
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev: AddPlaylistFormData) => ({
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

      console.log('🎬 Creating playlist for user:', user.email);

      // Preparar los datos para la base de datos
      const playlistData: any = {
        title: formData.name.trim(),
        description: formData.description.trim() || null,
        user_id: user.id,
        is_public: formData.isPublic
      };

      console.log('📝 Playlist data:', playlistData);

      // Insertar la playlist en la base de datos
      if (!supabase) throw new Error('Supabase client no disponible');
      const playlist = await createPlaylist(supabase, playlistData);
      console.log('✅ Playlist created successfully:', playlist);
      setSuccess(true);
      
      // Limpiar el formulario
      setFormData({
        name: "",
        description: "",
        isPublic: false,
      });

      // Opcional: redirigir después de unos segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }

    router.push('/playlists');
  };

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Verificando autenticación...</div>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!user) {
    return null;
  }

  return (
    <PlaylistForm
      formData={formData}
      onChange={handleInputChange}
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      success={success}
      submitLabel={loading ? 'Añadiendo playlist...' : 'Añadir Playlist'}
    />
  );
}