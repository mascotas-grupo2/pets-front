"use client";

import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export type DoughnutChartProps = {
  data: ChartData<"doughnut">;
  options?: ChartOptions<"doughnut">;
  height?: number;
  centerLabel?: string;
};

const DEFAULT_OPTIONS: ChartOptions<"doughnut"> = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: "75%",
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
    },
  },
};

export function DoughnutChart({
  data,
  options,
  height = 220,
}: DoughnutChartProps) {
  // Normalizamos los datasets para agregar bordes redondeados y un ligero espaciado
  const normalizedData: ChartData<"doughnut"> = {
    ...data,
    datasets: data.datasets.map((ds) => ({
      ...ds,
      borderRadius: 10, // Controla qué tan redondeadas son las puntas
      spacing: 0, // Espacio entre segmentos para que el redondeo sea visible
      borderWidth: 2, // Quitamos el borde por defecto para un look más limpio
    })),
  };

  return (
    <div style={{ height }} className="chart-wrapper chart-wrapper--center">
      <Doughnut
        data={normalizedData}
        options={{ ...DEFAULT_OPTIONS, ...options }}
      />
    </div>
  );
}
