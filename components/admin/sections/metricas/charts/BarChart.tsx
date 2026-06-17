"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export type BarChartProps = {
  data: ChartData<"bar">;
  options?: ChartOptions<"bar">;
  height?: number;
};

const DEFAULT_OPTIONS: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: "#1e1b2e",
      titleColor: "#ffffff",
      bodyColor: "#c4b5fd",
      borderColor: "rgba(255,255,255,0.12)",
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
      callbacks: {
        label: (ctx) =>
          ` ${ctx.dataset.label ?? ctx.label}: ${(ctx.parsed.y ?? 0).toLocaleString("es-AR")}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: { color: "rgba(128,128,128,0.15)" },
      ticks: {
        color: "#888",
        font: { size: 11 },
        callback: (v) => Number(v).toLocaleString("es-AR"),
      },
      border: { display: false },
    },
    x: {
      grid: { display: false },
      ticks: { color: "#888", font: { size: 11 } },
      border: { display: false },
    },
  },
};

export function BarChart({ data, options, height = 280 }: BarChartProps) {
  // Normalizamos colores: si vienen con opacidad hex ("20"), los hacemos rgba sólidos
  const normalizedData: ChartData<"bar"> = {
    ...data,
    datasets: data.datasets.map((ds) => ({
      ...ds,
      backgroundColor: Array.isArray(ds.backgroundColor)
        ? (ds.backgroundColor as string[]).map((c) =>
            c.length === 9 ? c.slice(0, 7) + "55" : c
          )
        : ds.backgroundColor,
      borderWidth: 0,
      borderRadius: 6,
    })),
  };

  return (
    <div style={{ height, width: "100%" }}>
      <Bar data={normalizedData} options={{ ...DEFAULT_OPTIONS, ...options }} />
    </div>
  );
}
