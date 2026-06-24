"use client";

import type { ReactNode } from "react";
import type { ChartData } from "chart.js";

export type MetricasFilter = "7d" | "30d" | "90d" | "1y";

export type StatCard = {
  label: string;
  value: string;
  icon: ReactNode;
  color: string;
  change: number;
  hint: string;
};

export type TopPublicacion = {
  titulo: string;
  comentarios: number;
  estado: string;
  vistas: number;
  avatar?: string;
};

export type CategoriaMapa =
  | "perdida"
  | "adopcion"
  | "refugio"
  | "transito"
  | "otros";

export type UbicacionMapa = {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  /** Categoría que define el color del pin (derivada del estado). */
  tipo: CategoriaMapa;
  /** Estado real para el popup (ej. "perdido", "en adopción"). */
  estado?: string;
  /** Especie/animal para el popup (ej. "perro"). */
  especie?: string;
};

export type MetricasData = {
  statCards: StatCard[];
  mascotasPorEstado: ChartData<"doughnut">;
  solicitudesPorEstado: ChartData<"doughnut">;
  seguimientosPorEstado: ChartData<"doughnut">;
  usuariosRegistrados: ChartData<"line">;
  mascotasPorTipo: ChartData<"bar">;
  topPublicaciones: TopPublicacion[];
  ubicaciones: UbicacionMapa[];
};

const C = {
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

export function getMetricasData(filter: MetricasFilter = "30d"): MetricasData {
  void filter;

  return {
    statCards: [
      {
        label: "Mascotas publicadas",
        value: "1.248",
        icon: null,
        color: "#7c3aed",
        change: 12.5,
        hint: "vs mes anterior",
      },
      {
        label: "Mascotas adoptadas",
        value: "342",
        icon: null,
        color: "#22c55e",
        change: 18.3,
        hint: "vs mes anterior",
      },
      {
        label: "Mascotas perdidas",
        value: "312",
        icon: null,
        color: "#f59e0b",
        change: 5.2,
        hint: "vs mes anterior",
      },
      {
        label: "Tasa de adopción",
        value: "27.4%",
        icon: null,
        color: "#3b82f6",
        change: 6.1,
        hint: "vs mes anterior",
      },
      {
        label: "Seguimientos pendientes",
        value: "56",
        icon: null,
        color: "#ec4899",
        change: 7.8,
        hint: "vs mes anterior",
      },
      {
        label: "Usuarios registrados",
        value: "892",
        icon: null,
        color: "#06b6d4",
        change: 15.9,
        hint: "vs mes anterior",
      },
    ],

    mascotasPorEstado: {
      labels: [
        "Perdida",
        "Encontrada",
        "En refugio",
        "En adopción",
        "Adoptada",
      ],
      datasets: [
        {
          data: [312, 386, 178, 201, 171],
          backgroundColor: [C.blue, C.green, C.amber, C.violet, C.rose],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },

    solicitudesPorEstado: {
      labels: [
        "Pendiente",
        "En evaluación",
        "Aprobada",
        "Rechazada",
        "Cancelada",
      ],
      datasets: [
        {
          data: [124, 156, 98, 31, 16],
          backgroundColor: [C.amber, C.blue, C.green, C.rose, C.cyan],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },

    seguimientosPorEstado: {
      labels: ["Pendiente", "Confirmado", "Completado", "Cancelado"],
      datasets: [
        {
          data: [56, 82, 63, 10],
          backgroundColor: [C.amber, C.blue, C.green, C.rose],
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },

    usuariosRegistrados: {
      labels: ["Dic", "Ene", "Feb", "Mar", "Abr", "May"],
      datasets: [
        {
          label: "Usuarios",
          data: [90, 95, 100, 110, 125, 140],
          borderColor: C.violet,
          backgroundColor: C.violet + "20",
          fill: true,
          tension: 0.35,
          pointBackgroundColor: C.violet,
          pointRadius: 4,
        },
      ],
    },

    mascotasPorTipo: {
      labels: ["Perros", "Gatos", "Otros"],
      datasets: [
        {
          label: "Publicadas",
          data: [726, 412, 110],
          backgroundColor: [C.violet + "30", C.amber + "30", C.cyan + "30"],
          borderColor: [C.violet, C.amber, C.cyan],
          borderWidth: 2,
          borderRadius: 8,
          barThickness: 60,
        },
      ],
    },

    topPublicaciones: [
      {
        titulo: "Luna - Perdida en Barrio Norte",
        vistas: 2145,
        comentarios: 34,
        estado: "Activa",
        avatar: "https://placedog.net/200/200?id=1",
      },
      {
        titulo: "Simba - Encontrado en Parque Central",
        vistas: 1876,
        comentarios: 21,
        estado: "Activa",
        avatar: "https://placedog.net/200/200?id=2",
      },
      {
        titulo: "Max - En adopción responsable",
        vistas: 1532,
        comentarios: 18,
        estado: "En proceso",
        avatar: "https://placedog.net/200/200?id=3",
      },
      {
        titulo: "Michi - Encontrada en Av. Siempre Viva",
        vistas: 1245,
        comentarios: 12,
        estado: "Activa",
        avatar: "https://placedog.net/200/200?id=4",
      },
      {
        titulo: "Rocky - En refugio",
        vistas: 1102,
        comentarios: 9,
        estado: "Adoptado",
        avatar: "https://placedog.net/200/200?id=5",
      },
    ],

    ubicaciones: [
      {
        id: "1",
        nombre: "Luna",
        lat: -34.6037,
        lng: -58.3816,
        tipo: "perdida",
      },
      {
        id: "2",
        nombre: "Mimi",
        lat: -34.6158,
        lng: -58.4333,
        tipo: "adopcion",
      },
      {
        id: "3",
        nombre: "Rocky",
        lat: -34.5868,
        lng: -58.3923,
        tipo: "adopcion",
      },
      {
        id: "4",
        nombre: "Refugio Central",
        lat: -34.6049,
        lng: -58.3695,
        tipo: "refugio",
      },
      {
        id: "5",
        nombre: "Simba",
        lat: -34.6289,
        lng: -58.4466,
        tipo: "perdida",
      },
    ],
  };
}
