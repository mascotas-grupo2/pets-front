import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { FiltroEspecie } from "../hook/useMascotas";

const ESPECIES: { id: FiltroEspecie; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "perro", label: "Perros" },
  { id: "gato", label: "Gatos" },
  { id: "otro", label: "Otros" },
];

type Props = {
  query: string;
  onQuery: (v: string) => void;
  especie: FiltroEspecie;
  onEspecie: (v: FiltroEspecie) => void;
};

export function MascotasFilters({ query, onQuery, especie, onEspecie }: Props) {
  const [showFiltros, setShowFiltros] = useState(false);

  return (
    <>
      <div className="pub-controls">
        <div className="pub-search">
          <Search size={16} aria-hidden />
          <input
            type="search"
            placeholder="Buscar mascota..."
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
          {ESPECIES.map((e) => (
            <button
              key={e.id}
              type="button"
              className={`pub-chip${especie === e.id ? " active" : ""}`}
              aria-pressed={especie === e.id}
              onClick={() => onEspecie(e.id)}
            >
              {e.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
