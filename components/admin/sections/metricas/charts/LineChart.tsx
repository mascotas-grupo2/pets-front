"use client";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

export type LineChartProps = {
  data: ChartData<"line">;
  options?: ChartOptions<"line">;
  height?: number;
};

const DEFAULT_OPTIONS: ChartOptions<"line"> = {
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
          ` ${ctx.dataset.label ?? "Valor"}: ${ctx.parsed.y && ctx.parsed.y.toLocaleString("es-AR")}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: false,
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
  elements: {
    line: { tension: 0.35, borderWidth: 2 },
    point: { radius: 3, hoverRadius: 6, borderWidth: 0 },
  },
};

export function LineChart({ data, options, height = 280 }: LineChartProps) {
  // Garantizamos que el fill y backgroundColor sean rgba, no hex+"20"
  const normalizedData: ChartData<"line"> = {
    ...data,
    datasets: data.datasets.map((ds) => ({
      ...ds,
      fill: true,
      backgroundColor:
        typeof ds.borderColor === "string"
          ? ds.borderColor.replace(/^#([0-9a-f]{6})$/i, (_, hex) => {
              const r = parseInt(hex.slice(0, 2), 16);
              const g = parseInt(hex.slice(2, 4), 16);
              const b = parseInt(hex.slice(4, 6), 16);
              return `rgba(${r},${g},${b},0.12)`;
            })
          : ds.backgroundColor,
    })),
  };

  return (
    <div style={{ height, width: "100%" }}>
      <Line data={normalizedData} options={{ ...DEFAULT_OPTIONS, ...options }} />
    </div>
  );
}
