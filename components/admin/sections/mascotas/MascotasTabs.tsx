import type { FiltroEstado } from "../hook/useMascotas";

const FILTROS: { id: FiltroEstado; label: string }[] = [
  { id: "todas", label: "Todas" },
  { id: "refugio", label: "En refugio" },
  { id: "adopcion", label: "En adopción" },
  { id: "adoptados", label: "Adoptados" },
];

type Props = {
  counts: Record<FiltroEstado, number>;
  filtro: FiltroEstado;
  onFiltro: (f: FiltroEstado) => void;
};

export function MascotasTabs({ counts, filtro, onFiltro }: Props) {
  return (
    <div className="mtabs" role="tablist">
      {FILTROS.map((f) => (
        <button
          key={f.id}
          type="button"
          role="tab"
          aria-selected={filtro === f.id}
          className={`mtab${filtro === f.id ? " active" : ""}`}
          onClick={() => onFiltro(f.id)}
        >
          {f.label} <span className="mtab-count">{counts[f.id]}</span>
        </button>
      ))}
    </div>
  );
}
