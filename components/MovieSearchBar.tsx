"use client";
import { useState } from "react";
import type { SearchFilters } from "@/lib/types";

interface MovieSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export default function MovieSearchBar({ onSearch, initialFilters }: MovieSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || "");
  const [yearFrom, setYearFrom] = useState<string>(initialFilters?.yearFrom?.toString() || "");
  const [yearTo, setYearTo] = useState<string>(initialFilters?.yearTo?.toString() || "");
  const [minScore, setMinScore] = useState<string>(initialFilters?.minScore?.toString() || "");
  const [genresInput, setGenresInput] = useState<string>(initialFilters?.genres?.join(', ') || "");
  const [sortBy, setSortBy] = useState<SearchFilters['sortBy']>(initialFilters?.sortBy || 'title');
  const [sortOrder, setSortOrder] = useState<SearchFilters['sortOrder']>(initialFilters?.sortOrder || 'asc');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    const filters: SearchFilters = {
      searchQuery: searchQuery.trim(),
      sortBy,
      sortOrder,
    };

    if (yearFrom) filters.yearFrom = parseInt(yearFrom);
    if (yearTo) filters.yearTo = parseInt(yearTo);
    if (minScore) filters.minScore = parseFloat(minScore);
    if (genresInput.trim()) {
      filters.genres = genresInput.split(',').map(g => g.trim()).filter(g => g.length > 0);
    }

    onSearch(filters);
  };

  const handleReset = () => {
    setSearchQuery("");
    setGenresInput("");
    setYearFrom("");
    setYearTo("");
    setMinScore("");
    setSortBy('title');
    setSortOrder('asc');
    onSearch({
      searchQuery: "",
      sortBy: 'title',
      sortOrder: 'asc',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Búsqueda principal */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Buscar por título, director o reparto..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
          style={{"--tw-ring-color": "rgb(198, 40, 40)"} as React.CSSProperties}
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
          style={{backgroundColor: 'rgb(198, 40, 40)'}}
        >
          Buscar
        </button>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors hover:bg-gray-50"
        >
          {showAdvanced ? 'Ocultar' : 'Filtros'}
        </button>
      </div>

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="border-t pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Año desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año desde
              </label>
              <input
                type="number"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
                placeholder="Ej: 2000"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{"--tw-ring-color": "rgb(198, 40, 40)"} as React.CSSProperties}
              />
            </div>

            {/* Año hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año hasta
              </label>
              <input
                type="number"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
                placeholder="Ej: 2024"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{"--tw-ring-color": "rgb(198, 40, 40)"} as React.CSSProperties}
              />
            </div>

            {/* Puntuación mínima */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Puntuación mínima
              </label>
              <input
                type="number"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
                placeholder="Ej: 7.0"
                min="0"
                max="10"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{"--tw-ring-color": "rgb(198, 40, 40)"} as React.CSSProperties}
              />
            </div>
          </div>
        {/* Géneros */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Géneros (separados por comas)
            </label>
            <input
              type="text"
              value={genresInput}
              onChange={(e) => setGenresInput(e.target.value)}
              placeholder="Ej: Acción, Ciencia ficción, Aventura"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
              style={{"--tw-ring-color": "rgb(198, 40, 40)"} as React.CSSProperties}
            />
          </div>

          {/* 
          {/* Ordenamiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ordenar por
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SearchFilters['sortBy'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{"--tw-ring-color": "rgb(198, 40, 40)"} as React.CSSProperties}
              >
                <option value="title">Título</option>
                <option value="year">Año</option>
                <option value="score">Puntuación</option>
                <option value="created_at">Fecha de adición</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Orden
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SearchFilters['sortOrder'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{"--tw-ring-color": "rgb(198, 40, 40)"} as React.CSSProperties}
              >
                <option value="asc">Ascendente (A-Z, 0-9)</option>
                <option value="desc">Descendente (Z-A, 9-0)</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors hover:bg-gray-50"
            >
              Limpiar filtros
            </button>
            <button
              onClick={handleSearch}
              className="px-6 py-2 rounded-lg text-white font-medium transition-colors hover:opacity-90"
              style={{backgroundColor: 'rgb(198, 40, 40)'}}
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
