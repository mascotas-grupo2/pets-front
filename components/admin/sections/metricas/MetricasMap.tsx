"use client";

import React from "react";
import dynamic from "next/dynamic";
import type { UbicacionMapa } from "./metricas.data";

const MetricasMapInner = dynamic(() => import("./MetricasMapInner"), {
  ssr: false,
  loading: () => (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
      Cargando mapa...
    </div>
  ),
});

export type MetricasMapProps = {
  ubicaciones: UbicacionMapa[];
};

const LEGEND: { label: string; color: string }[] = [
  { label: "Perdida", color: "#ef4444" },
  { label: "En adopción", color: "#22c55e" },
  { label: "En refugio", color: "#3b82f6" },
  { label: "En tránsito", color: "#f59e0b" },
];

export default function MetricasMap({ ubicaciones }: MetricasMapProps) {
  return (
    <div className="metricas-map-card">
      <div className="metricas-map-header">
        <h3 className="metricas-map-title">Mapa de ubicaciones</h3>
        <span className="metricas-map-subtitle">
          {ubicaciones.length} mascota{ubicaciones.length === 1 ? "" : "s"} en el mapa
        </span>
      </div>
      <div
        className="metricas-map-legend"
        style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", padding: "0 1rem 0.5rem" }}
      >
        {LEGEND.map((l) => (
          <span
            key={l.label}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8rem", color: "var(--gray-600)" }}
          >
            <i
              style={{ width: 10, height: 10, borderRadius: "999px", background: l.color, display: "inline-block" }}
            />
            {l.label}
          </span>
        ))}
      </div>
      <div className="metricas-map-body">
        <MetricasMapInner ubicaciones={ubicaciones} />
      </div>
    </div>
  );
}
