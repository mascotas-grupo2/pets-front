"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  getMetricas,
  type MetricasData,
} from "@/services/metrics";
import type { ChartData } from "chart.js";

export type MetricasFilter = "7d" | "30d" | "90d" | "1y";

const FILTER_LABELS: Record<MetricasFilter, string> = {
  "7d": "7 días",
  "30d": "30 días",
  "90d": "90 días",
  "1y": "1 año",
};

// Colores para los gráficos
const COLORS = {
  violet: "#7c3aed",
  green: "#22c55e",
  amber: "#f59e0b",
  blue: "#3b82f6",
  cyan: "#06b6d4",
  rose: "#f43f5e",
  pink: "#ec4899",
  emerald: "#10b981",
  orange: "#f97316",
};

/** Helper para agrupar y sumar cantidades (maneja strings del back y evita duplicados) */
function processChartItems(items: Record<string, unknown>[] | undefined, labelKey: string) {
  if (!items) return { labels: [], data: [], total: 0 };
  const map = new Map<string, number>();
  items.forEach((item) => {
    const label = (item[labelKey] as string) || "Otros";
    const value = Number(item["cantidad"]) || 0;
    map.set(label, (map.get(label) || 0) + value);
  });
  return {
    labels: Array.from(map.keys()),
    data: Array.from(map.values()),
    total: Array.from(map.values()).reduce((a, b) => a + b, 0),
  };
}

export function useMetricas() {
  const [data, setData] = useState<MetricasData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<MetricasFilter>("30d");

  const loadMetricas = useCallback(async (periodo: MetricasFilter) => {
    setLoading(true);
    setError(null);

    const res = await getMetricas(periodo);

    if (!res.ok || !res.data) {
      toast.error("No se pudieron cargar las métricas.");
      setError(res.error || "Error al cargar métricas");
      setLoading(false);
      return;
    }
    setData(res.data.data);
    setLoading(false);
  }, []);

  // Efecto para cargar métricas cuando cambia el filtro
  useEffect(() => {
    const fetchData = async () => {
      await loadMetricas(filter);
    };
    void fetchData();
  }, [loadMetricas, filter]);

  // Transformar datos para los gráficos
  const chartData = useMemo(() => {
    if (!data) return null;

    // Procesamos las series de datos usando el helper para mayor seguridad
    const petsStatus = processChartItems(data.mascotasPorEstado, "estado");
    const adoptionsStatus = processChartItems(data.solicitudesPorEstado, "estado");
    const followupsStatus = processChartItems(data.seguimientosPorEstado, "estado");
    const petsType = processChartItems(data.mascotasPorTipo, "tipo");

    const mascotasPorEstado: ChartData<"doughnut"> = {
      labels: petsStatus.labels,
      datasets: [{
        data: petsStatus.data,
        backgroundColor: [COLORS.blue, COLORS.green, COLORS.amber, COLORS.violet, COLORS.rose],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };

    const solicitudesPorEstado: ChartData<"doughnut"> = {
      labels: adoptionsStatus.labels,
      datasets: [{
        data: adoptionsStatus.data,
        backgroundColor: [COLORS.amber, COLORS.blue, COLORS.green, COLORS.rose, COLORS.cyan, COLORS.violet],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };

    const seguimientosPorEstado: ChartData<"doughnut"> = {
      labels: followupsStatus.labels,
      datasets: [{
        data: followupsStatus.data,
        backgroundColor: [COLORS.amber, COLORS.blue, COLORS.green, COLORS.rose],
        borderWidth: 0,
        hoverOffset: 8,
      }],
    };

    const usuariosPorMes: ChartData<"line"> = {
      labels: (data.usuariosPorMes || []).map((u) => u.mes),
      datasets: [{
        label: "Usuarios",
        data: (data.usuariosPorMes || []).map((u) => Number(u.cantidad)),
        borderColor: COLORS.violet,
        backgroundColor: COLORS.violet + "20",
        fill: true,
        tension: 0.35,
        pointBackgroundColor: COLORS.violet,
        pointRadius: 4,
      }],
    };

    const mascotasPorTipo: ChartData<"bar"> = {
      labels: petsType.labels,
      datasets: [{
        label: "Publicadas",
        data: petsType.data,
        backgroundColor: [COLORS.violet + "30", COLORS.amber + "30", COLORS.cyan + "30"],
        borderColor: [COLORS.violet, COLORS.amber, COLORS.cyan],
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 60,
      }],
    };

    // Normalizar ubicaciones para el mapa y evitar errores de icono indefinido
    const ubicaciones = (data.mapaReportes || []).map((u) => {
      // El componente de mapa usa u.tipo para buscar en el objeto ICONS.
      // Si el back devuelve "Sin clasificar", forzamos un tipo válido para evitar el crash.
      let tipo: "adopcion" | "perdida" | "refugio" = "adopcion";
      const t = String(u.tipo || "").toLowerCase();

      if (t.includes("perdida") || t.includes("perdid")) tipo = "perdida";
      else if (t.includes("refugio")) tipo = "refugio";
      else if (t.includes("adopcion") || t.includes("adopción")) tipo = "adopcion";

      return { ...u, tipo };
    });

    // El back no envía 'comentarios' en topPublicaciones según el JSON, aseguramos valor por defecto
    const topPublicaciones = (data.topPublicaciones || []).map((p) => ({
      ...p,
      comentarios: (p as { comentarios?: number }).comentarios || 0,
    }));

    return {
      kpis: data.kpis, // Ahora exponemos los KPIs directos del back
      mascotasPorEstado,
      solicitudesPorEstado,
      seguimientosPorEstado,
      usuariosPorMes,
      mascotasPorTipo,
      topPublicaciones,
      ubicaciones,
      // Totales calculados para el centro de las donas
      totalMascotas: petsStatus.total.toLocaleString("es-AR"),
      totalSolicitudes: adoptionsStatus.total.toLocaleString("es-AR"),
      totalSeguimientos: followupsStatus.total.toLocaleString("es-AR"),
    };
  }, [data]);

  return {
    data,
    chartData,
    loading,
    error,
    filter,
    setFilter,
    filters: Object.entries(FILTER_LABELS).map(([key, label]) => ({
      key: key as MetricasFilter,
      label,
    })),
    refresh: () => void loadMetricas(filter),
  };
}
