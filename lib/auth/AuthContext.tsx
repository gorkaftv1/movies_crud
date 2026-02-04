'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  supabase: SupabaseClient;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  supabase: {} as SupabaseClient,
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
  
  // Crear cliente Supabase con soporte para cookies
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  
  // Refs para mantener valores actualizados en callbacks
  const userRef = useRef<User | null>(null);
  const initializedRef = useRef<boolean>(false);
  
  // Mantener refs sincronizadas
  userRef.current = user;
  initializedRef.current = initialized;

  // Función para cargar perfil
  const loadProfile = async (userId: string) => {
    try {
      console.log('🔍 Loading profile for user:', userId);
      console.log('  - User ID type:', typeof userId);
      console.log('  - User ID length:', userId?.length);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', userId)
        .single();
      
      console.log('📊 Profile query result:');
      console.log('  - Data:', data);
      console.log('  - Error:', error);
      
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
          console.error('  - Error details:', JSON.stringify(createError, null, 2));
          setProfile(null);
        } else {
          console.log('✅ Profile created successfully:', newProfile);
          setProfile(newProfile);
        }
      } else if (error) {
        console.error('❌ Profile load error:', error);
        console.error('  - Error code:', error.code);
        console.error('  - Error message:', error.message);
        console.error('  - Error details:', JSON.stringify(error, null, 2));
        setProfile(null);
      } else {
        console.log('👤 Profile loaded successfully:', data);
        console.log('  - Username:', data?.username || '[NULL]');
        console.log('  - Avatar URL:', data?.avatar_url || '[NULL]');
        setProfile(data || null);
      }
    } catch (error) {
      console.error('💥 Unexpected error loading profile:', error);
      console.error('  - Error type:', typeof error);
      console.error('  - Error details:', JSON.stringify(error, null, 2));
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
        if (mounted && userId && userRef.current?.id === userId) {
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
        console.log('🔐 Auth event:', event, 'initialized:', initializedRef.current, 'currentUser:', userRef.current?.id, 'newUser:', newSession?.user?.id);
        
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
          console.log('🔍 SIGNED_IN Event Details:');
          console.log('  - Current User ID:', userRef.current?.id);
          console.log('  - New Session User ID:', newSession?.user?.id);
          console.log('  - Full User Object:', JSON.stringify(newSession?.user, null, 2));
          console.log('  - Session Details:', {
            access_token: newSession?.access_token ? '[EXISTS]' : '[MISSING]',
            refresh_token: newSession?.refresh_token ? '[EXISTS]' : '[MISSING]',
            expires_at: newSession?.expires_at,
            expires_in: newSession?.expires_in
          });
          console.log('  - Current Auth State:', {
            hasUser: !!userRef.current,
            hasProfile: !!profile,
            hasSession: !!session,
            isInitialized: initializedRef.current
          });
          
          if (newSession?.user) {
            if (newSession.user.id !== userRef.current?.id) {
              console.log('👤 New user detected, updating state');
              console.log('  - Previous User:', userRef.current?.id || 'none');
              console.log('  - New User:', newSession.user.id);
              await setAuthState(newSession.user, newSession);
            } else {
              console.log('🔄 Same user sign-in, updating session only');
              console.log('  - User ID:', newSession.user.id);
              console.log('  - User Email:', newSession.user.email);
              console.log('  - Email Confirmed:', newSession.user.email_confirmed_at ? 'Yes' : 'No');
              setSession(newSession);
              // También recargar el perfil en caso de que haya cambiado
              await loadProfile(newSession.user.id);
            }
          } else {
            console.warn('⚠️ SIGNED_IN event without user data');
            console.warn('  - Session object:', newSession);
          }
          return; // Procesar SIGNED_IN siempre para actualizar la navbar
        }

        // Solo procesar otros eventos si ya estamos inicializados
        if (!initializedRef.current) {
          console.log('⏭️ Skipping auth event during initialization:', event);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
          if (newSession?.user?.id === userRef.current?.id) {
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
    <AuthContext.Provider value={{ user, profile, session, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}
