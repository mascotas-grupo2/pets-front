"use client";

import { Layers, Clock, CheckCircle2, CheckSquare } from "lucide-react";
import type { SeguimientoTab } from "./seguimientos.data";

type Props = {
  counts: Record<SeguimientoTab, number>;
  tab: SeguimientoTab;
  onTab: (t: SeguimientoTab) => void;
  loading?: boolean;
};

type Tone = "violet" | "blue" | "green" | "gray";

const CARDS: {
  id: SeguimientoTab;
  label: string;
  icon: React.ReactNode;
  tone: Tone;
}[] = [
  { id: "todas", label: "Todas", icon: <Layers size={22} aria-hidden />, tone: "violet" },
  { id: "pendientes", label: "Pendientes", icon: <Clock size={22} aria-hidden />, tone: "blue" },
  { id: "confirmadas", label: "Confirmadas", icon: <CheckCircle2 size={22} aria-hidden />, tone: "green" },
  { id: "completadas", label: "Completadas", icon: <CheckSquare size={22} aria-hidden />, tone: "gray" },
];

export function SeguimientosStats({ counts, tab, onTab, loading }: Props) {
  const val = (n: number) => (loading ? "…" : n);
  return (
    <div className="pub-stats pub-stats--4">
      {CARDS.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`dash-stat-card pub-stat-btn${tab === c.id ? " is-active" : ""}`}
          aria-pressed={tab === c.id}
          onClick={() => onTab(tab === c.id && c.id !== "todas" ? "todas" : c.id)}
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
