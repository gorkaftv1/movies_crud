"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth/AuthContext";
import { supabase } from "../../lib/supabase/client";
import { updatePassword, updateUserAvatar, deleteUserAccount } from "../../lib/users";
import { UserIcon, SpinnerIcon } from "../../components/global/Icons";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  
  // Estados para cambio de contraseña
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  
  // Estados para cambio de avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [avatarSuccess, setAvatarSuccess] = useState("");
  
  // Estados para eliminación de cuenta
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Redirigir si no hay usuario autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Cargar preview del avatar cuando el perfil cambia
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    setPasswordLoading(true);
    const result = await updatePassword(supabase,newPassword);
    setPasswordLoading(false);

    if (result.error) {
      setPasswordError(result.error);
    } else {
      setPasswordSuccess("¡Contraseña actualizada correctamente!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!avatarFile || !user) return;

    setAvatarError("");
    setAvatarSuccess("");
    setAvatarLoading(true);

    // Extraer path del avatar actual si existe
    let currentAvatarPath: string | undefined;
    if (profile?.avatar_url) {
      const urlParts = profile.avatar_url.split('/avatars/');
      if (urlParts.length > 1) {
        currentAvatarPath = urlParts[1].split('?')[0];
      }
    }

    const result = await updateUserAvatar(supabase, user.id, avatarFile, currentAvatarPath);
    setAvatarLoading(false);

    if (result.error) {
      setAvatarError(result.error);
    } else {
      setAvatarSuccess("¡Avatar actualizado correctamente!");
      setAvatarFile(null);
      // Recargar la página para obtener el nuevo avatar
      window.location.reload();
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "ELIMINAR") {
      setDeleteError("Debes escribir 'ELIMINAR' para confirmar");
      return;
    }

    if (!user) return;

    setDeleteError("");
    setDeleteLoading(true);

    const result = await deleteUserAccount(supabase, user.id);

    if (result.error) {
      setDeleteLoading(false);
      setDeleteError(result.error);
    } else {
      // La función ya cierra sesión, solo redirigir
      router.push('/');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'rgb(250 250 250)'}}>
        <SpinnerIcon size={48} color="rgb(198, 40, 40)" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{backgroundColor: 'rgb(250 250 250)'}}>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Encabezado */}
        <div className="text-center">
          <h1 className="text-3xl font-bold" style={{color: 'rgb(198 40 40)'}}>Mi Perfil</h1>
          <p className="mt-2 text-gray-600">Gestiona tu cuenta y preferencias</p>
        </div>

        {/* Información del perfil */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full overflow-hidden" style={{backgroundColor: 'rgb(248 248 248)'}}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon size={40} color="rgb(156, 163, 175)" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">@{profile?.username}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Cambiar Avatar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4" style={{color: 'rgb(198 40 40)'}}>Cambiar Avatar</h2>
          
          {avatarError && (
            <div className="mb-4 rounded-md border p-4" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
              {avatarError}
            </div>
          )}
          
          {avatarSuccess && (
            <div className="mb-4 rounded-md border p-4" style={{backgroundColor: 'rgba(46, 125, 50, 0.1)', borderColor: 'rgba(46, 125, 50, 0.2)', color: 'rgb(46, 125, 50)'}}>
              {avatarSuccess}
            </div>
          )}

          <form onSubmit={handleAvatarUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nuevo Avatar
              </label>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24 rounded-full overflow-hidden" style={{backgroundColor: 'rgb(248 248 248)'}}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserIcon size={48} color="rgb(156, 163, 175)" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white file:cursor-pointer hover:file:opacity-90"
                  style={{
                    '--file-bg': 'rgb(198 40 40)'
                  } as React.CSSProperties}
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!avatarFile || avatarLoading}
              className="w-full py-2 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{backgroundColor: 'rgb(198 40 40)'}}
            >
              {avatarLoading ? 'Actualizando...' : 'Actualizar Avatar'}
            </button>
          </form>
        </div>

        {/* Cambiar Contraseña */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4" style={{color: 'rgb(198 40 40)'}}>Cambiar Contraseña</h2>
          
          {passwordError && (
            <div className="mb-4 rounded-md border p-4" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
              {passwordError}
            </div>
          )}
          
          {passwordSuccess && (
            <div className="mb-4 rounded-md border p-4" style={{backgroundColor: 'rgba(46, 125, 50, 0.1)', borderColor: 'rgba(46, 125, 50, 0.2)', color: 'rgb(46, 125, 50)'}}>
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Nueva Contraseña
              </label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{'--focus-ring-color': 'rgb(198 40 40)'} as React.CSSProperties}
                placeholder="Mínimo 6 caracteres"
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{'--focus-ring-color': 'rgb(198 40 40)'} as React.CSSProperties}
                placeholder="Repite la nueva contraseña"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{backgroundColor: 'rgb(198 40 40)'}}
            >
              {passwordLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>

        {/* Zona de Peligro - Eliminar Cuenta */}
        <div className="bg-white rounded-lg shadow p-6 border-2" style={{borderColor: 'rgb(220, 38, 38)'}}>
          <h2 className="text-xl font-bold mb-2" style={{color: 'rgb(220, 38, 38)'}}>⚠️ Zona de Peligro</h2>
          <p className="text-gray-600 mb-4">
            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, está seguro.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{backgroundColor: 'rgb(220, 38, 38)'}}
            >
              Eliminar Mi Cuenta
            </button>
          ) : (
            <div className="space-y-4 border-t pt-4" style={{borderColor: 'rgb(220, 38, 38)'}}>
              <div className="rounded-lg p-4" style={{backgroundColor: 'rgba(220, 38, 38, 0.1)'}}>
                <h3 className="font-bold mb-2" style={{color: 'rgb(220, 38, 38)'}}>
                  ⚠️ ADVERTENCIA: Esta acción es IRREVERSIBLE
                </h3>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Se eliminarán todas tus playlists</li>
                  <li>Se eliminarán todos tus favoritos</li>
                  <li>Tus películas pasarán a ser del usuario ../..usuario_eliminado</li>
                  <li>No podrás recuperar tu cuenta</li>
                </ul>
              </div>

              {deleteError && (
                <div className="rounded-md border p-4" style={{backgroundColor: 'rgba(220, 38, 38, 0.1)', borderColor: 'rgba(220, 38, 38, 0.2)', color: 'rgb(185, 28, 28)'}}>
                  {deleteError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escribe <span className="font-bold">ELIMINAR</span> para confirmar:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    borderColor: deleteConfirmText === "ELIMINAR" ? 'rgb(220, 38, 38)' : '',
                    '--focus-ring-color': 'rgb(220, 38, 38)'
                  } as React.CSSProperties}
                  placeholder="ELIMINAR"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                    setDeleteError("");
                  }}
                  disabled={deleteLoading}
                  className="flex-1 py-2 px-4 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "ELIMINAR" || deleteLoading}
                  className="flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                  style={{backgroundColor: 'rgb(220, 38, 38)'}}
                >
                  {deleteLoading ? 'Eliminando...' : 'Eliminar Permanentemente'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
