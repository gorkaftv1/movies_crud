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
  const [initialized, setInitialized] = useState(false);

  // Función para cargar perfil
  const loadProfile = async (userId: string) => {
    try {
      console.log('🔍 Loading profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
      
      if (error && error.code === 'PGRST116') {
        // No existe perfil, crear uno básico
        console.log('📝 Creating basic profile for user');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([{ id: userId }])
          .select('username, avatar_url')
          .single();
          
        if (createError) {
          console.error('❌ Error creating profile:', createError);
          setProfile(null);
        } else {
          console.log('✅ Profile created:', newProfile);
          setProfile(newProfile);
        }
      } else if (error) {
        console.error('❌ Profile load error:', error);
        setProfile(null);
      } else {
        console.log('👤 Profile loaded:', data);
        setProfile(data || null);
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      setProfile(null);
    }
  };

  // Función simplificada para establecer sesión
  const setAuthState = async (newUser: User | null, newSession: Session | null) => {
    console.log('🔄 Setting auth state for user:', newUser?.id);
    setUser(newUser);
    setSession(newSession);
    
    if (newUser) {
      await loadProfile(newUser.id);
      console.log('✅ Auth state updated with profile');
    } else {
      setProfile(null);
      console.log('✅ Auth state cleared');
    }
  };

  useEffect(() => {
    let mounted = true;

    // Inicializar sesión al montar
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
        }
        
        if (mounted) {
          if (initialSession?.user) {
            console.log('✅ Found existing session for user:', initialSession.user.id);
            await setAuthState(initialSession.user, initialSession);
          } else {
            console.log('❌ No existing session found');
            setUser(null);
            setSession(null);
            setProfile(null);
          }
          setInitialized(true);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
          setInitialized(true);
          setLoading(false);
        }
      }
    };

    // Listen for explicit profile-updated events (dispatched after profile upsert)
    const onProfileUpdated = async (e: Event) => {
      try {
        const evt = e as CustomEvent;
        const userId = evt?.detail?.userId;
        if (mounted && userId && user?.id === userId) {
          console.log('🔄 Profile updated event received, reloading profile');
          await loadProfile(userId);
        }
      } catch (err) {
        console.error('Error handling profile update:', err);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('profile-updated', onProfileUpdated as EventListener);
      // Comentado temporalmente para debugging
      // document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔐 Auth event:', event, 'initialized:', initialized, 'currentUser:', user?.id, 'newUser:', newSession?.user?.id);
        
        if (!mounted) return;

        if (event === 'INITIAL_SESSION') {
          // Skip - ya manejado en initializeAuth
          return;
        }

        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
          setSession(null);
          setProfile(null);
          return; // Procesar SIGNED_OUT siempre
        }

        if (event === 'SIGNED_IN') {
          console.log('✅ User signed in');
          console.log('🔍 Sign-in details - newUser:', newSession?.user?.id, 'currentUser:', user?.id);
          
          if (newSession?.user) {
            if (newSession.user.id !== user?.id) {
              console.log('👤 New user detected, updating state');
              await setAuthState(newSession.user, newSession);
            } else {
              console.log('🔄 Same user sign-in, updating session only');
              setSession(newSession);
              // También recargar el perfil en caso de que haya cambiado
              await loadProfile(newSession.user.id);
            }
          } else {
            console.warn('⚠️ SIGNED_IN event without user data');
          }
          return; // Procesar SIGNED_IN siempre para actualizar la navbar
        }

        // Solo procesar otros eventos si ya estamos inicializados
        if (!initialized) {
          console.log('⏭️ Skipping auth event during initialization:', event);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
          if (newSession?.user?.id === user?.id) {
            setSession(newSession);
            setUser(newSession?.user ?? null);
          }
        }
      }
    );

    // Inicializar auth
    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('profile-updated', onProfileUpdated as EventListener);
        // document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, []); // Dependencias vacías para ejecutar solo al montar

  return (
    <AuthContext.Provider value={{ user, profile, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
