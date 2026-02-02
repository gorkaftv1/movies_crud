"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState(""); // Email o username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let email = identifier;
      
      // Si no contiene @, asumimos que es un username
      if (!identifier.includes('@')) {
        console.log('🔍 Looking up email for username:', identifier);
        
        // Buscar el perfil por username para obtener el ID
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', identifier)
          .single();
        
        if (profileError || !profileData) {
          throw new Error('Usuario no encontrado');
        }
        
        // Ahora buscar el email en auth.users usando una consulta administrativa
        // Como no podemos acceder a auth.users directamente, usaremos el user_id
        // y haremos que el usuario use su email para login
        throw new Error('Por favor, usa tu email para iniciar sesión');
      }
      
      console.log('🔐 Attempting login with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('✅ Login successful:', data.user?.email);
      
      // Esperar un poco para que el estado se actualice
      setTimeout(() => {
        router.push("/"); // Redirigir al inicio después del login
        router.refresh();
      }, 100);
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'rgb(250 250 250)'}}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{color: 'rgb(198 40 40)'}}>Iniciar Sesión</h2>
          <p className="mt-2 text-gray-600">Accede a tu cuenta de Movies CRUD</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md border p-4" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">
                Email o nombre de usuario
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="Ingresa tu email o username"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors" 
                style={{'--tw-ring-color': 'rgba(198, 40, 40, 0.1)', '--tw-ring-offset-shadow': '0 0 0 2px rgba(198, 40, 40, 0.1)'}} 
                onFocus={(e) => e.target.style.borderColor = 'rgb(198, 40, 40)'}
                onBlur={(e) => e.target.style.borderColor = 'rgb(224, 224, 224)'}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors" 
                style={{'--tw-ring-color': 'rgba(198, 40, 40, 0.1)', '--tw-ring-offset-shadow': '0 0 0 2px rgba(198, 40, 40, 0.1)'}} 
                onFocus={(e) => e.target.style.borderColor = 'rgb(198, 40, 40)'}
                onBlur={(e) => e.target.style.borderColor = 'rgb(224, 224, 224)'}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 hover:bg-red-700"
              style={{backgroundColor: 'rgb(198, 40, 40)'}}
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              ¿No tienes cuenta?{" "}
              <Link href="/register" className="font-medium transition-colors hover:text-red-700" style={{color: 'rgb(198, 40, 40)'}}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}