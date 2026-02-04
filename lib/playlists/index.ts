// Aquí irá la lógica relacionada con playlists
import type { SupabaseClient } from '@supabase/supabase-js';
import { getMoviesByIdsWithOptionalFavorites } from '../favorites';
import type { Playlist } from '../types';

/**
 * Crea una nueva playlist y retorna el registro insertado.
 */
export async function createPlaylist(supabase: SupabaseClient, playlistData: any): Promise<any> {
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
export async function getPlaylistById(supabase: SupabaseClient, playlistId: string): Promise<any> {
  const { data, error } = await supabase
    .from('playlists')
    .select('*')
    .eq('id', playlistId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtiene una playlist completa con perfil del creador y películas con favoritos
 */
export async function getPlaylistWithDetails(supabase: SupabaseClient, playlistId: string, currentUser?: any) {
  try {
    console.log('🎵 Fetching playlist with details:', playlistId);

    // Obtener datos de la playlist con el perfil del creador
    const { data: playlistData, error: playlistError } = await supabase
      .from('playlists')
      .select(`
        *,
        profiles:user_id (
          username
        )
      `)
      .eq('id', playlistId)
      .single();

    if (playlistError) {
      console.error('❌ Error fetching playlist:', playlistError);
      
      if (playlistError.code === 'PGRST116') {
        throw new Error('Playlist no encontrada');
      }
      
      if (playlistError.message.includes('row-level security') || 
          playlistError.message.includes('policy')) {
        throw new Error('No tienes permiso para ver esta playlist');
      }
      
      throw playlistError;
    }

    console.log('✅ Playlist fetched:', playlistData);
    
    // Verificar acceso a playlist privada
    if (!playlistData.is_public) {
      if (!currentUser) {
        throw new Error('Debes iniciar sesión para ver esta playlist privada');
      }
      if (currentUser.id !== playlistData.user_id) {
        throw new Error('No tienes permiso para ver esta playlist privada');
      }
    }

    // Obtener las películas de la playlist usando la tabla de unión
    const { data: playlistMovies, error: moviesError } = await supabase
      .from('playlist_movies')
      .select(`
        movie_id,
        movies (
          *,
          profiles:user_id (
            username
          )
        )
      `)
      .eq('playlist_id', playlistId)
      .order('created_at', { ascending: true });

    if (moviesError) {
      console.error('❌ Error fetching playlist movies:', moviesError);
      throw new Error('Error al cargar las películas de la playlist');
    }

    // Extraer solo los datos de las películas y agregar favoritos si hay usuario
    console.log('🔍 Raw playlistMovies data:', playlistMovies);
    
    let movies: any[] = [];
    if (playlistMovies && playlistMovies.length > 0) {
      // Extraer las películas del resultado del join
      movies = playlistMovies.map(pm => pm.movies).filter(movie => movie !== null && movie !== undefined);
      console.log('🎬 Extracted movies:', movies);
      
      if (movies.length > 0 && currentUser) {
        // Agregar información de favoritos
        const movieIds = movies.map((m: any) => m.id);
        const { data: favoritesData } = await getMoviesByIdsWithOptionalFavorites(supabase, movieIds);
        if (favoritesData) {
          movies = favoritesData;
        }
      }
    }

    console.log('✅ Final movies array:', movies);

    return {
      data: {
        playlist: playlistData,
        movies: movies,
        isOwner: currentUser?.id === playlistData.user_id
      },
      error: null
    };
  } catch (err: any) {
    console.error('💥 Error fetching playlist with details:', err);
    return {
      data: null,
      error: err.message || 'Error al cargar la playlist'
    };
  }
}

/**
 * Actualiza una playlist (comprueba propietario mediante user_id)
 */
export async function updatePlaylist(supabase: SupabaseClient, playlistId: string, userId: string, updateData: any): Promise<any> {
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
export async function deletePlaylist(supabase: SupabaseClient, playlistId: string, userId: string): Promise<{ success: boolean }> {
  const { error } = await supabase
    .from('playlists')
    .delete()
    .eq('id', playlistId)
    .eq('user_id', userId);

  if (error) throw error;
  return { success: true };
}

export async function getUserPlaylists(supabase: SupabaseClient, userId: string): Promise<Playlist[]> {
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

export async function addMovieToPlaylist(supabase: SupabaseClient, playlistId: string, movieId: string) {
  try {
    console.log(`🎵 Adding movie ${movieId} to playlist ${playlistId}`);

    // Verificar que la película no esté ya en la playlist
    const { data: existing } = await supabase
      .from('playlist_movies')
      .select('id')
      .eq('playlist_id', playlistId)
      .eq('movie_id', movieId)
      .single();

    if (existing) {
      return { success: false, error: 'La película ya está en esta playlist' };
    }

    // Agregar la película a la playlist
    const { error: insertError } = await supabase
      .from('playlist_movies')
      .insert([{
        playlist_id: playlistId,
        movie_id: movieId
      }]);

    if (insertError) {
      console.error('❌ Error adding movie to playlist:', insertError);
      return { success: false, error: insertError.message };
    }

    console.log('✅ Movie added to playlist successfully');
    return { success: true };
  } catch (error: any) {
    console.error('💥 Error adding movie to playlist:', error);
    return { success: false, error: error.message };
  }
}

export async function removeMovieFromPlaylist(supabase: SupabaseClient, playlistId: string, movieId: string) {
  try {
    console.log(`🎵 Removing movie ${movieId} from playlist ${playlistId}`);

    const { error: deleteError } = await supabase
      .from('playlist_movies')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('movie_id', movieId);

    if (deleteError) {
      console.error('❌ Error removing movie from playlist:', deleteError);
      return { success: false, error: deleteError.message };
    }

    console.log('✅ Movie removed from playlist successfully');
    return { success: true };
  } catch (error: any) {
    console.error('Error removing movie from playlist:', error);
    return { success: false, error: error.message };
  }
}

export async function getPlaylistsContainingMovie(supabase: SupabaseClient, movieId: string, userId: string): Promise<string[]> {
  try {
    // Usar la nueva tabla de unión para obtener playlists que contengan la película
    const { data, error } = await supabase
      .from('playlist_movies')
      .select(`
        playlist_id,
        playlists!inner (
          id,
          user_id
        )
      `)
      .eq('movie_id', movieId)
      .eq('playlists.user_id', userId);

    if (error) {
      console.error('Error fetching playlists containing movie:', error);
      return [];
    }

    return data?.map(item => item.playlist_id) || [];
  } catch (error) {
    console.error('Error in getPlaylistsContainingMovie:', error);
    return [];
  }
}
