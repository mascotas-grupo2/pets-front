"use client";

import { TIPO_OPTIONS, FOLLOWUP_STATUS } from "./seguimientos.data";

const ESTADO_OPTIONS: { id: number; label: string }[] = [
  { id: FOLLOWUP_STATUS.pendiente, label: "Pendiente" },
  { id: FOLLOWUP_STATUS.confirmado, label: "Confirmado" },
  { id: FOLLOWUP_STATUS.completado, label: "Completado" },
];

type Props = {
  filterTipo: number | null;
  onTipo: (value: number | null) => void;
  filterEstado: number | null;
  onEstado: (value: number | null) => void;
};

export function SeguimientosFilters({ filterTipo, onTipo, filterEstado, onEstado }: Props) {
  return (
    <div className="seg-filters">
      <div className="seg-filter-group">
        <span className="seg-filter-label">Tipo</span>
        <div className="pub-filter-chips">
          {TIPO_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`pub-chip${filterTipo === o.id ? " active" : ""}`}
              aria-pressed={filterTipo === o.id}
              onClick={() => onTipo(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="seg-filter-group">
        <span className="seg-filter-label">Estado</span>
        <div className="pub-filter-chips">
          {ESTADO_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`pub-chip${filterEstado === o.id ? " active" : ""}`}
              aria-pressed={filterEstado === o.id}
              onClick={() => onEstado(o.id)}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
