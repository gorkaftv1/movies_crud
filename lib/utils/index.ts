import type { SupabaseClient } from '@supabase/supabase-js';
import type { UploadResult } from '../types';

/**
 * Sube un archivo al bucket de retratos de Supabase
 */
export const uploadMoviePortrait = async (
  supabase: SupabaseClient,
  file: File,
  movieId: string
): Promise<UploadResult> => {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();

    // Validar tipo de archivo
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      return { error: 'Tipo de archivo no permitido. Use JPG, PNG, GIF o WebP.' };
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return { error: 'El archivo es demasiado grande. Máximo 5MB.' };
    }

    const fileName = `movie_${movieId}_${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Subir el archivo
    const { data, error: uploadError } = await supabase.storage
      .from('portraits')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('portraits')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
    };
  } catch (error: any) {
    console.error('Error uploading file:', error);
    return { error: error.message || 'Error desconocido al subir el archivo' };
  }
};

/**
 * Elimina un archivo del bucket de retratos
 */
export const deleteMoviePortrait = async (supabase: SupabaseClient, filePath: string): Promise<{ error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from('portraits')
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return {};
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return { error: error.message || 'Error al eliminar el archivo' };
  }
};

/**
 * Sube un archivo de avatar de usuario
 */
export const uploadUserAvatar = async (
  supabase: SupabaseClient,
  file: File, 
  userId: string
): Promise<UploadResult> => {
  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    // Validar tipo de archivo
    const allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!fileExt || !allowedTypes.includes(fileExt)) {
      return { error: 'Tipo de archivo no permitido. Use JPG, PNG, GIF o WebP.' };
    }

    // Validar tamaño (2MB máximo para avatars)
    const maxSize = 2 * 1024 * 1024; // 2MB en bytes
    if (file.size > maxSize) {
      return { error: 'El archivo es demasiado grande. Máximo 2MB para avatars.' };
    }

    const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Subir el archivo
    const { data, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath
    };
  } catch (error: any) {
    console.error('Error uploading avatar:', error);
    return { error: error.message || 'Error desconocido al subir el avatar' };
  }
};

/**
 * Elimina un avatar de usuario
 */
export const deleteUserAvatar = async (supabase: SupabaseClient, filePath: string): Promise<{ error?: string }> => {
  try {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      throw error;
    }

    return {};
  } catch (error: any) {
    console.error('Error deleting avatar:', error);
    return { error: error.message || 'Error al eliminar el avatar' };
  }
};