"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { uploadMoviePortrait } from "@/lib/utils";
import type { Movie } from "@/lib/types";

interface EditMovieFormProps {
  movieId: string;
}

interface MovieFormData {
  title: string;
  year: string;
  director: string;
  duration: string;
  score: string;
  short_desc: string;
  cast: string;
  genres: string;
  portrait_file: File | null;
}

export default function EditMovieForm({ movieId }: EditMovieFormProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingMovie, setFetchingMovie] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [originalMovie, setOriginalMovie] = useState<Movie | null>(null);
  
  const [formData, setFormData] = useState<MovieFormData>({
    title: "",
    year: "",
    director: "",
    duration: "",
    score: "",
    short_desc: "",
    cast: "",
    genres: "",
    portrait_file: null,
  });

  // Verificar autenticación
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Cargar datos de la película
  useEffect(() => {
    const fetchMovie = async () => {
      if (!movieId) return;

      try {
        setFetchingMovie(true);
        
        const { data: movie, error: fetchError } = await supabase
          .from('movies')
          .select('*')
          .eq('id', movieId)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        if (!movie) {
          throw new Error('Película no encontrada');
        }

        // Verificar que el usuario sea el dueño de la película
        if (user && movie.user_id !== user.id) {
          throw new Error('No tienes permiso para editar esta película');
        }

        setOriginalMovie(movie);
        
        // Cargar datos en el formulario
        setFormData({
          title: movie.title || "",
          year: movie.year ? String(movie.year) : "",
          director: movie.director || "",
          duration: movie.duration ? String(movie.duration) : "",
          score: movie.score ? String(movie.score) : "",
          short_desc: movie.short_desc || "",
          cast: movie.cast ? movie.cast.join(', ') : "",
          genres: movie.genres ? movie.genres.join(', ') : "",
          portrait_file: null,
        });

        // Cargar preview de la imagen si existe
        if (movie.portrait_url) {
          setImagePreview(movie.portrait_url);
        }

      } catch (err: any) {
        console.error('Error fetching movie:', err);
        setError(err.message || 'Error al cargar la película');
      } finally {
        setFetchingMovie(false);
      }
    };

    if (!authLoading && user) {
      fetchMovie();
    }
  }, [movieId, user, authLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      portrait_file: file
    }));

    // Crear preview de la imagen
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPortrait = async (file: File, movieId: string): Promise<string | null> => {
    const result = await uploadMoviePortrait(file, movieId);
    
    if (result.error) {
      setError(result.error);
      return null;
    }
    
    return result.url || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Validación básica
      if (!formData.title.trim()) {
        throw new Error("El título es obligatorio");
      }

      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      console.log('✏️ Updating movie:', movieId);

      // Preparar los datos para la actualización
      const movieData: any = {
        title: formData.title.trim(),
        short_desc: formData.short_desc.trim() || null,
        director: formData.director.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Convertir campos numéricos si están presentes
      if (formData.year) {
        const year = parseInt(formData.year);
        if (isNaN(year) || year < 1900 || year > 2030) {
          throw new Error("El año debe ser un número válido entre 1900 y 2030");
        }
        movieData.year = year;
      } else {
        movieData.year = null;
      }

      if (formData.duration) {
        const duration = parseInt(formData.duration);
        if (isNaN(duration) || duration <= 0) {
          throw new Error("La duración debe ser un número positivo (en minutos)");
        }
        movieData.duration = duration;
      } else {
        movieData.duration = null;
      }

      if (formData.score) {
        const score = parseFloat(formData.score);
        if (isNaN(score) || score < 0 || score > 10) {
          throw new Error("La puntuación debe ser un número entre 0 y 10");
        }
        movieData.score = score;
      } else {
        movieData.score = null;
      }

      // Procesar el reparto (cast) como array
      if (formData.cast.trim()) {
        movieData.cast = formData.cast
          .split(',')
          .map(actor => actor.trim())
          .filter(actor => actor.length > 0);
      } else {
        movieData.cast = [];
      }

      // Procesar los géneros como array
      if (formData.genres.trim()) {
        movieData.genres = formData.genres
          .split(',')
          .map(genre => genre.trim())
          .filter(genre => genre.length > 0);
      } else {
        movieData.genres = [];
      }

      // Actualizar la película en la base de datos
      // RLS se encarga de verificar que solo el dueño pueda actualizar
      const { error: updateError } = await supabase
        .from('movies')
        .update(movieData)
        .eq('id', movieId);

      if (updateError) {
        throw updateError;
      }

      // Subir la carátula si se proporcionó una nueva
      if (formData.portrait_file) {
        const portraitUrl = await uploadPortrait(formData.portrait_file, movieId);
        
        if (portraitUrl) {
          // Actualizar la película con la URL de la carátula
          const { error: updateError } = await supabase
            .from('movies')
            .update({ portrait_url: portraitUrl })
            .eq('id', movieId);

          if (updateError) {
            console.error('Error updating portrait URL:', updateError);
          }
        }
      }

      setSuccess(true);
      
      // Redirigir a la página de detalles después de 2 segundos
      setTimeout(() => {
        router.push(`/movies/${movieId}`);
      }, 2000);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la autenticación o se carga la película
  if (authLoading || fetchingMovie) {
    return (
      <div className="max-w-6xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Cargando película...</div>
        </div>
      </div>
    );
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!user) {
    return null;
  }

  // Si hay error cargando la película
  if (error && !originalMovie) {
    return (
      <div className="max-w-6xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 p-8 rounded-lg shadow-lg bg-white">
      <h2 className="text-3xl font-bold text-center mb-8" style={{color: 'rgb(198, 40, 40)'}}>Editar Película</h2>
      
      {error && (
        <div className="mb-6 p-4 rounded border" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 rounded border" style={{backgroundColor: 'rgba(46, 125, 50, 0.1)', borderColor: 'rgba(46, 125, 50, 0.2)', color: 'rgb(46, 125, 50)'}}>
          ¡Película actualizada exitosamente! Redirigiendo...
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Portada */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Carátula de la película
              </label>
              
              {/* Área de preview/upload */}
              <div 
                className="relative aspect-[2/3] rounded-lg border-2 border-dashed transition-colors overflow-hidden bg-gray-50"
                style={{borderColor: imagePreview ? 'rgb(198, 40, 40)' : '#d1d5db'}}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Vista previa"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm font-medium">Portada de película</p>
                    <p className="text-xs mt-1">JPG, PNG, GIF</p>
                  </div>
                )}
                
                {/* Botón de cambiar/añadir */}
                <label 
                  htmlFor="portrait"
                  className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-white text-sm font-medium rounded-lg shadow-lg cursor-pointer hover:bg-gray-50 transition-colors border border-gray-300"
                  style={{color: 'rgb(198, 40, 40)'}}
                >
                  {imagePreview ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </label>
                
                <input
                  type="file"
                  id="portrait"
                  name="portrait"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              
              <p className="text-xs text-gray-500 mt-2 text-center">
                Tamaño recomendado: 400x600px
              </p>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="lg:col-span-2 space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[rgb(198,40,40)] transition-colors"
                placeholder="Ej: El Padrino"
              />
            </div>

            {/* Año y Duración */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                  Año
                </label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1900"
                  max="2030"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(198,40,40)] transition-colors"
                  placeholder="2024"
                />
              </div>

              <div>
                <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(198,40,40)] transition-colors"
                  placeholder="120"
                />
              </div>
            </div>

            {/* Puntuación - Slider */}
            <div>
              <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-2">
                Puntuación: {formData.score ? parseFloat(formData.score).toFixed(1) : '0.0'} / 10
              </label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">0</span>
                <input
                  type="range"
                  id="score"
                  name="score"
                  value={formData.score}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  step="0.1"
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    accentColor: 'rgb(198, 40, 40)',
                  }}
                />
                <span className="text-sm text-gray-500">10</span>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>Mala</span>
                <span>Regular</span>
                <span>Buena</span>
                <span>Excelente</span>
              </div>
            </div>

            {/* Director */}
            <div>
              <label htmlFor="director" className="block text-sm font-medium text-gray-700 mb-2">
                Director
              </label>
              <input
                type="text"
                id="director"
                name="director"
                value={formData.director}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(198,40,40)] transition-colors"
                placeholder="Ej: Francis Ford Coppola"
              />
            </div>

            {/* Reparto */}
            <div>
              <label htmlFor="cast" className="block text-sm font-medium text-gray-700 mb-2">
                Reparto (separado por comas)
              </label>
              <input
                type="text"
                id="cast"
                name="cast"
                value={formData.cast}
                onChange={handleInputChange}
                placeholder="Actor 1, Actor 2, Actor 3..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(198,40,40)] transition-colors"
              />
            </div>

            {/* Géneros */}
            <div>
              <label htmlFor="genres" className="block text-sm font-medium text-gray-700 mb-2">
                Géneros (separados por comas)
              </label>
              <input
                type="text"
                id="genres"
                name="genres"
                value={formData.genres}
                onChange={handleInputChange}
                placeholder="Acción, Aventura, Fantasía..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(198,40,40)] transition-colors"
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="short_desc" className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                id="short_desc"
                name="short_desc"
                value={formData.short_desc}
                onChange={handleInputChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(198,40,40)] transition-colors resize-none"
                placeholder="Escribe una breve sinopsis de la película..."
              />
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
                style={{backgroundColor: 'rgb(198, 40, 40)'}}
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
              
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {/* Estilos para el slider */}
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(198, 40, 40);
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .slider-thumb::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 8px rgba(198, 40, 40, 0.1);
        }
        
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(198, 40, 40);
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        
        .slider-thumb::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 0 8px rgba(198, 40, 40, 0.1);
        }
      `}</style>
    </div>
  );
}
