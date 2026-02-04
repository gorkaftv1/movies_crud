'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar perfil
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is OK for new users
        throw error;
      }
      
      console.log('👤 Profile loaded:', data);
      setProfile(data || null);
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    let mounted = true;
    let isInitialized = false;

    // Listen for explicit profile-updated events (dispatched after profile upsert)
    const onProfileUpdated = async (e: Event) => {
      try {
        const evt = e as CustomEvent;
        const userId = evt?.detail?.userId;
        if (mounted && userId) {
          console.log('🔄 profile-updated event received, reloading profile for', userId);
          await loadProfile(userId);
        }
      } catch (err) {
        // ignore
      }
    };

    // Handle visibility change to refresh session when coming back from background
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isInitialized && user) {
        console.log('👀 Page became visible, checking session validity');
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user?.id === user.id) {
            console.log('✅ Session still valid for same user');
          }
        } catch (error) {
          console.error('Error checking session on visibility change:', error);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('profile-updated', onProfileUpdated as EventListener);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Escuchar cambios de autenticación (incluyendo sesión inicial)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔐 Auth event:', event, 'isInitialized:', isInitialized, 'currentUser:', user?.id, 'newUser:', newSession?.user?.id);
        
        if (!mounted) return;

        // Manejar todos los eventos de autenticación de manera consistente
        if (event === 'INITIAL_SESSION') {
          console.log('🚀 Processing initial session');
          // Evitar procesamiento duplicado en React StrictMode
          if (newSession?.user && !user) {
            setUser(newSession.user);
            setSession(newSession);
            await loadProfile(newSession.user.id);
            isInitialized = true;
            console.log('✅ Initial session processed, user set:', newSession.user.id);
          } else if (newSession?.user && user?.id === newSession.user.id) {
            console.log('⏭️ Skipping duplicate INITIAL_SESSION for same user');
            isInitialized = true;
          } else if (!newSession?.user) {
            console.log('❌ No user in initial session');
          }
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
          setProfile(null);
          setSession(null);
          setLoading(false);
          isInitialized = false;
          return;
        }

        if (event === 'SIGNED_IN') {
          const newUserId = newSession?.user?.id;
          const currentUserId = user?.id;

          console.log('🔍 SIGNED_IN analysis:', {
            isInitialized,
            newUserId,
            currentUserId,
            sameUser: newUserId === currentUserId,
            hasCurrentUser: !!currentUserId
          });

          // Si ya se procesó INITIAL_SESSION y es el mismo usuario, es revalidación
          if (isInitialized && newUserId === currentUserId) {
            console.log('🔄 Session revalidation for same user');
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }
          // Si no hay usuario actual pero ya se inicializó, probablemente es una nueva ventana con sesión existente
          else if (isInitialized && !currentUserId && newUserId) {
            console.log('🪟 Session restoration in new window');
            setUser(newSession.user);
            setSession(newSession);
            await loadProfile(newUserId);
          }
          // Login completamente nuevo (no se había inicializado o usuario diferente)
          else if (newUserId && (!isInitialized || newUserId !== currentUserId)) {
            console.log('✅ New user login detected');
            setUser(newSession.user);
            setSession(newSession);
            await loadProfile(newUserId);
            isInitialized = true;
          }
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed for user:', newSession?.user?.id);
          // Solo actualizar sesión y user, mantener perfil si es el mismo usuario
          if (newSession?.user?.id === user?.id) {
            console.log('🔄 Token refreshed for same user');
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('profile-updated', onProfileUpdated as EventListener);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [user?.id]); // Dependencia del user.id para detectar cambios

  return (
    <AuthContext.Provider value={{ user, profile, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
