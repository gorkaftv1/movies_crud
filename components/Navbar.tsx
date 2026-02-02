"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

interface Profile {
  username: string;
  avatar_url?: string;
}

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // Obtener usuario actual
    const getUser = async () => {
      try {
        console.log('🔍 Checking current user...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('❌ Error getting user:', error);
          if (isMounted) {
            setUser(null);
            setProfile(null);
            setLoading(false);
          }
          return;
        }

        console.log('👤 Current user:', user ? user.email : 'No user');
        
        if (isMounted) {
          setUser(user);
        }

        if (user && isMounted) {
          // Obtener perfil del usuario
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.warn('⚠️ Profile not found, user might need to complete registration');
          }

          setProfile(profile);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Unexpected error in getUser:', err);
        if (isMounted) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
      }
    };

    getUser();

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 Auth state changed:', event, session?.user ? session.user.email : 'No session');
        
        if (!isMounted) return;
        
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              console.warn('⚠️ Profile not found for user:', session.user.email);
            }

            if (isMounted) {
              setProfile(profile);
            }
          } catch (err) {
            console.error('❌ Error fetching profile:', err);
            if (isMounted) {
              setProfile(null);
            }
          }
        } else {
          if (isMounted) {
            setProfile(null);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error during logout:', error);
      } else {
        console.log('✅ Logout successful');
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error('❌ Unexpected error during logout:', err);
    }
  };

  if (loading) {
    return (
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">Movies CRUD</Link>
          <div>Cargando...</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-xl font-bold">Movies CRUD</Link>
          <Link 
            href="/movies"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Películas
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href="/movies"
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Ver Películas
              </Link>
              <Link 
                href="/add-movie"
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                Añadir Película
              </Link>
              <span className="text-gray-300">
                Hola, {profile?.username || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <Link 
                href="/login"
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
              >
                Iniciar sesión
              </Link>
              <Link 
                href="/register"
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
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