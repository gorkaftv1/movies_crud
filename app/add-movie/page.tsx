'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AddMovieForm from "@/components/AddMovieForm";
import { supabase } from "@/lib/supabase/client";

export default function AddMoviePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [emailVerified, setEmailVerified] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }

      // Verificar si el email está confirmado
      if (!session.user.email_confirmed_at) {
        setEmailVerified(false);
        setLoading(false);
        return;
      }

      setEmailVerified(true);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(198,40,40)]"></div>
        </div>
      </div>
    );
  }

  if (!emailVerified) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-zinc-900 rounded-lg p-8 border border-zinc-800">
            <div className="text-center">
              <div className="mb-6">
                <svg className="mx-auto h-16 w-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Email no verificado
              </h2>
              <p className="text-gray-400 mb-6">
                Para poder añadir películas necesitas verificar tu correo electrónico. 
                Revisa tu bandeja de entrada y haz clic en el enlace de confirmación que te hemos enviado.
              </p>
              <div className="bg-zinc-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-300">
                  💡 <strong>Consejo:</strong> Si no encuentras el correo, revisa tu carpeta de spam o correo no deseado.
                </p>
              </div>
              <button
                onClick={() => router.push('/movies')}
                className="px-6 py-2 bg-[rgb(198,40,40)] text-white rounded-lg hover:bg-[rgb(178,35,35)] transition-colors"
              >
                Volver a películas
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AddMovieForm />
    </div>
  );
}