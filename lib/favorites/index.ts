import type { SupabaseClient } from '@supabase/supabase-js';
import type { Favorite, MovieWithFavorite } from '../types';

/**
 * Toggle favorito de una película (añadir o quitar)
 */
export async function toggleFavorite(supabase: SupabaseClient, movieId: string): Promise<{ success: boolean; isFavorited: boolean; error?: string }> {
	try {
		const { data, error } = await supabase.rpc('toggle_favorite', {
			movie_uuid: movieId
		});

		if (error) {
			throw error;
		}

		return {
			success: true,
			isFavorited: data // La función devuelve true si se añadió, false si se quitó
		};
	} catch (error: any) {
		console.error('Error toggling favorite:', error);
		return {
			success: false,
			isFavorited: false,
			error: error.message
		};
	}
}

/**
 * Obtener todas las películas favoritas del usuario actual
 */
export async function getUserFavorites(supabase: SupabaseClient): Promise<{ data: Favorite[] | null; error: string | null }> {
	try {
		const { data, error } = await supabase.rpc('get_user_favorites');

		if (error) {
			throw error;
		}

		return {
			data: data || [],
			error: null
		};
	} catch (error: any) {
		console.error('Error getting user favorites:', error);
		return {
			data: null,
			error: error.message
		};
	}
}

/**
 * Verificar si una película específica está en favoritos
 */
export async function isMovieFavorited(supabase: SupabaseClient, movieId: string): Promise<{ isFavorited: boolean; error?: string }> {
	try {
		const { data: { user } } = await supabase.auth.getUser();
    
		if (!user) {
			return { isFavorited: false };
		}

		const { data, error } = await supabase
			.from('user_favorites')
			.select('id')
			.eq('user_id', user.id)
			.eq('movie_id', movieId)
			.maybeSingle();

		if (error) {
			throw error;
		}

		return {
			isFavorited: !!data
		};
	} catch (error: any) {
		console.error('Error checking if movie is favorited:', error);
		return {
			isFavorited: false,
			error: error.message
		};
	}
}

/**
 * Obtener películas con información de si están en favoritos
 */
export async function getMoviesWithFavorites(supabase: SupabaseClient): Promise<{ data: MovieWithFavorite[] | null; error: string | null }> {
	try {
		// Obtener usuario actual para condicionar la inclusión de favoritos
		const { data: { user } } = await supabase.auth.getUser();

		let query;
		if (user) {
			// Incluir una relación left para saber si el usuario tiene esta película en favoritos
			query = supabase
				.from('movies')
				.select(`
					*,
					profiles:user_id ( username ),
					user_favorites!left(user_id)
				`)
				.order('title');
		} else {
			query = supabase
				.from('movies')
				.select(`
					*,
					profiles:user_id ( username )
				`)
				.order('title');
		}

		const { data, error } = await query;

		if (error) {
			throw error;
		}

		const moviesWithFavorites: MovieWithFavorite[] = (data || []).map((movie: any) => ({
			id: movie.id,
			title: movie.title,
			year: movie.year,
			director: movie.director,
			portrait_url: movie.portrait_url,
			score: movie.score,
			cast: movie.cast,
			duration: movie.duration,
			short_desc: movie.short_desc,
			user_id: movie.user_id,
			profiles: movie.profiles,
			is_favorited: user ? (movie.user_favorites && movie.user_favorites.length > 0) : false
		}));

		console.log('Fetched movies:', moviesWithFavorites.length);

		return {
			data: moviesWithFavorites,
			error: null
		};
	} catch (error: any) {
		console.error('Error getting movies with favorites:', error);
		return {
			data: null,
			error: error.message
		};
	}
}

/**
 * Obtener todas las películas sin requerir autenticación, pero con información de favoritos si el usuario está autenticado
 */
export async function getAllMoviesWithOptionalFavorites(supabase: SupabaseClient): Promise<{ data: any[] | null; error: string | null }> {
	try {
		// Verificar si hay usuario autenticado
		const { data: { user } } = await supabase.auth.getUser();
    
		let query;
		if (user) {
			// Si hay usuario, incluir información de favoritos
			query = supabase
				.from('movies')
				.select(`
					*,
					profiles:user_id (
						username
					),
					is_favorited:user_favorites!left(user_id)
				`)
				.order('title');
		} else {
			// Si no hay usuario, solo obtener películas básicas
			query = supabase
				.from('movies')
				.select(`
					*,
					profiles:user_id (
						username
					)
				`)
				.order('title');
		}

		const { data, error } = await query;

		if (error) {
			throw error;
		}

		// Procesar los datos para normalizar la información de favoritos
		const processedData = (data || []).map(movie => ({
			...movie,
			is_favorited: user ? (movie.is_favorited && movie.is_favorited.length > 0) : false
		}));

		return {
			data: processedData,
			error: null
		};
	} catch (error: any) {
		console.error('Error getting all movies with optional favorites:', error);
		return {
			data: null,
			error: error.message
		};
	}
}

/**
 * Obtener películas por IDs, incluyendo información de favoritos si el usuario está autenticado
 */
export async function getMoviesByIdsWithOptionalFavorites(supabase: SupabaseClient, movieIds: string[]): Promise<{ data: any[] | null; error: string | null }> {
	try {
		const { data: { user } } = await supabase.auth.getUser();

		let query;
		if (user) {
			query = supabase
				.from('movies')
				.select(`
					*,
					profiles:user_id (
						username
					),
					user_favorites!left(user_id)
				`)
				.in('id', movieIds)
				.order('title');
		} else {
			query = supabase
				.from('movies')
				.select(`
					*,
					profiles:user_id (
						username
					)
				`)
				.in('id', movieIds)
				.order('title');
		}

		const { data, error } = await query;

		if (error) throw error;

		const processed = (data || []).map(movie => ({
			...movie,
			is_favorited: user ? (movie.user_favorites && movie.user_favorites.length > 0) : false
		}));

		return { data: processed, error: null };
	} catch (error: any) {
		console.error('Error getting movies by ids with favorites:', error);
		return { data: null, error: error.message };
	}
}
