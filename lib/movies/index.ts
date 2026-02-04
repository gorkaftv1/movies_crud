import { supabase } from '../supabase/client';
import type { Movie } from '../types';

/**
 * Obtiene todas las películas con el perfil del creador.
 * (Nota: Para favoritos usamos la función de /lib/favorites)
 */
export const getAllMovies = async () => {
  const { data, error } = await supabase
    .from('movies')
    .select(`
      *,
      profiles:user_id (
        username,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching movies:', error);
    throw error;
  }
  return data;
};

/**
 * Crea una película vinculada al usuario actual.
 */
export const createMovie = async (movieData: Partial<Movie>) => {
  const { data, error } = await supabase
    .from('movies')
    .insert([movieData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Actualiza una película existente por su ID.
 */
export const updateMovie = async (id: string, updates: Partial<Movie>) => {
  const { data, error } = await supabase
    .from('movies')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating movie:', error);
    throw error;
  }
  return data;
};

/**
 * Elimina una película de la base de datos y todas sus referencias.
 * Incluye: favoritos, playlists que la contengan, y imagen del storage.
 */
export const deleteMovie = async (id: string, userId: string) => {
  try {
    // 1. Primero obtener datos de la película para verificar ownership y obtener portrait_url
    const { data: movie, error: movieError } = await supabase
      .from('movies')
      .select('user_id, portrait_url')
      .eq('id', id)
      .single();

    if (movieError) {
      console.error('Error fetching movie:', movieError);
      throw new Error('Película no encontrada');
    }

    // 2. Verificar que el usuario sea el propietario
    if (movie.user_id !== userId) {
      throw new Error('No tienes permisos para eliminar esta película');
    }

    console.log('🗑️ Deleting movie and all references:', id);

    // 3. Eliminar de favoritos (automático con ON DELETE CASCADE en DB)
    // Esto se maneja automáticamente por las foreign keys

    // 4. Eliminar de playlists que la contengan
    // Obtener playlists que contienen esta película
    const { data: playlistsWithMovie, error: playlistError } = await supabase
      .from('playlists')
      .select('id, movies')
      .contains('movies', [id]);

    if (!playlistError && playlistsWithMovie) {
      for (const playlist of playlistsWithMovie) {
        const updatedMovies = (playlist.movies || []).filter((movieId: string) => movieId !== id);
        await supabase
          .from('playlists')
          .update({ movies: updatedMovies })
          .eq('id', playlist.id);
      }
      console.log(`🗑️ Removed movie from ${playlistsWithMovie.length} playlists`);
    }

    // 5. Eliminar imagen del storage si existe
    if (movie.portrait_url) {
      // Extraer path de la URL
      const urlParts = movie.portrait_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `portraits/${fileName}`;
      
      const { error: storageError } = await supabase.storage
        .from('portraits')
        .remove([filePath]);

      if (storageError) {
        console.warn('⚠️ Error deleting portrait:', storageError);
      } else {
        console.log('🗑️ Portrait deleted from storage');
      }
    }

    // 6. Finalmente eliminar la película
    const { error: deleteError } = await supabase
      .from('movies')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Double-check ownership

    if (deleteError) {
      console.error('Error deleting movie:', deleteError);
      throw deleteError;
    }

    console.log('✅ Movie and all references deleted successfully');
    return { success: true };

  } catch (error: any) {
    console.error('💥 Error in deleteMovie:', error);
    return { success: false, error: error.message };
  }
};