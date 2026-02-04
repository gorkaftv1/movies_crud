"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { uploadUserAvatar } from "@/lib/users";
import { UserIcon } from "@/components/Icons";

export default function RegisterPage() {
  const router = useRouter();
  const { supabase } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!username.trim()) throw new Error("El nombre de usuario es obligatorio");
      if (username.length < 3) throw new Error("El nombre de usuario debe tener al menos 3 caracteres");
      if (!/^[a-zA-Z0-9_]+$/.test(username)) throw new Error("El nombre de usuario solo puede contener letras, números y guiones bajos");

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } }
      });

      if (error) throw error;

      let avatarUrl = null;
      if (avatarFile && data.user) {
        const uploadResult = await uploadUserAvatar(supabase, avatarFile, data.user.id);
        console.log('avatar uploadResult', uploadResult);
        if (uploadResult.url) avatarUrl = uploadResult.url;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({ id: data.user.id, username: username.trim(), avatar_url: avatarUrl }, { onConflict: 'id' });

        if (!profileError) {
          try { window.dispatchEvent(new CustomEvent('profile-updated', { detail: { userId: data.user.id } })); } catch(e){}
        }
      }

      if (data.session) {
        console.log('✅ Registration successful with session');
        router.push("/movies");
        return;
      }

      setMessage("¡Registro exitoso! Revisa tu correo electrónico para confirmar tu cuenta antes de poder acceder.");
      setEmail(""); setPassword(""); setUsername(""); setAvatarFile(null); setAvatarPreview(null);
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
          {error && (<div className="rounded-md border p-4" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>{error}</div>)}
          {message && (<div className="rounded-md border p-4" style={{backgroundColor: 'rgba(46, 125, 50, 0.1)', borderColor: 'rgba(46, 125, 50, 0.2)', color: 'rgb(46, 125, 50)'}}>{message}</div>)}
          <div className="space-y-4">
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto de perfil (opcional)</label>
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
                  {avatarPreview ? (<img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />) : (<UserIcon size={40} color="rgb(156, 163, 175)" />)}
                </div>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              </div>
              <p className="text-xs text-gray-500 mt-1 text-center">Haz clic para seleccionar una imagen. Máximo 2MB.</p>
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Nombre de usuario</label>
              <input id="username" type="text" placeholder="Elige tu nombre de usuario" value={username} onChange={e => setUsername(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 input-ring-red transition-colors" />
              <p className="text-xs text-gray-500 mt-1">Solo letras, números y guiones bajos. Mínimo 3 caracteres.</p>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input id="email" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 input-ring-red transition-colors" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input id="password" type="password" placeholder="Crea una contraseña segura" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 input-ring-red transition-colors" />
            </div>
          </div>
          <div>
            <button type="submit" disabled={loading} className="w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 hover:bg-red-700" style={{backgroundColor: 'rgb(198, 40, 40)'}}>{loading ? "Creando cuenta..." : "Crear Cuenta"}</button>
          </div>
          <div className="text-center"><p className="text-gray-600 text-sm">¿Ya tienes cuenta? <Link href="/login" className="font-medium transition-colors hover:text-red-700" style={{color: 'rgb(198, 40, 40)'}}>Inicia sesión aquí</Link></p></div>
        </form>
      </div>
    </div>
  );
}