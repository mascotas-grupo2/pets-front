"use client";

import Link from "next/link";
import { STATS } from "./dashboard.data";
import type { Tone } from "../../ui/types";
import type { Stat } from "./dashboard.data";

export function DashboardStatCards({ publicaciones }: { publicaciones: number | null }) {
  return (
    <div className="dash-stats">
      {STATS.map((s: Stat) => {
        const Icon = s.icon;
        const esPublicaciones = s.label === "Publicaciones";
        const value = esPublicaciones ? (publicaciones === null ? "…" : String(publicaciones)) : s.value;
        const target = s.label === "Publicaciones" ? "/admin/publicacion" : s.label === "Solicitudes" ? "/admin/solicitudes" : undefined;
        const href = target ? target : undefined;

        const body = (
          <>
            <div className={`dash-stat-icon tone-${s.tone}`}>
              <Icon size={22} aria-hidden />
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-label">{s.label}</span>
              <span className="dash-stat-value">{value}</span>
              <span className="dash-stat-hint">{s.hint}</span>
            </div>
          </>
        );

        return href ? (
          <Link key={s.label} href={href} className="dash-stat-card dash-stat-card--link">
            {body}
          </Link>
        ) : (
          <div key={s.label} className="dash-stat-card">
            {body}
          </div>
        );
      })}
    </div>
  );
}
