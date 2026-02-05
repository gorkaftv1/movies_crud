// lib/auth/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '../../lib/types';

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
  const profileRef = useRef<Profile | null>(null);
  
  // Mantener refs sincronizadas
  userRef.current = user;
  initializedRef.current = initialized;
  profileRef.current = profile;

  // Función para cargar perfil
  const loadProfile = async (userId: string) => {
    try {
      console.log('🔍 Loading profile for user:', userId);
      
      const maxAttempts = 3;
      const backoffBase = 500;

      const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

      let finalData: Profile | null = null;
      let finalError: any = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(`⏱️ Attempt ${attempt}/${maxAttempts}: fetching profile`);
          
          const { data, error } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('id', userId)
            .maybeSingle();

          if (userRef.current?.id !== userId) {
            console.log('⏭️ Aborting profile set: user changed during fetch');
            return;
          }

          if (error) {
            console.error('❌ Profile load error:', error);
            finalError = error;
            if (attempt < maxAttempts) {
              const backoff = backoffBase * Math.pow(2, attempt - 1);
              console.log(`↻ Retrying after ${backoff}ms`);
              await sleep(backoff);
              continue;
            }
            break;
          }

          if (!data) {
            console.log('📝 No profile found — creating basic profile');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([{ id: userId }])
              .select('username, avatar_url')
              .single();

            if (userRef.current?.id !== userId) {
              console.log('⏭️ Aborting profile creation: user changed');
              return;
            }

            if (createError) {
              console.error('❌ Error creating profile:', createError);
              finalError = createError;
              if (attempt < maxAttempts) {
                const backoff = backoffBase * Math.pow(2, attempt - 1);
                console.log(`↻ Retrying after ${backoff}ms`);
                await sleep(backoff);
                continue;
              }
              break;
            } else {
              finalData = newProfile;
              break;
            }
          } else {
            finalData = data;
            break;
          }
        } catch (err) {
          console.error('💥 Unexpected error during profile fetch:', err);
          finalError = err;
          if (attempt < maxAttempts) {
            const backoff = backoffBase * Math.pow(2, attempt - 1);
            console.log(`↻ Retrying after ${backoff}ms`);
            await sleep(backoff);
            continue;
          }
          break;
        }
      }

      if (finalData) {
        console.log('👤 Profile loaded successfully:', finalData);
        setProfile(finalData);
        profileRef.current = finalData;
        return;
      }

      if (profileRef.current) {
        console.warn('⚠️ Profile fetch failed — keeping existing profile');
        return;
      }

      console.error('❌ Profile fetch failed after retries:', finalError);
      setProfile(null);
      profileRef.current = null;
    } catch (error) {
      console.error('💥 Unexpected error loading profile:', error);
      setProfile(null);
    }
  };

  // Función para refrescar sesión cuando las cookies no están sincronizadas
  const refreshSessionWithRetry = async (maxRetries = 3, delayMs = 500): Promise<Session | null> => {
    console.log('🔄 Attempting to refresh session with retry...');
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`  Attempt ${attempt}/${maxRetries}`);
        
        const { data, error } = await supabase.auth.refreshSession();
        
        if (error) {
          console.warn(`  ⚠️ Refresh attempt ${attempt} failed:`, error.message);
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
            continue;
          }
          return null;
        }

        if (data.session?.user) {
          console.log('  ✅ Session refreshed successfully:', data.session.user.id);
          return data.session;
        }

        console.warn(`  ⚠️ Refresh returned no session, retrying...`);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      } catch (err) {
        console.error(`  💥 Unexpected error on attempt ${attempt}:`, err);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
        }
      }
    }
    
    console.error('❌ Failed to refresh session after all retries');
    return null;
  };

  // Función simplificada para establecer sesión
  const setAuthState = async (newUser: User | null, newSession: Session | null) => {
    console.log('🔄 Setting auth state for user:', newUser?.id);
    setUser(newUser);
    setSession(newSession);

    if (newUser) {
      setLoading(true);
      try {
        await loadProfile(newUser.id);
        console.log('✅ Auth state updated with profile');
      } finally {
        setLoading(false);
      }
    } else {
      setProfile(null);
      setLoading(false);
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
            setLoading(false);
          }
          setInitialized(true);
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

    // Listen for profile updates
    const onProfileUpdated = async (e: Event) => {
      try {
        const evt = e as CustomEvent;
        const userId = evt?.detail?.userId;
        if (mounted && userId && userRef.current?.id === userId) {
          console.log('🔄 Profile updated event received');
          await loadProfile(userId);
        }
      } catch (err) {
        console.error('Error handling profile update:', err);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('profile-updated', onProfileUpdated as EventListener);
    }

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('🔐 Auth event:', event, 'newUser:', newSession?.user?.id || 'null', 'initialized:', initializedRef.current);
        
        if (!mounted) return;

        if (event === 'INITIAL_SESSION') {
          // Skip - ya manejado en initializeAuth
          console.log('⏭️ Skipping INITIAL_SESSION - handled by initializeAuth');
          return;
        }

        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setUser(null);
          setSession(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN') {
          if (!initializedRef.current) {
            console.log('⏭️ Skipping SIGNED_IN during initialization');
            return;
          }

          console.log('✅ SIGNED_IN event received (post-initialization)');
          
          if (newSession?.user) {
            console.log('  ✓ Session has user:', newSession.user.id);
            if (newSession.user.id !== userRef.current?.id) {
              console.log('  → New user detected, updating state');
              await setAuthState(newSession.user, newSession);
            } else {
              console.log('  → Same user, only updating session (skip profile reload)');
              setSession(newSession);
              setUser(newSession.user);
              setLoading(false);
            }
          } else {
            console.warn('⚠️ SIGNED_IN event but newSession.user is null — attempting session refresh');
            
            const refreshedSession = await refreshSessionWithRetry();
            
            if (refreshedSession?.user) {
              console.log('✅ Session recovered after refresh:', refreshedSession.user.id);
              await setAuthState(refreshedSession.user, refreshedSession);
            } else {
              console.error('❌ Could not recover session after SIGNED_IN event');
              setLoading(false);
            }
          }
          return;
        }

        // Solo procesar otros eventos si ya estamos inicializados
        if (!initializedRef.current) {
          console.log('⏭️ Skipping event during initialization:', event);
          return;
        }
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
          if (newSession && newSession.user?.id === userRef.current?.id) {
            setSession(newSession);
            setUser(newSession.user);
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
      }
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}