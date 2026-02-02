"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log('🔐 Attempting login for:', email);
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center">Iniciar Sesión</h2>
      
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border p-2 rounded"
      />
      
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        className="border p-2 rounded"
      />
      
      <button 
        type="submit" 
        disabled={loading} 
        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Iniciando..." : "Iniciar sesión"}
      </button>
      
      {error && <div className="text-red-600 text-sm">{error}</div>}
    </form>
  );
}