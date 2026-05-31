"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { EstadoFiltro } from "../hook/usePublicaciones";

const FILTROS: { id: EstadoFiltro; label: string }[] = [
  { id: "todos", label: "Todas" },
  { id: "pendiente", label: "Nuevas" },
  { id: "activo", label: "Publicadas" },
  { id: "rechazado", label: "Rechazadas" },
  { id: "finalizado", label: "Finalizadas" },
];

type Props = {
  query: string;
  onQuery: (v: string) => void;
  estado: EstadoFiltro;
  onEstado: (v: EstadoFiltro) => void;
};

export function PublicacionFilters({ query, onQuery, estado, onEstado }: Props) {
  const [showFiltros, setShowFiltros] = useState(false);

  return (
    <>
      <div className="pub-controls">
        <div className="pub-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Buscar publicación..."
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
              className={`pub-chip${estado === f.id ? " active" : ""}`}
              aria-pressed={estado === f.id}
              onClick={() => onEstado(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
