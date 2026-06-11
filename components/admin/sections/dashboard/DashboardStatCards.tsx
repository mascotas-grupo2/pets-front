"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { STATS } from "./dashboard.data";
import type { Stat } from "./dashboard.data";
import { getDashboardStats, type DashboardStats } from "@/services/dashboard";

const HREF_BY_LABEL: Record<string, string | undefined> = {
  "Mascotas activas": "/admin/mascotas",
  Solicitudes: "/admin/solicitudes",
  "Seguimientos hoy": "/admin/seguimientos",
  Publicaciones: "/admin/publicacion",
  "Mensajes sin leer": "/admin/mensajes",
};

export function DashboardStatCards({
  publicaciones,
}: {
  publicaciones?: number | null;
}) {
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    getDashboardStats().then((res) => {
      if (res.ok && res.data) setStats(res.data);
    });
  }, []);

  /** Valor real por card (… mientras carga). */
  function valueFor(label: string): string {
    if (!stats) {
      if (label === "Publicaciones" && publicaciones != null)
        return String(publicaciones);
      return "…";
    }
    switch (label) {
      case "Mascotas activas":
        return String(stats.mascotasActivas);
      case "Solicitudes":
        return String(stats.solicitudes);
      case "Seguimientos hoy":
        return String(stats.seguimientosHoy);
      case "Publicaciones":
        return String(stats.publicaciones);
      case "Mensajes sin leer":
        return String(stats.mensajesSinLeer);
      default:
        return "—";
    }
  }

  return (
    <div className="dash-stats">
      {STATS.map((s: Stat) => {
        const Icon = s.icon;
        const href = HREF_BY_LABEL[s.label];
        const esMascotas = s.label === "Mascotas activas";

        const body = (
          <>
            <div className={`dash-stat-icon tone-${s.tone}`}>
              <Icon size={22} aria-hidden />
            </div>
            <div className="dash-stat-body">
              <span className="dash-stat-label">{s.label}</span>
              <span className="dash-stat-value">
                {valueFor(s.label)}
                {esMascotas && stats && (
                  <span className="dash-stat-badge" title="Mascotas perdidas">
                    {stats.mascotasPerdidas} perdidas
                  </span>
                )}
              </span>
              <span className="dash-stat-hint">{s.hint}</span>
            </div>
          </>
        );

        return href ? (
          <Link
            key={s.label}
            href={href}
            className="dash-stat-card dash-stat-card--link"
          >
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
