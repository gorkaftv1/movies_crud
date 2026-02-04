"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { user, session, loading: authLoading } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    // Verificar que hay una sesión de recuperación válida
    const checkSession = async () => {
      if (authLoading) return; // Wait for auth to initialize
      
      try {
        if (!session || !user) {
          console.error('No valid recovery session');
          setError('Enlace de recuperación inválido o expirado');
          setValidating(false);
          return;
        }

        console.log('✅ Valid recovery session found');
        setValidating(false);
      } catch (err) {
        console.error('Error checking session:', err);
        setError('Error al verificar la sesión');
        setValidating(false);
      }
    };

    checkSession();
  }, [session, user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validaciones
      if (!newPassword || newPassword.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      if (newPassword !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden');
      }

      console.log('🔐 Updating password...');

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      console.log('✅ Password updated successfully');
      setSuccess(true);

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        router.push('/login');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'rgb(250 250 250)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: 'rgb(198, 40, 40)'}}></div>
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (error && !newPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{backgroundColor: 'rgb(250 250 250)'}}>
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'rgb(198, 40, 40)'}}>
              Enlace Inválido
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 rounded text-white transition-colors hover:bg-red-700"
              style={{backgroundColor: 'rgb(198, 40, 40)'}}
            >
              Volver al Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{backgroundColor: 'rgb(250 250 250)'}}>
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-green-600 text-5xl mb-4">✓</div>
            <h2 className="text-2xl font-bold mb-4" style={{color: 'rgb(198, 40, 40)'}}>
              ¡Contraseña Actualizada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido actualizada exitosamente. Redirigiendo al login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'rgb(250 250 250)'}}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{color: 'rgb(198 40 40)'}}>Nueva Contraseña</h2>
          <p className="mt-2 text-gray-600">Ingresa tu nueva contraseña</p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="rounded-md border p-4" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                id="newPassword"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 input-ring-red transition-colors" 
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 input-ring-red transition-colors" 
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-red-700"
              style={{backgroundColor: 'rgb(198, 40, 40)'}}
            >
              {loading ? "Actualizando..." : "Actualizar Contraseña"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
