// Aquí irá la lógica relacionada con playlists
import { supabase } from '../supabase/client';
import type { Playlist } from '../types';

/**
 * Crea una nueva playlist y retorna el registro insertado.
 */
export async function createPlaylist(playlistData: any): Promise<any> {
  const { data, error } = await supabase
    .from('playlists')
    .insert([playlistData])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtiene una playlist por su id
 */
export async function getPlaylistById(playlistId: string): Promise<any> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Actualiza una playlist (comprueba propietario mediante user_id)
 */
export async function updatePlaylist(playlistId: string, userId: string, updateData: any): Promise<any> {
  const { data, error } = await supabase
    .from('playlists')
    .update(updateData)
    .eq('id', playlistId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Elimina una playlist si pertenece al usuario
 */
export async function deletePlaylist(playlistId: string, userId: string): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId)
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
}

export async function getUserPlaylists(userId: string): Promise<Playlist[]> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user playlists:', error);
    return [];
  }

  return data || [];
}

export async function addMovieToPlaylist(playlistId: string, movieId: string) {
  try {
    // Obtener la playlist actual
    const { data: playlist, error: fetchError } = await supabase
      .from('playlists')
      .select('movies')
      .eq('id', playlistId)
      .single();

    if (fetchError) {
      console.error('Error fetching playlist:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Verificar si la película ya está en la playlist
    const currentMovies = playlist.movies || [];
    if (currentMovies.includes(movieId)) {
      return { success: false, error: 'La película ya está en esta playlist' };
    }

    // Agregar la película al array
    const updatedMovies = [...currentMovies, movieId];

    // Actualizar la playlist
    const { error: updateError } = await supabase
      .from('playlists')
      .update({ 
        movies: updatedMovies,
        updated_at: new Date().toISOString()
      })
      .eq('id', playlistId);

    if (updateError) {
      console.error('Error updating playlist:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error adding movie to playlist:', error);
    return { success: false, error: error.message };
  }
}

export async function removeMovieFromPlaylist(playlistId: string, movieId: string) {
  try {
    // Obtener la playlist actual
    const { data: playlist, error: fetchError } = await supabase
      .from('playlists')
      .select('movies')
      .eq('id', playlistId)
      .single();

    if (fetchError) {
      console.error('Error fetching playlist:', fetchError);
      return { success: false, error: fetchError.message };
    }

    // Remover la película del array
    const currentMovies = playlist.movies || [];
    const updatedMovies = currentMovies.filter((id: string) => id !== movieId);

    // Actualizar la playlist
    const { error: updateError } = await supabase
      .from('playlists')
      .update({ 
        movies: updatedMovies,
        updated_at: new Date().toISOString()
      })
      .eq('id', playlistId);

    if (updateError) {
      console.error('Error updating playlist:', updateError);
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error removing movie from playlist:', error);
    return { success: false, error: error.message };
  }
}

export async function getPlaylistsContainingMovie(movieId: string, userId: string): Promise<string[]> {
  // Usar el operador @> de PostgreSQL para buscar en arrays
  const { data, error } = await supabase
    .from('playlists')
    .select('id')
    .eq('user_id', userId)
    .contains('movies', [movieId]);

  if (error) {
    console.error('Error fetching playlists containing movie:', error);
    return [];
  }

  return data?.map(item => item.id) || [];
}
