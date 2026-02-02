import { supabase } from './client';

/**
 * Intenta hacer login con username o email
 */
export const signInWithUsernameOrEmail = async (
  identifier: string,
  password: string
) => {
  try {
    // Primero intentar login directo si parece un email
    if (identifier.includes('@')) {
      console.log('🔐 Attempting login with email:', identifier);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier,
        password,
      });
      
      return { data, error };
    }
    
    // Si no es email, buscar el email por username
    console.log('🔍 Looking up email for username:', identifier);
    
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        username
      `)
      .eq('username', identifier)
      .single();
    
    if (profileError || !profileData) {
      return {
        data: null,
        error: { message: 'Usuario no encontrado' }
      };
    }
    
    // Obtener el email del usuario desde auth.users
    // Como no podemos acceder directamente a auth.users, intentamos login con una función de Supabase
    
    // Alternativa: buscar por metadata en auth
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      // Si no tenemos permisos admin, usar RPC function
      const { data: userInfo, error: rpcError } = await supabase
        .rpc('get_user_by_username_or_email', { identifier });
      
      if (rpcError || !userInfo || userInfo.length === 0) {
        return {
          data: null,
          error: { message: 'Usuario no encontrado o error de autenticación' }
        };
      }
      
      // Hacer login con el email encontrado
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userInfo[0].email,
        password,
      });
      
      return { data, error };
    }
    
    // Si tenemos acceso a admin, buscar el usuario
    const user = users.users.find(u => u.user_metadata?.username === identifier);
    
    if (!user || !user.email) {
      return {
        data: null,
        error: { message: 'Usuario no encontrado' }
      };
    }
    
    console.log('📧 Found email for username:', user.email);
    
    // Hacer login con el email encontrado
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });
    
    return { data, error };
    
  } catch (error: any) {
    console.error('❌ Login error:', error);
    return {
      data: null,
      error: { message: error.message || 'Error de autenticación' }
    };
  }
};

/**
 * Verifica si un username está disponible
 */
export const isUsernameAvailable = async (username: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.trim())
      .single();
    
    // Si no encuentra resultados (error), el username está disponible
    return !!error && error.code === 'PGRST116';
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
};