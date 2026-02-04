"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

export default function Navbar() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    
    try {
      console.log('🚪 Logging out...');
      await supabase.auth.signOut();
      console.log('✅ Logout successful');
    } catch (err) {
      console.error('❌ Error during logout:', err);
    } finally {
      setLoggingOut(false);
      // Redirigir después de limpiar el estado
      router.push("/");
    }
  };

  if (loading) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto flex justify-between items-center px-6 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">Movies CRUD</Link>
          <div className="text-gray-600">Cargando...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold hover:opacity-80 transition-opacity" style={{color: 'rgb(198 40 40)'}}>
            Movies
          </Link>
          <Link 
            href="/movies"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Películas
          </Link>
          <Link 
            href="/playlists"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Listas de reproducción
          </Link>
          <Link 
            href="/favorites"
            className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            Favoritos
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href="/add-movie"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{backgroundColor: 'rgb(198 40 40)'}}
              >
                Añadir Película
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-gray-600 text-sm hover:text-gray-900 transition-colors"
              >
                {profile?.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.username || 'Avatar'} 
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                    <span className="text-xs font-medium text-gray-600">
                      {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span>Hola, {profile?.username || user.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors bg-gray-100 border border-gray-300 text-gray-900 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loggingOut ? 'Cerrando sesión...' : 'Cerrar sesión'}
              </button>
            </>
          ) : (
            <div className="flex gap-3">
              <Link 
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium transition-colors border hover:bg-gray-50"
                style={{color: 'rgb(198 40 40)', borderColor: 'rgb(198 40 40)'}}
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/register"
                className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                style={{backgroundColor: 'rgb(198 40 40)'}}
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}