"use client";

import { CheckCircle2, Clock, MessageSquare, ShieldCheck, UserCheck, XCircle } from "lucide-react";
import type { Tone } from "../../ui/types";
import { EstadoSolicitud } from "./solicitudes.data";
import type { EstadoFiltro } from "../hook/useSolicitudes";

type Props = {
  counts: Record<EstadoSolicitud, number>;
  loading: boolean;
  estado: EstadoFiltro;
  onToggle: (key: EstadoSolicitud) => void;
};

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: Tone;
  active: boolean;
  onClick: () => void;
};

function StatCard({ icon, label, value, tone, active, onClick }: StatCardProps) {
  return (
    <button
      type="button"
      className={`dash-stat-card pub-stat-btn${active ? " is-active" : ""} `}
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

const STATS: Array<{
  key: EstadoSolicitud;
  label: string;
  tone: Tone;
  icon: React.ReactNode;
}> = [
  { key: "NUEVA", label: "Nueva", tone: "violet", icon: <Clock size={22} aria-hidden /> },
  { key: "EN_EVALUACION", label: "En evaluación", tone: "blue", icon: <MessageSquare size={22} aria-hidden /> },
  { key: "ENTREVISTA_PENDIENTE", label: "Entrevista pendiente", tone: "amber", icon: <UserCheck size={22} aria-hidden /> },
  { key: "ACEPTADA_CON_SEGUIMIENTO", label: "Aceptada c/ seguimiento", tone: "green", icon: <ShieldCheck size={22} aria-hidden /> },
  { key: "ACEPTADA", label: "Aceptada", tone: "green", icon: <CheckCircle2 size={22} aria-hidden /> },
  { key: "DESCARTADA", label: "Descartada", tone: "red", icon: <XCircle size={22} aria-hidden /> },
];

export function SolicitudesStats({ counts, loading, estado, onToggle }: Props) {
  const val = (n: number) => (loading ? "…" : n);

  return (
    <div className="pub-stats pub-stats--6">
      {STATS.map((stat) => (
        <StatCard
          key={stat.key}
          icon={stat.icon}
          label={stat.label}
          tone={stat.tone}
          value={val(counts[stat.key])}
          active={estado === stat.key}
          onClick={() => onToggle(stat.key)}
        />
      ))}
    </div>
  );
}
