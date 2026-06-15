"use client";

import React, { useState, useMemo } from "react";
import {
  PawPrint,
  Heart,
  Search,
  TrendingUp,
  ClipboardList,
  Users,
} from "lucide-react";
import { getMetricasData, type MetricasFilter } from "./metricas.data";
import { MetricasFilters } from "./MetricasFilters";
import { BarChart, LineChart } from "./charts";
import { DonutWithDetails } from "./DonutWithDetails";
import MetricasMap from "./MetricasMap";

const STAT_ICONS = [
  <PawPrint size={20} key="paw" />,
  <Heart size={20} key="heart" />,
  <Search size={20} key="search" />,
  <TrendingUp size={20} key="trend" />,
  <ClipboardList size={20} key="clipboard" />,
  <Users size={20} key="users" />,
];

export function MetricasSection() {
  const [filter, setFilter] = useState<MetricasFilter>("30d");
  const data = useMemo(() => getMetricasData(filter), [filter]);

  return (
    <div className="metricas">
      {/* Header */}
      <div className="metricas-header">
        <div className="metricas-header-info">
          <h2 className="metricas-title">Métricas</h2>
          <p className="metricas-subtitle">Indicadores clave del refugio</p>
        </div>
        <MetricasFilters activeFilter={filter} onFilterChange={setFilter} />
      </div>

      {/* Stat Cards */}
      <div className="metricas-stat-grid">
        {data.statCards.map((s, i) => (
          <div key={s.label} className="metricas-stat-card">
            <span className="metricas-stat-icon" style={{ backgroundColor: s.color + "18", color: s.color }}>
              {STAT_ICONS[i]}
            </span>
            <div className="metricas-stat-body">
              <span className="metricas-stat-value">{s.value}</span>
              <span className="metricas-stat-label">{s.label}</span>
              <span className="metricas-stat-hint">↑ {s.change}% vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fila 1: 3 donas con leyenda a la derecha */}
      <div className="metricas-dona-grid">
        <DonutWithDetails
          title="Mascotas por estado"
          data={data.mascotasPorEstado}
          total="1,248"
          totalLabel="Total"
          height={200}
        />
        <DonutWithDetails
          title="Solicitudes de adopción por estado"
          data={data.solicitudesPorEstado}
          total="425"
          totalLabel="Solicitudes"
          height={200}
        />
        <DonutWithDetails
          title="Seguimientos por estado"
          data={data.seguimientosPorEstado}
          total="211"
          totalLabel="Seguimientos"
          height={200}
        />
      </div>

      {/* Fila 2: 3 columnas */}
      <div className="metricas-grid-3">
        {/* Usuarios registrados */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Usuarios registrados</h3>
            <span className="chart-card-subtitle">Evolución mensual</span>
          </div>
          <div className="chart-card-body chart-card-body--full">
            <LineChart data={data.usuariosRegistrados} height={300} />
          </div>
        </div>

        {/* Mascotas por tipo */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Mascotas publicadas por tipo</h3>
            <span className="chart-card-subtitle">Publicaciones</span>
          </div>
          <div className="chart-card-body chart-card-body--full">
            <BarChart data={data.mascotasPorTipo} height={300} />
          </div>
        </div>

        {/* Top publicaciones */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Top publicaciones más vistas</h3>
          </div>
          <div className="chart-card-table">
            {data.topPublicaciones.map((p, i) => (
              <div key={i} className="metricas-top-row">
                <div className="metricas-top-rank-wrap">
                  <span className="metricas-top-rank">{String(i + 1).padStart(2, "0")}</span>
                </div>
                {p.avatar && (
                  <img
                    src={p.avatar}
                    alt={p.titulo}
                    className="metricas-top-avatar"
                  />
                )}
                <div className="metricas-top-info">
                  <div className="metricas-top-line1">
                    <span className="metricas-top-titulo">{p.titulo}</span>
                    <span className="metricas-top-vistas">{p.vistas.toLocaleString()} vistas</span>
                  </div>
                  <div className="metricas-top-line2">
                    <span className="metricas-top-comentarios">{p.comentarios} coment.</span>
                    <span className={`pill pill--sm pill--${p.estado === "Activa" ? "green" : p.estado === "Adoptado" ? "violet" : "amber"}`}>
                      {p.estado}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fila 3: Mapa */}
      <div className="metricas-map-wrap">
        <MetricasMap ubicaciones={data.ubicaciones} />
      </div>
    </div>
  );
}
