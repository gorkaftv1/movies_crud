'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";
import { createPlaylist } from "../../lib/playlists";
import type { AddPlaylistFormData } from "../../lib/types";
import PlaylistForm from "./PlaylistForm";


export default function CreatePlaylistClient() {
  const router = useRouter();
  const { user, supabase } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<AddPlaylistFormData>({
    name: "",
    description: "",
    isPublic: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!formData.name.trim()) throw new Error("El nombre es obligatorio");
      if (!user) throw new Error("Usuario no autenticado");
      if (!supabase) throw new Error("Supabase client no disponible");

      const playlistData: any = {
        title: formData.name.trim(),
        description: formData.description.trim() || null,
        user_id: user.id,
        is_public: formData.isPublic
      };

      await createPlaylist(supabase, playlistData);
      setSuccess(true);
      setFormData({ name: "", description: "", isPublic: false });
      setTimeout(() => setSuccess(false), 3000);
      router.push('/playlists');
    } catch (err: any) {
      setError(err.message || "Error creando playlist");
    } finally {
      setLoading(false);
    }
  };

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