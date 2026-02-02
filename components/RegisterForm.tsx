"use client";
import { useState } from "react";
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
      // 1. Registrar usuario
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // 2. Crear perfil del usuario
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            { id: data.user.id, username }
          ]);

        if (profileError) throw profileError;
      }

      setMessage("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.");
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-sm mx-auto mt-10">
      <h2 className="text-2xl font-bold text-center">Registro</h2>
      
      <input
        type="text"
        placeholder="Nombre de usuario"
        value={username}
        onChange={e => setUsername(e.target.value)}
        required
        className="border p-2 rounded"
      />
      
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
        minLength={6}
        className="border p-2 rounded"
      />
      
      <button 
        type="submit" 
        disabled={loading} 
        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? "Registrando..." : "Registrarse"}
      </button>
      
      {error && <div className="text-red-600 text-sm">{error}</div>}
      {message && <div className="text-green-600 text-sm">{message}</div>}
    </form>
  );
}