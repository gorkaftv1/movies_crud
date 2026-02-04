"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let email = identifier;
      if (!identifier.includes('@')) {
        const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_username', { p_username: identifier });
        if (rpcError) throw new Error('Error al buscar el usuario');
        if (!emailData) throw new Error('Usuario no encontrado');
        email = emailData;
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // El AuthContext se encargará de actualizar el estado y redirigir si es necesario
      console.log('✅ Login successful');
      router.push("/");
    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage("");
    try {
      if (!resetEmail || !resetEmail.includes('@')) throw new Error('Por favor ingresa un email válido');
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, { redirectTo: `${window.location.origin}/reset-password` });
      if (error) throw error;
      setResetMessage('✅ Te hemos enviado un correo con las instrucciones para resetear tu contraseña');
      setTimeout(() => { setShowResetModal(false); setResetEmail(""); setResetMessage(""); }, 3000);
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      setResetMessage(`❌ ${error.message}`);
    } finally { setResetLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'rgb(250 250 250)'}}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{color: 'rgb(198 40 40)'}}>Iniciar Sesión</h2>
          <p className="mt-2 text-gray-600">Accede a tu cuenta de Movies CRUD</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (<div className="rounded-md border p-4" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>{error}</div>)}
          <div className="space-y-4">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Email o nombre de usuario</label>
              <input id="identifier" type="text" placeholder="Ingresa tu email o username" value={identifier} onChange={e => setIdentifier(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 input-ring-red transition-colors" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input id="password" type="password" placeholder="Ingresa tu contraseña" value={password} onChange={e => setPassword(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 input-ring-red transition-colors" />
              <div className="text-right mt-1"><button type="button" onClick={() => setShowResetModal(true)} className="text-sm transition-colors hover:text-red-700" style={{color: 'rgb(198, 40, 40)'}}>¿Olvidaste tu contraseña?</button></div>
            </div>
          </div>
          <div><button type="submit" disabled={loading} className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-red-700" style={{backgroundColor: 'rgb(198, 40, 40)'}}>{loading ? "Iniciando sesión..." : "Iniciar Sesión"}</button></div>
          <div className="text-center"><p className="text-gray-600 text-sm">¿No tienes cuenta? <Link href="/register" className="font-medium transition-colors hover:text-red-700" style={{color: 'rgb(198, 40, 40)'}}>Regístrate aquí</Link></p></div>
        </form>

        {showResetModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold" style={{color: 'rgb(198, 40, 40)'}}>Resetear Contraseña</h3>
                <button onClick={() => { setShowResetModal(false); setResetEmail(""); setResetMessage(""); }} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
              </div>
              <p className="text-gray-600 text-sm mb-4">Ingresa tu email y te enviaremos un enlace para resetear tu contraseña.</p>
              {resetMessage && (<div className={`mb-4 p-3 rounded border text-sm ${resetMessage.includes('✅') ? 'bg-green-100 border-green-200 text-green-800' : 'bg-red-100 border-red-200 text-red-800'}`}>{resetMessage}</div>)}
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input id="resetEmail" type="email" placeholder="tu@email.com" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 input-ring-red transition-colors" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowResetModal(false); setResetEmail(""); setResetMessage(""); }} className="flex-1 px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
                  <button type="submit" disabled={resetLoading} className="flex-1 px-4 py-2 rounded text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed" style={{backgroundColor: 'rgb(198, 40, 40)'}}>{resetLoading ? 'Enviando...' : 'Enviar enlace'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}