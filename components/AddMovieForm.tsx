"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { uploadMoviePortrait } from "@/lib/supabase/storage";
import type { User } from "@supabase/supabase-js";

interface AddMovieFormData {
  title: string;
  year: string;
  director: string;
  duration: string;
  score: string;
  short_desc: string;
  cast: string;
  portrait_file: File | null;
}

export default function AddMovieForm() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<AddMovieFormData>({
    title: "",
    year: "",
    director: "",
    duration: "",
    score: "",
    short_desc: "",
    cast: "",
    portrait_file: null,
  });

  // Verificar autenticación al montar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        
        if (!user) {
          router.push('/login');
          return;
        }
        
        setUser(user);
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/login');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/login');
        } else if (session?.user) {
          setUser(session.user);
          setAuthLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

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
    } else {
      setImagePreview(null);
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

      // Preparar los datos para la base de datos
      const movieData: any = {
        title: formData.title.trim(),
        short_desc: formData.short_desc.trim() || null,
        director: formData.director.trim() || null,
      };

      // Convertir campos numéricos si están presentes
      if (formData.year) {
        const year = parseInt(formData.year);
        if (isNaN(year) || year < 1900 || year > 2030) {
          throw new Error("El año debe ser un número válido entre 1900 y 2030");
        }
        movieData.year = year;
      }

      if (formData.duration) {
        const duration = parseInt(formData.duration);
        if (isNaN(duration) || duration <= 0) {
          throw new Error("La duración debe ser un número positivo (en minutos)");
        }
        movieData.duration = duration;
      }

      if (formData.score) {
        const score = parseFloat(formData.score);
        if (isNaN(score) || score < 0 || score > 10) {
          throw new Error("La puntuación debe ser un número entre 0 y 10");
        }
        movieData.score = score;
      }

      // Procesar el reparto (cast) como array
      if (formData.cast.trim()) {
        movieData.cast = formData.cast
          .split(',')
          .map(actor => actor.trim())
          .filter(actor => actor.length > 0);
      }

      // Insertar la película en la base de datos
      const { data: movie, error: insertError } = await supabase
        .from('movies')
        .insert([movieData])
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Subir la carátula si se proporcionó
      if (formData.portrait_file && movie) {
        const portraitUrl = await uploadPortrait(formData.portrait_file, movie.id);
        
        if (portraitUrl) {
          // Actualizar la película con la URL de la carátula
          const { error: updateError } = await supabase
            .from('movies')
            .update({ portrait_url: portraitUrl })
            .eq('id', movie.id);

          if (updateError) {
            console.error('Error updating portrait URL:', updateError);
          }
        }
      }

      setSuccess(true);
      
      // Limpiar el formulario
      setFormData({
        title: "",
        year: "",
        director: "",
        duration: "",
        score: "",
        short_desc: "",
        cast: "",
        portrait_file: null,
      });

      // Reset file input
      const fileInput = document.getElementById('portrait') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      setImagePreview(null);

      // Opcional: redirigir después de unos segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Añadir Nueva Película</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          ¡Película añadida exitosamente!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Duración (min)
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              min="1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="score" className="block text-sm font-medium text-gray-700 mb-1">
              Puntuación (0-10)
            </label>
            <input
              type="number"
              id="score"
              name="score"
              value={formData.score}
              onChange={handleInputChange}
              min="0"
              max="10"
              step="0.1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label htmlFor="director" className="block text-sm font-medium text-gray-700 mb-1">
            Director
          </label>
          <input
            type="text"
            id="director"
            name="director"
            value={formData.director}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="cast" className="block text-sm font-medium text-gray-700 mb-1">
            Reparto (separado por comas)
          </label>
          <input
            type="text"
            id="cast"
            name="cast"
            value={formData.cast}
            onChange={handleInputChange}
            placeholder="Actor 1, Actor 2, Actor 3..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="short_desc" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            id="short_desc"
            name="short_desc"
            value={formData.short_desc}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="portrait" className="block text-sm font-medium text-gray-700 mb-1">
            Carátula de la película
          </label>
          <input
            type="file"
            id="portrait"
            name="portrait"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-1">
            Formatos permitidos: JPG, PNG, GIF. Tamaño máximo recomendado: 5MB
          </p>
          
          {/* Vista previa de la imagen */}
          {imagePreview && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
              <div className="flex justify-center">
                <img
                  src={imagePreview}
                  alt="Vista previa de la carátula"
                  className="max-w-48 max-h-64 object-cover rounded-lg border border-gray-300 shadow-sm"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Añadiendo película..." : "Añadir Película"}
        </button>
      </form>
    </div>
  );
}