// Aquí irá la lógica relacionada con usuarios (users)
import type { SupabaseClient } from '@supabase/supabase-js';
import type { UploadResult } from '../types';
import { uploadUserAvatar as _uploadUserAvatar, deleteUserAvatar as _deleteUserAvatar } from '@/lib/utils';

// Wrapper functions for utils that now require client
export const uploadUserAvatar = (supabase: SupabaseClient, file: File, userId: string) =>
  _uploadUserAvatar(supabase, file, userId);

export const deleteUserAvatar = (supabase: SupabaseClient, filePath: string) =>
  _deleteUserAvatar(supabase, filePath);

/**
 * Intenta hacer login con username o email
 */
export const signInWithUsernameOrEmail = async (
  supabase: SupabaseClient,
	identifier: string,
	password: string
) => {
	try {
		// Primero intentar login directo si parece un email
		if (identifier.includes('@')) {
			console.log('🔐 Attempting login with email:', identifier);
      
			const { data, error } = await supabase.auth.signInWithPassword({
				email: identifier,
				password,
			});
      
			return { data, error };
		}
    
		// Si no es email, buscar el email por username
		console.log('🔍 Looking up email for username:', identifier);
    
		const { data: profileData, error: profileError } = await supabase
			.from('profiles')
			.select(`
				id,
				username
			`)
			.eq('username', identifier)
			.single();
    
		if (profileError || !profileData) {
			return {
				data: null,
				error: { message: 'Usuario no encontrado' }
			};
		}
    
		// Obtener el email del usuario desde auth.users
		// Como no podemos acceder directamente a auth.users, intentamos login con una función de Supabase
    
		// Alternativa: buscar por metadata en auth
		const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
		if (usersError) {
			// Si no tenemos permisos admin, usar RPC function
			const { data: userInfo, error: rpcError } = await supabase
				.rpc('get_user_by_username_or_email', { identifier });
      
			if (rpcError || !userInfo || userInfo.length === 0) {
				return {
					data: null,
					error: { message: 'Usuario no encontrado o error de autenticación' }
				};
			}
      
			// Hacer login con el email encontrado
			const { data, error } = await supabase.auth.signInWithPassword({
				email: userInfo[0].email,
				password,
			});
      
			return { data, error };
		}
    
		// Si tenemos acceso a admin, buscar el usuario
		const user = users.users.find(u => u.user_metadata?.username === identifier);
    
		if (!user || !user.email) {
			return {
				data: null,
				error: { message: 'Usuario no encontrado' }
			};
		}
    
		console.log('📧 Found email for username:', user.email);
    
		// Hacer login con el email encontrado
		const { data, error } = await supabase.auth.signInWithPassword({
			email: user.email,
			password,
		});
    
		return { data, error };
    
	} catch (error: any) {
		console.error('❌ Login error:', error);
		return {
			data: null,
			error: { message: error.message || 'Error de autenticación' }
		};
	}
};

/**
 * Verifica si un username está disponible
 */
export const isUsernameAvailable = async (supabase: SupabaseClient, username: string): Promise<boolean> => {
	try {
		const { data, error } = await supabase
			.from('profiles')
			.select('username')
			.eq('username', username.trim())
			.single();
    
		// Si no encuentra resultados (error), el username está disponible
		return !!error && error.code === 'PGRST116';
	} catch (error) {
		console.error('Error checking username availability:', error);
		return false;
	}
};

/**
 * Actualiza la contraseña del usuario actual
 */
export const updatePassword = async (supabase: SupabaseClient, newPassword: string): Promise<{ error?: string }> => {
	try {
		const { error } = await supabase.auth.updateUser({
			password: newPassword
		});

		if (error) throw error;

		return {};
	} catch (error: any) {
		console.error('Error updating password:', error);
		return { error: error.message || 'Error al actualizar la contraseña' };
	}
};

/**
 * Actualiza el avatar del usuario actual
 */
export const updateUserAvatar = async (
  supabase: SupabaseClient,
	userId: string,
	file: File,
	currentAvatarPath?: string
): Promise<UploadResult> => {
	try {
		// Si hay un avatar anterior, eliminarlo
		if (currentAvatarPath) {
			await deleteUserAvatar(supabase, currentAvatarPath);
		}

		// Subir el nuevo avatar
		const uploadResult = await uploadUserAvatar(supabase, file, userId);
		
		if (uploadResult.error) {
			return uploadResult;
		}

		// Actualizar el perfil con la nueva URL
		const { error: updateError } = await supabase
			.from('profiles')
			.update({ avatar_url: uploadResult.url })
			.eq('id', userId);

		if (updateError) {
			throw updateError;
		}

		return uploadResult;
	} catch (error: any) {
		console.error('Error updating user avatar:', error);
		return { error: error.message || 'Error al actualizar el avatar' };
	}
};

/**
 * Elimina la cuenta del usuario actual
 * IMPORTANTE: Esta acción es irreversible
 * - Elimina las películas del usuario (que eliminará automáticamente favoritos y playlists por CASCADE)
 * - Elimina el perfil y la cuenta de autenticación
 */
export const deleteUserAccount = async (supabase: SupabaseClient, userId: string): Promise<{ error?: string }> => {
	try {
		// 1. Obtener todas las películas del usuario para contar
		const { data: userMovies, error: fetchError } = await supabase
			.from('movies')
			.select('id, title')
			.eq('user_id', userId);

		if (fetchError) {
			console.error('Error fetching user movies:', fetchError);
			throw new Error('Error al obtener las películas del usuario');
		}

		let movieCount = userMovies?.length || 0;

		// 2. Eliminar todas las películas del usuario (esto también eliminará automáticamente favoritos y referencias en playlists por CASCADE)
		if (movieCount > 0) {
			const { error: deleteMoviesError } = await supabase
				.from('movies')
				.delete()
				.eq('user_id', userId);

			if (deleteMoviesError) {
				console.error('Error deleting user movies:', deleteMoviesError);
				throw new Error('Error al eliminar las películas del usuario');
			}

			console.log(`🗑️ Deleted ${movieCount} movies and all their references`);
		}

		// 3. Eliminar el perfil (esto eliminará automáticamente favoritos y playlists restantes por CASCADE)
		const { error: profileError } = await supabase
			.from('profiles')
			.delete()
			.eq('id', userId);

		if (profileError) {
			console.error('Error deleting profile:', profileError);
			throw new Error('Error al eliminar el perfil');
		}

		console.log('🗑️ Profile deleted');

		// 4. Eliminar la cuenta de autenticación
		// Nota: esto requiere permisos de admin, así que puede fallar
		// En ese caso, el usuario solo se desvinculará y deberá ser eliminado manualmente
		try {
			const { error: authError } = await supabase.auth.admin.deleteUser(userId);
			if (authError) {
				console.warn('Could not delete auth user (requires admin permissions):', authError);
			} else {
				console.log('🗑️ Auth user deleted');
			}
		} catch (e) {
			console.warn('Auth deletion skipped (no admin permissions)');
		}

		// Cerrar sesión
		await supabase.auth.signOut();

		return {};
	} catch (error: any) {
		console.error('Error deleting user account:', error);
		return { error: error.message || 'Error al eliminar la cuenta' };
	}
};
