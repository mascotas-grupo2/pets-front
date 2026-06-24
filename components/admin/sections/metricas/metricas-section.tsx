"use client";

import React, { useState, useMemo } from "react";
import {
  PawPrint,
  Heart,
  Search,
  TrendingUp,
  ClipboardList,
  Users,
  Loader2,
} from "lucide-react";
import { useMetricas } from "../hook/useMetricas";
import { useMapaReportes } from "../hook/useMapaReportes";
import { MetricasFilters } from "./MetricasFilters";
import { BarChart, LineChart } from "./charts";
import { DonutWithDetails } from "./DonutWithDetails";
import MetricasMap from "./MetricasMap";
import { PublicacionDrawer } from "../publicacion/publicacion-drawer";
import { usePublicaciones } from "../hook/usePublicaciones";
import { MascotaEstadoPill } from "../../lib/pet-status";
import { VerTodas } from "../dashboard/dashboard-section";
import type { PetStatus } from "@/types/pet";

const STAT_ICONS = [
  <PawPrint size={20} key="paw" />,
  <Heart size={20} key="heart" />,
  <Search size={20} key="search" />,
  <TrendingUp size={20} key="trend" />,
  <ClipboardList size={20} key="clipboard" />,
  <Users size={20} key="users" />,
];

const STAT_CONFIG = [
  { label: "Mascotas publicadas", color: "#7c3aed" },
  { label: "Mascotas adoptadas", color: "#22c55e" },
  { label: "Mascotas perdidas", color: "#f59e0b" },
  { label: "Tasa de adopción", color: "#3b82f6" },
  { label: "Seguimientos pendientes", color: "#ec4899" },
  { label: "Usuarios registrados", color: "#06b6d4" },
];

export function MetricasSection() {
  const { chartData, loading, error, filter, setFilter, filters, refresh } =
    useMetricas();

  // El mapa se carga aparte (endpoint propio), independiente del período.
  const { ubicaciones: mapaUbicaciones } = useMapaReportes();

  // Estado para el manejo del Drawer
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Obtenemos las publicaciones y acciones para el Drawer
  const {
    visible,
    handleApprove,
    handleReject,
    handleFinalize,
    handleDelete,
    handleSave,
    handleConfirmReturn,
    handleApproveClaim,
  } = usePublicaciones();

  // Buscamos el objeto completo de la mascota en la lista de publicaciones cargada
  const selectedPet = useMemo(
    () => visible.find((p) => p.id === selectedId) ?? null,
    [visible, selectedId]
  );

  const drawerActions = {
    handleApprove,
    handleReject,
    handleFinalize,
    handleDelete,
    handleConfirmReturn,
    handleApproveClaim,
    handleSave,
  };

  if (loading) {
    return (
      <div className="metricas">
        <div className="metricas-header">
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="metricas">
        <div className="metricas-header">
        </div>
        <div className="text-center py-12 text-gray-500">
          <p>Error al cargar las métricas.</p>
          <button
            onClick={refresh}
            className="mt-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!chartData) return null;

  return (
    <div className="metricas">
      {/* Header */}
      <div className="metricas-header">
        <MetricasFilters
          activeFilter={filter}
          onFilterChange={setFilter}
          filters={filters}
        />
      </div>

      {/* Stat Cards */}
      <div className="metricas-stat-grid">
        {STAT_CONFIG.map((config, i) => (
          <div key={config.label} className="metricas-stat-card">
            <span
              className="metricas-stat-icon"
              style={{
                backgroundColor: config.color + "18",
                color: config.color,
              }}
            >
              {STAT_ICONS[i]}
            </span>
            <div className="metricas-stat-body">
              <span className="metricas-stat-value">
                {(() => {
                  const kpis = chartData.kpis;
                  const values = [
                    kpis.mascotasPublicadas,
                    kpis.mascotasAdoptadas,
                    kpis.mascotasPerdidas,
                    kpis.tasaAdopcion,
                    kpis.seguimientosPendientes,
                    kpis.usuariosRegistrados,
                  ];
                  const val = values[i];
                  if (i === 3) return `${val}%`; // Formato para la tasa de adopción
                  return val?.toLocaleString("es-AR") ?? "0";
                })()}
              </span>
              <span className="metricas-stat-label">{config.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Fila 1: 3 donas con leyenda a la derecha */}
      <div className="metricas-dona-grid">
        <DonutWithDetails
          title="Mascotas por estado"
          data={chartData.mascotasPorEstado}
          total={chartData.totalMascotas}
          totalLabel="Total"
          height={200}
        />
        <DonutWithDetails
          title="Solicitudes de adopción por estado"
          data={chartData.solicitudesPorEstado}
          total={chartData.totalSolicitudes}
          totalLabel="Solicitudes"
          height={200}
        />
        <DonutWithDetails
          title="Seguimientos por estado"
          data={chartData.seguimientosPorEstado}
          total={chartData.totalSeguimientos}
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
            <LineChart data={chartData.usuariosPorMes} height={300} />
          </div>
        </div>

        {/* Mascotas por tipo */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Mascotas publicadas por tipo</h3>
            <span className="chart-card-subtitle">Publicaciones</span>
          </div>
          <div className="chart-card-body chart-card-body--full">
            <BarChart data={chartData.mascotasPorTipo} height={300} />
          </div>
        </div>

        {/* Top publicaciones */}
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Top publicaciones más vistas</h3>
            <VerTodas label="Ver todos" href="/admin/publicacion" />
          </div>
          <div className="chart-card-table">
            {chartData.topPublicaciones.map((p, i) => (
              <div
                key={i}
                className="metricas-top-row"
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedId(p.id)}
              >
                <div className="metricas-top-rank-wrap">
                  <span className="metricas-top-rank">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                {p.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.avatar}
                    alt={p.titulo}
                    className="metricas-top-avatar"
                  />
                )}
                <div className="metricas-top-info">
                  <div className="metricas-top-line1">
                    <span className="metricas-top-titulo">{p.titulo}</span>
                    <span className="metricas-top-vistas">
                      {p.vistas.toLocaleString()} vistas
                    </span>
                  </div>
                  <div className="metricas-top-line2">
                    <span className="metricas-top-comentarios">
                      {p.comentarios} comentarios{" "}
                    </span>
                    <MascotaEstadoPill
                      status={p.estado.toLowerCase() as PetStatus}
                      label={p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fila 3: Mapa */}
      <div className="metricas-map-wrap">
        <MetricasMap ubicaciones={mapaUbicaciones} />
      </div>

      {/* Drawer reutilizado */}
      {selectedPet && (
        <PublicacionDrawer
          pet={selectedPet}
          onClose={() => setSelectedId(null)}
          actions={drawerActions}
        />
      )}
    </div>
  );
}
