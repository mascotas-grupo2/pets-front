"use client";

import { Users, ShieldCheck, Heart, User } from "lucide-react";
import type { TipoFiltro } from "../hook/usePersonas";

type Props = {
  counts: { todos: number; admin: number; adoptante: number; comun: number };
  loading: boolean;
  tipo: TipoFiltro;
  onTipo: (t: TipoFiltro) => void;
};

const CARDS: {
  tipo: TipoFiltro;
  label: string;
  tone: string;
  icon: React.ReactNode;
  countKey: keyof Props["counts"];
}[] = [
  { tipo: "todos", label: "Total personas", tone: "blue", icon: <Users size={22} aria-hidden />, countKey: "todos" },
  { tipo: "admin", label: "Admins", tone: "violet", icon: <ShieldCheck size={22} aria-hidden />, countKey: "admin" },
  { tipo: "adoptante", label: "Adoptantes", tone: "green", icon: <Heart size={22} aria-hidden />, countKey: "adoptante" },
  { tipo: "comun", label: "Usuarios comunes", tone: "amber", icon: <User size={22} aria-hidden />, countKey: "comun" },
];

export function PersonasStats({ counts, loading, tipo, onTipo }: Props) {
  const val = (n: number) => (loading ? "…" : n);

  return (
    <div className="dash-stats">
      {CARDS.map((c) => {
        const active = tipo === c.tipo;
        return (
          <button
            key={c.tipo}
            type="button"
            className={`dash-stat-card dash-stat-card--clickable${active ? " is-active" : ""}`}
            aria-pressed={active}
            // Click en la card activa vuelve a "Todos".
            onClick={() => onTipo(active && c.tipo !== "todos" ? "todos" : c.tipo)}
          >
            <div className={`dash-stat-icon tone-${c.tone}`}>{c.icon}</div>
            <div className="dash-stat-body">
              <span className="dash-stat-label">{c.label}</span>
              <span className="dash-stat-value">{val(counts[c.countKey])}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
