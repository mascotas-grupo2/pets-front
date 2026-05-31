"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { TipoFiltro } from "../hook/usePersonas";

const FILTROS: { id: TipoFiltro; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "admin", label: "Admins" },
  { id: "adoptante", label: "Adoptantes" },
  { id: "comun", label: "Usuarios comunes" },
];

type Props = {
  query: string;
  onQuery: (v: string) => void;
  tipo: TipoFiltro;
  onTipo: (v: TipoFiltro) => void;
};

export function PersonasFilters({ query, onQuery, tipo, onTipo }: Props) {
  const [showFiltros, setShowFiltros] = useState(false);

  return (
    <>
      <div className="pub-controls">
        <div className="pub-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Buscar persona..."
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setShowFiltros((s) => !s)}
          aria-expanded={showFiltros}
        >
          <SlidersHorizontal size={16} aria-hidden /> Filtros
        </button>
      </div>

      {showFiltros && (
        <div className="pub-filter-chips">
          {FILTROS.map((f) => (
            <button
              key={f.id}
              type="button"
              className={`pub-chip${tipo === f.id ? " active" : ""}`}
              aria-pressed={tipo === f.id}
              onClick={() => onTipo(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
