"use client";

import { Users, ShieldCheck, Heart, User } from "lucide-react";
import type { TipoFiltro } from "../hook/usePersonas";

type Props = {
  counts: { todos: number; admin: number; adoptante: number; comun: number };
  loading: boolean;
};

export function PersonasStats({ counts, loading }: Props) {
  const val = (n: number) => (loading ? "…" : n);

  return (
    <div className="dash-stats">
      <StatCard
        icon={<Users size={22} aria-hidden />}
        label="Total personas"
        value={val(counts.todos)}
        tone="blue"
      />
      <StatCard
        icon={<ShieldCheck size={22} aria-hidden />}
        label="Admins"
        value={val(counts.admin)}
        tone="violet"
      />
      <StatCard
        icon={<Heart size={22} aria-hidden />}
        label="Adoptantes"
        value={val(counts.adoptante)}
        tone="green"
      />
      <StatCard
        icon={<User size={22} aria-hidden />}
        label="Usuarios comunes"
        value={val(counts.comun)}
        tone="amber"
      />
    </div>
  );
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number | string; tone: string }) {
  return (
    <div className="dash-stat-card">
      <div className={`dash-stat-icon tone-${tone}`}>{icon}</div>
      <div className="dash-stat-body">
        <span className="dash-stat-label">{label}</span>
        <span className="dash-stat-value">{value}</span>
      </div>
    </div>
  );
}
