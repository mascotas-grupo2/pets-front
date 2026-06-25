"use client";

import { CheckCircle2, Clock, XCircle, Flag, Bookmark, TimerOff } from "lucide-react";
import type { EstadoFiltro } from "../hook/usePublicaciones";

type Props = {
  counts: {
    pendiente: number;
    activo: number;
    rechazado: number;
    finalizado: number;
    reservada: number;
    vencidas: number;
  };
  loading: boolean;
  estado: EstadoFiltro;
  onToggle: (key: EstadoFiltro) => void;
};

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: "violet" | "green" | "red" | "blue" | "amber";
  active: boolean;
  onClick: () => void;
};

function StatCard({
  icon,
  label,
  value,
  tone,
  active,
  onClick,
}: StatCardProps) {
  return (
    <button
      type="button"
      className={`dash-stat-card pub-stat-btn${active ? " is-active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <div className={`dash-stat-icon tone-${tone}`}>{icon}</div>
      <div className="dash-stat-body">
        <span className="dash-stat-label">{label}</span>
        <span className="dash-stat-value">{value}</span>
      </div>
    </button>
  );
}

export function PublicacionStats({ counts, loading, estado, onToggle }: Props) {
  const val = (n: number) => (loading ? "…" : n);

  return (
    <div className="pub-stats pub-stats--6">
      <StatCard
        icon={<Clock size={22} aria-hidden />}
        label="Nuevas (pendientes)"
        value={val(counts.pendiente)}
        tone="violet"
        active={estado === "pendiente"}
        onClick={() => onToggle("pendiente")}
      />
      <StatCard
        icon={<CheckCircle2 size={22} aria-hidden />}
        label="Publicadas"
        value={val(counts.activo)}
        tone="green"
        active={estado === "activo"}
        onClick={() => onToggle("activo")}
      />
      <StatCard
        icon={<XCircle size={22} aria-hidden />}
        label="Rechazadas"
        value={val(counts.rechazado)}
        tone="red"
        active={estado === "rechazado"}
        onClick={() => onToggle("rechazado")}
      />
      <StatCard
        icon={<Bookmark size={22} aria-hidden />}
        label="Reservadas"
        value={val(counts.reservada)}
        tone="amber"
        active={estado === "reservada"}
        onClick={() => onToggle("reservada")}
      />
      <StatCard
        icon={<Flag size={22} aria-hidden />}
        label="Finalizadas"
        value={val(counts.finalizado)}
        tone="blue"
        active={estado === "finalizado"}
        onClick={() => onToggle("finalizado")}
      />
      <StatCard
        icon={<TimerOff size={22} aria-hidden />}
        label="Vencidas"
        value={val(counts.vencidas)}
        tone="red"
        active={estado === "vencidas"}
        onClick={() => onToggle("vencidas")}
      />
    </div>
  );
}
