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

export default function MetricasMap({ ubicaciones }: MetricasMapProps) {
  return (
    <div className="metricas-map-card">
      <div className="metricas-map-header">
        <h3 className="metricas-map-title">Mapa de ubicaciones</h3>
        <span className="metricas-map-subtitle">Mascotas y refugios</span>
      </div>
      <div className="metricas-map-body">
        <MetricasMapInner ubicaciones={ubicaciones} />
      </div>
    </div>
  );
}
