"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { EstadoFiltro } from "../hook/useSolicitudes";

const FILTROS: { id: EstadoFiltro; label: string }[] = [
  { id: "TODAS", label: "Todas" },
  { id: "NUEVA", label: "Nueva" },
  { id: "EN_EVALUACION", label: "En evaluación" },
  { id: "ENTREVISTA_PENDIENTE", label: "Entrevista pendiente" },
  { id: "ACEPTADA_CON_SEGUIMIENTO", label: "Aceptada c/ seguimiento" },
  { id: "ACEPTADA", label: "Aceptada" },
  { id: "DESCARTADA", label: "Descartada" },
];

type Props = {
  query: string;
  onQuery: (value: string) => void;
  estado: EstadoFiltro;
  onEstado: (value: EstadoFiltro) => void;
};

export function SolicitudesFilters({ query, onQuery, estado, onEstado }: Props) {
  const [showFiltros, setShowFiltros] = useState(false);

  return (
    <>
      <div className="pub-controls">
        <div className="pub-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Buscar usuario, mascota o email..."
            value={query}
            onChange={(event) => onQuery(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={() => setShowFiltros((current) => !current)}
          aria-expanded={showFiltros}
        >
          <SlidersHorizontal size={16} aria-hidden /> Filtros
        </button>
      </div>

      {showFiltros && (
        <div className="pub-filter-chips">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.id}
              type="button"
              className={`pub-chip${estado === filtro.id ? " active" : ""}`}
              aria-pressed={estado === filtro.id}
              onClick={() => onEstado(filtro.id)}
            >
              {filtro.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
