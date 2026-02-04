"use client";
import React from "react";
import type { AddPlaylistFormData } from "@/lib/types";

interface PlaylistFormProps {
  formData: AddPlaylistFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  error?: string;
  success?: boolean;
  submitLabel?: string;
  showCancel?: boolean;
  onCancel?: () => void;
}

export default function PlaylistForm({ formData, onChange, onSubmit, loading = false, error, success, submitLabel = 'Guardar', showCancel = false, onCancel }: PlaylistFormProps) {
  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 rounded-lg shadow-lg" style={{backgroundColor: 'white'}}>
      {error && (
        <div className="mb-4 p-4 rounded border" style={{backgroundColor: 'rgba(198, 40, 40, 0.1)', borderColor: 'rgba(198, 40, 40, 0.2)', color: 'rgb(183, 28, 28)'}}>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 rounded border" style={{backgroundColor: 'rgba(46, 125, 50, 0.1)', borderColor: 'rgba(46, 125, 50, 0.2)', color: 'rgb(46, 125, 50)'}}>
          ¡Operación realizada con éxito!
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 input-ring-red transition-colors"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={onChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 input-ring-red transition-colors"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={onChange}
            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">Hacer pública esta playlist</label>
        </div>

        <div className="flex gap-4">
          {showCancel && (
            <button type="button" onClick={onCancel} className="flex-1 py-2 px-4 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
          )}
          <button type="submit" disabled={loading} className="flex-1 py-2 px-4 rounded-md text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed" style={{backgroundColor: 'rgb(198, 40, 40)'}}>
            {loading ? 'Procesando...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
