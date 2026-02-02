"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Validaciones básicas
      if (!username.trim()) {
        throw new Error("El nombre de usuario es obligatorio");
      }
      
      if (username.length < 3) {
        throw new Error("El nombre de usuario debe tener al menos 3 caracteres");
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error("El nombre de usuario solo puede contener letras, números y guiones bajos");
      }

      // Verificar si el username ya existe
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.trim())
        .single();

      if (existingProfile) {
        throw new Error("Este nombre de usuario ya está en uso");
      }

      console.log('🔐 Registering user with username:', username);

      // 1. Registrar usuario con metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim()
          }
        }
      });

      if (error) throw error;

      console.log('✅ User registered successfully');

      setMessage("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.");
      
      // Limpiar formulario
      setEmail("");
      setPassword("");
      setUsername("");
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'rgb(250 250 250)'}}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{color: 'rgb(198 40 40)'}}>Crear Cuenta</h2>
          <p className="mt-2 text-gray-600">Únete a la comunidad de Movies CRUD</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-md border p-4" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
              {error}
            </div>
          )}
          
          {message && (
            <div className="rounded-md border p-4" style={{backgroundColor: 'rgba(46, 125, 50, 0.1)', borderColor: 'rgba(46, 125, 50, 0.2)', color: 'rgb(46, 125, 50)'}}>
              {message}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario
              </label>
              <input
                id="username"
                type="text"
                placeholder="Elige tu nombre de usuario"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors" 
                style={{'--tw-ring-color': 'rgba(198, 40, 40, 0.1)'}} 
                onFocus={(e) => e.target.style.borderColor = 'rgb(198, 40, 40)'}
                onBlur={(e) => e.target.style.borderColor = 'rgb(224, 224, 224)'}
              />
              <p className="text-xs text-gray-500 mt-1">
                Solo letras, números y guiones bajos. Mínimo 3 caracteres.
              </p>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors" 
                style={{'--tw-ring-color': 'rgba(198, 40, 40, 0.1)'}} 
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
                placeholder="Crea una contraseña segura"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-transparent transition-colors" 
                style={{'--tw-ring-color': 'rgba(198, 40, 40, 0.1)'}} 
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
              {loading ? "Creando cuenta..." : "Crear Cuenta"}
            </button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="font-medium transition-colors hover:text-red-700" style={{color: 'rgb(198, 40, 40)'}}>
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}