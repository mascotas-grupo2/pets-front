"use client";

import { Layers, MapPinOff, Home, Heart, CheckCircle2 } from "lucide-react";
import type { FiltroEstado } from "../hook/useMascotas";

type Props = {
  counts: Record<FiltroEstado, number>;
  filtro: FiltroEstado;
  onFiltro: (f: FiltroEstado) => void;
  loading?: boolean;
};

type Tone = "violet" | "green" | "red" | "blue" | "amber";

const CARDS: {
  id: FiltroEstado;
  label: string;
  icon: React.ReactNode;
  tone: Tone;
}[] = [
  { id: "todas", label: "Todas", icon: <Layers size={22} aria-hidden />, tone: "violet" },
  { id: "perdido", label: "Perdidas", icon: <MapPinOff size={22} aria-hidden />, tone: "red" },
  { id: "refugio", label: "En refugio", icon: <Home size={22} aria-hidden />, tone: "blue" },
  { id: "adopcion", label: "En adopción", icon: <Heart size={22} aria-hidden />, tone: "green" },
  { id: "adoptados", label: "Adoptadas", icon: <CheckCircle2 size={22} aria-hidden />, tone: "amber" },
];

/** Cards de situación de la mascota (mismo patrón que Publicaciones). */
export function MascotasStats({ counts, filtro, onFiltro, loading }: Props) {
  const val = (n: number) => (loading ? "…" : n);
  return (
    <div
      className="pub-stats"
      style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))" }}
    >
      {CARDS.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`dash-stat-card pub-stat-btn${filtro === c.id ? " is-active" : ""}`}
          aria-pressed={filtro === c.id}
          // Clic en la card activa vuelve a "Todas".
          onClick={() => onFiltro(filtro === c.id && c.id !== "todas" ? "todas" : c.id)}
        >
          <div className={`dash-stat-icon tone-${c.tone}`}>{c.icon}</div>
          <div className="dash-stat-body">
            <span className="dash-stat-label">{c.label}</span>
            <span className="dash-stat-value">{val(counts[c.id])}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
